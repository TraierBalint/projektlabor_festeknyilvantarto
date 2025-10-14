import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from datetime import datetime
from app import models
from app.utils.security import hash_password  # <-- fontos!

def seed_data():
    db: Session = SessionLocal()

    # --- Users ---
    if db.query(models.User).count() == 0:
        users = [
            models.User(
                name="Admin",
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                phone="00000000",
                address="Admin street 1",
                role="admin"
            ),
            models.User(
                name="User",
                email="user@example.com",
                password_hash=hash_password("user123"),
                phone="11111111",
                address="User street 2",
                role="user"
            ),
        ]
        db.add_all(users)
        print("Users seeded")

    # --- Products ---
    if db.query(models.Product).count() == 0:
        products = [
            models.Product(name="Piros", price=300),
            models.Product(name="Zöld", price=400),
        ]
        db.add_all(products)
        print("Products seeded")

    db.commit()
    db.close()
    
    if db.query(models.Color).count() == 0:
        colors = [
            models.Color(name="Piros", hex_code="#FF0000", rgb_code="255,0,0"),
            models.Color(name="Zöld", hex_code="#00FF00", rgb_code="0,255,0"),
            models.Color(name="Kék", hex_code="#0000FF", rgb_code="0,0,255"),
        ]
        db.add_all(colors)
        print("Colors seeded")
        
    db.commit()
    db.close()
    
    if db.query(models.Mix).count() == 0:
        mixes = [
            models.Mix(mix_id=1, user_id=1, name="Türkiz", created_at=datetime(2023, 10, 1, 10, 0, 0)),
            models.Mix(mix_id=2, user_id=2, name="Lila", created_at=datetime(2023, 10, 2, 11, 0, 0)),
        ]
        db.add_all(mixes)
        print("Mixes seeded")

    db.commit()
    db.close()
    
    if db.query(models.MixComponent).count() == 0:
        mix_components = [
            models.MixComponent(mix_id=1, color_id=2, ratio=0.5),  # 50% Zöld
            models.MixComponent(mix_id=1, color_id=3, ratio=0.5),  # 50% Kék
        ]
        db.add_all(mix_components)
        print("MixComponents seeded")

    db.commit()
    db.close()
    
    if db.query(models.Inventory).count() == 0:
        inventory_items = [
            models.Inventory(inventory_id=1, product_id=1, location="Storage 1", quantity=100, updated_at=datetime(2023, 10, 1, 9, 0, 0)),
            models.Inventory(inventory_id=2, product_id=2, location="Storage 2", quantity=150, updated_at=datetime(2023, 10, 1, 9, 0, 0)),
        ]
        db.add_all(inventory_items)
        print("Inventory seeded")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()
    print("Database seeding complete!")
