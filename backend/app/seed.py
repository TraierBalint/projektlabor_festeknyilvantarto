import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
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
            models.Product(name="Alma", price=300),
            models.Product(name="Banán", price=400),
        ]
        db.add_all(products)
        print("Products seeded")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()
    print("Database seeding complete!")
