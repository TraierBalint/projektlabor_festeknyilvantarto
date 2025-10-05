from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# -- Enum egyezzen a models.UserRole-lal --
class UserRole(str, Enum):
    user = "user"
    admin = "admin"

# -- Alap séma --
class UserBase(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[UserRole] = UserRole.user

# -- Regisztrációhoz: jelszó kell --
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# -- Bejelentkezéshez --
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# -- API válaszhoz (ne tartalmazza a jelszót) --
class UserRead(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True
