from pydantic import BaseModel
from typing import List
from datetime import datetime

class CartItemBase(BaseModel):
    product_id: int
    quantity: float

class CartItemCreate(CartItemBase):
    pass

class CartItemRead(CartItemBase):
    cart_item_id: int

    class Config:
        orm_mode = True


class CartBase(BaseModel):
    user_id: int

class CartCreate(CartBase):
    pass

class CartRead(CartBase):
    cart_id: int
    created_at: datetime
    items: List[CartItemRead] = []

    class Config:
        orm_mode = True
