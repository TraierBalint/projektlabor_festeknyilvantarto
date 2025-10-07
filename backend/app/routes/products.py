from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.product import ProductCreate, ProductRead, ProductBase
from app.utils.security import get_current_admin
from typing import List

router = APIRouter(prefix="/products", tags=["Products"])

# Create
@router.post("/", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Read all
@router.get("/", response_model=List[ProductRead])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

# Read one
@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Search
# Example: /products/search/?name=paint&category=interior
@router.get("/search/", response_model=List[ProductRead])
def search_products(name: str | None = None, category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(models.Product.category.ilike(f"%{category}%"))
    return query.all()

# Update
@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, updated_data: ProductBase, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in updated_data.dict().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

# Delete
@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return