from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.order import OrderCreate, OrderRead, OrderItemCreate, OrderStatusUpdate, OrderStatus
from app.utils.security import get_current_admin, get_current_user

#---- Import email küldéshez szükséges függvény ----
from fastapi_mail import FastMail, MessageSchema
from app.utils.email_utils import conf

def build_completed_order_html(user_name: str, order_id: int, items: list, total: float):
    items_html = ""

    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">{item.product.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:center;">{item.quantity} db</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">{item.unit_price:.0f} Ft</td>
        </tr>
        """

    return f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f5f5;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color:#4CAF50;">Rendelés teljesítve</h2>
            <p>Kedves <strong>{user_name}</strong>,</p>
            <p>Örömmel értesítünk, hogy a <strong>#{order_id}</strong> számú rendelésedet sikeresen teljesítettük.</p>

            <h3>Rendelés részletei:</h3>

            <table style="width:100%; border-collapse: collapse;">
                <tr style="background:#f0f0f0;">
                    <th style="padding: 10px; text-align:left;">Termék</th>
                    <th style="padding: 10px; text-align:center;">Mennyiség</th>
                    <th style="padding: 10px; text-align:right;">Ár</th>
                </tr>
                {items_html}
            </table>

            <h3 style="text-align:right; margin-top:20px;">
                Összesen: {total:.0f} Ft
            </h3>

            <p>Köszönjük a vásárlást!</p>

            <div style="text-align:center; margin-top:40px; color:#888;">
                <small>Ez egy automatikusan generált üzenet. Kérjük, ne válaszolj rá.</small>
            </div>
        </div>
    </div>
    """


async def send_order_completed_email(db: Session, user: models.User, order: models.Order):
    # rendelés tételei
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.order_id).all()

    html_content = build_completed_order_html(
        user_name=user.name,
        order_id=order.order_id,
        items=items,
        total=order.total_price
    )

    message = MessageSchema(
        subject=f"Rendelés #{order.order_id} teljesítve",
        recipients=[user.email],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


router = APIRouter(prefix="/orders", tags=["Orders"])


# ---- Rendelés létrehozása ----
@router.post("/", response_model=OrderRead)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.user_id == order_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if current_user.role.value != "admin" and order_data.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only create orders for yourself")

    # kosár kikeresése
    cart = db.query(models.Cart).filter(models.Cart.cart_id == order_data.cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    if cart.ordered:
        raise HTTPException(status_code=400, detail="Cart has already been ordered")
    if cart.user_id != order_data.user_id:
        raise HTTPException(status_code=400, detail="Cart does not belong to the user")

    # kosár elemek lekérése
    cart_items = db.query(models.CartItem).filter(models.CartItem.cart_id == cart.cart_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # összeg kiszámolása és rendelés létrehozása
    total_price = sum(item.quantity * item.product.price for item in cart_items)
    order = models.Order(user_id=order_data.user_id, total_price=total_price)

    db.add(order)
    db.commit()
    db.refresh(order)

    # rendelés tételek hozzáadása
    for item in cart_items:
        order_item = models.OrderItem(
            order_id=order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price
        )
        db.add(order_item)

    # kosarat lezárjuk
    cart.ordered = True
    db.commit()
    db.refresh(order)

    return order

# ---- Összes rendelés lekérése ----
@router.get("/", response_model=list[OrderRead])
def get_all_orders(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    return db.query(models.Order).all()


# ---- Felhasználó rendeléseinek lekérése ----
@router.get("/user/{user_id}", response_model=list[OrderRead])
def get_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.value != "admin" and user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

# ---- Egy rendelés lekérése ----
@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role.value != "admin" and order.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    
    return order

# ---- Rendelés tételeinek lekérése ----
@router.get("/{order_id}/items", response_model=list[OrderItemCreate])
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role.value != "admin" and order.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only view your own orders")
    
    return db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()

# ---- Státusz frissítése ----
@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int, 
    status_data: OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()
    db.refresh(order)

    # email küldése a felhasználónak a státusz változásról
    user = db.query(models.User).filter(models.User.user_id == order.user_id).first()
    if status_data.status == "completed":
        background_tasks.add_task(send_order_completed_email, db, user, order)
    return order


# ---- Rendelés törlése ----
@router.delete("/{order_id}")
def delete_order(
    order_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
