from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.utils.security import verify_password, create_access_token
from app.database import get_db
from app import models

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user.user_id, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
