from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.user import UserCreate, UserRead
from app.utils.security import hash_password, get_current_admin, get_current_user
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

# ---- GET: összes user (csak admin láthatja) ----
@router.get("/", response_model=List[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)  # csak admin
):
    return db.query(models.User).all()

# ---- GET: user ID alapján (csak bejelentkezett user) ----
@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ---- POST: regisztráció ----
@router.post("/", response_model=UserRead)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user_data.password)
    db_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pw,
        phone=user_data.phone,
        address=user_data.address,
        role=user_data.role,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user