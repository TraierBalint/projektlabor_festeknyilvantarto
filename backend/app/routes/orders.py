from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.order import OrderCreate, OrderRead, OrderItemCreate, OrderStatusUpdate, OrderStatus
from app.utils.security import get_current_admin, get_current_user

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
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
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
