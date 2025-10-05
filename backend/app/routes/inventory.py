from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.inventory import InventoryCreate, InventoryRead, InventoryUpdate
from typing import List
from datetime import datetime

router = APIRouter(prefix="/inventory", tags=["Inventory"])


# ---- Összes raktárbejegyzés lekérése ----
@router.get("/", response_model=List[InventoryRead])
def get_all_inventory(db: Session = Depends(get_db)):
    return db.query(models.Inventory).all()


# ---- Egy adott bejegyzés lekérése ----
@router.get("/{inventory_id}", response_model=InventoryRead)
def get_inventory(inventory_id: int, db: Session = Depends(get_db)):
    inv = db.query(models.Inventory).filter(models.Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    return inv


# ---- Új raktárbejegyzés létrehozása ----
@router.post("/", response_model=InventoryRead)
def create_inventory(inv_data: InventoryCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == inv_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inv = models.Inventory(
        product_id=inv_data.product_id,
        location=inv_data.location,
        quantity=inv_data.quantity
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


# ---- Készlet módosítása (pl. csökkenés/raktárváltás) ----
@router.patch("/{inventory_id}", response_model=InventoryRead)
def update_inventory(inventory_id: int, update_data: InventoryUpdate, db: Session = Depends(get_db)):
    inv = db.query(models.Inventory).filter(models.Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    if update_data.quantity is not None:
        inv.quantity = update_data.quantity
    if update_data.location is not None:
        inv.location = update_data.location

    inv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(inv)
    return inv


# ---- Raktárbejegyzés törlése ----
@router.delete("/{inventory_id}")
def delete_inventory(inventory_id: int, db: Session = Depends(get_db)):
    inv = db.query(models.Inventory).filter(models.Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    db.delete(inv)
    db.commit()
    return {"message": "Inventory record deleted"}
