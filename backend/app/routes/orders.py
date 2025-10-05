from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.order import OrderCreate, OrderRead, OrderItemCreate, OrderStatusUpdate, OrderStatus


router = APIRouter(prefix="/orders", tags=["Orders"])


# ---- Rendelés létrehozása ----
@router.post("/", response_model=OrderRead)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == order_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # kiszámoljuk az összesített árat
    total_price = 0
    order_items = []
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.product_id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        total_price += product.price * item.quantity
        order_items.append(
            models.OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.price
            )
        )

    # létrehozzuk a rendelést
    order = models.Order(
        user_id=order_data.user_id,
        total_price=total_price
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # hozzárendeljük az itemeket
    for item in order_items:
        item.order_id = order.order_id
        db.add(item)

    db.commit()
    db.refresh(order)

    return order


# ---- Összes rendelés lekérése ----
@router.get("/", response_model=list[OrderRead])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()


# ---- Egy rendelés lekérése ----
@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ---- Státusz frissítése ----
@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(order_id: int, status_data: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return order


# ---- Rendelés törlése ----
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
