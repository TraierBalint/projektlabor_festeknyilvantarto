from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.cart import CartCreate, CartRead, CartItemCreate, CartItemRead
from app.utils.security import get_current_user

router = APIRouter(prefix="/carts", tags=["Carts"])


# ---- Kosár létrehozása ----
@router.post("/", response_model=CartRead)
def create_cart(cart_data: CartCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == cart_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    cart = models.Cart(user_id=cart_data.user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


# ---- Termék hozzáadása ----
@router.post("/{cart_id}/items", response_model=CartItemRead)
def add_item(
    cart_id: int,
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if current_user.role.value != "admin" and cart.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only modify your own cart")

    product = db.query(models.Product).filter(models.Product.product_id == item_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # ha már van ilyen termék, növeljük a quantity-t
    existing_item = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart_id, models.CartItem.product_id == item_data.product_id)
        .first()
    )
    if existing_item:
        existing_item.quantity += item_data.quantity
    else:
        new_item = models.CartItem(
            cart_id=cart_id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return existing_item or new_item


# ---- Kosár lekérése ----
@router.get("/{cart_id}", response_model=CartRead)
def get_cart(
    cart_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    if current_user.role.value != "admin" and cart.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only view your own cart")
    return cart

# --- Felhasználó aktív kosarának lekérése ---
@router.get("/user/{user_id}/active", response_model=CartRead)
def get_active_cart(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.value != "admin" and current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail=f"You can only view your own cart {current_user.user_id}")

    cart = (
        db.query(models.Cart)
        .filter(models.Cart.user_id == user_id, models.Cart.ordered == False)
        .order_by(models.Cart.created_at.desc())
        .first()
    )
    if not cart:
        raise HTTPException(status_code=404, detail="No active cart found for this user")
    return cart


# ---- Termék eltávolítása ----
@router.delete("/{cart_id}/items/{item_id}")
def delete_item(
    cart_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    if current_user.role.value != "admin" and cart.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only modify your own cart")

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart_id, models.CartItem.cart_item_id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed"}


# ---- Kosár törlése ----
@router.delete("/{cart_id}")
def delete_cart(
    cart_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if current_user.role.value != "admin" and cart.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own cart")

    db.delete(cart)
    db.commit()
    return {"message": "Cart deleted"}
