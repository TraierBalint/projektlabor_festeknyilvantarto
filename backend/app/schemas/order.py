from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    pending = "pending"
    shipped = "shipped"
    completed = "completed"
    cancelled = "cancelled"


class OrderItemBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    order_item_id: int

    class Config:
        orm_mode = True



class OrderBase(BaseModel):
    user_id: int

class OrderCreate(OrderBase):
    cart_id: int

class OrderRead(OrderBase):
    order_id: int
    status: OrderStatus
    total_price: float
    created_at: datetime

    class Config:
        orm_mode = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
