from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    product_id: int
    location: Optional[str] = None
    quantity: float

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[float] = None
    location: Optional[str] = None

class InventoryRead(InventoryBase):
    inventory_id: int
    updated_at: datetime

    class Config:
        orm_mode = True
