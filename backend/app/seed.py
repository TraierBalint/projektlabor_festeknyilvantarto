import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from datetime import datetime
from app import models
from app.utils.security import hash_password  # <-- fontos!


def seed_data():
    db: Session = SessionLocal()
    try:
        # ensure all tables exist before seeding
        Base.metadata.create_all(bind=engine)
        # --- Users ---
        if db.query(models.User).count() == 0:
            users = [
                models.User(
                    name="Admin",
                    email="admin@example.com",
                    password_hash=hash_password("admin123"),
                    phone="00000000",
                    address="Admin street 1",
                    role=models.UserRole.admin,
                ),
                models.User(
                    name="John Doe",
                    email="John.doe@example.com",
                    password_hash=hash_password("user1234"),
                    phone="+36204203552",
                    address="Forgách utca 21.",
                    role=models.UserRole.user,
                ),
                models.User(
                    name="Alice Smith",
                    email="alice.smith@example.com",
                    password_hash=hash_password("user2345"),
                    phone="+36704526718",
                    address="Kossuth Lajos utca 10.",
                    role=models.UserRole.user,
                ),
            ]
            db.add_all(users)
            db.flush()  # assign PKs
            print("Users seeded")

        # --- Products ---
        if db.query(models.Product).count() == 0:
            products = [
                models.Product(name="Belső falfesték fehér", price=4500, stock_quantity=50, unit="liter"),
                models.Product(name="Külső falfesték", price=6200, stock_quantity=30, unit="liter"),
                models.Product(name="Zománcfesték", price=3200, stock_quantity=25, unit="liter"),
                models.Product(name="Alapozó", price=3800, stock_quantity=40, unit="liter"),
                models.Product(name="Ecset készlet", price=2500, stock_quantity=80, unit="db"),
                models.Product(name="Festőhenger", price=1800, stock_quantity=60, unit="db"),
                models.Product(name="Festékhígító", price=1500, stock_quantity=45, unit="liter"),
                models.Product(name="Maszkolószalag", price=700, stock_quantity=150, unit="db"),
                models.Product(name="Festékkeverő gép (kis)", price=15000, stock_quantity=5, unit="db"),
            ]
            db.add_all(products)
            db.flush()
            print("Products seeded")

        # --- Colors ---
        if db.query(models.Color).count() == 0:
            colors = [
                models.Color(name="Piros", hex_code="#FF0000", rgb_code="255,0,0"),
                models.Color(name="Zöld", hex_code="#00FF00", rgb_code="0,255,0"),
                models.Color(name="Kék", hex_code="#0000FF", rgb_code="0,0,255"),
                models.Color(name="Fehér", hex_code="#FFFFFF", rgb_code="255,255,255"),
                models.Color(name="Fekete", hex_code="#000000", rgb_code="0,0,0"),
                models.Color(name="Sárga", hex_code="#FFFF00", rgb_code="255,255,0"),
                models.Color(name="Narancs", hex_code="#FFA500", rgb_code="255,165,0"),
            ]
            db.add_all(colors)
            db.flush()
            print("Colors seeded")

        # --- Mixes ---
        if db.query(models.Mix).count() == 0:
            # use existing users for user_id references
            first_user = db.query(models.User).filter_by(email="user1@example.com").first()
            second_user = db.query(models.User).filter_by(email="user2@example.com").first()
            mixes = [
                models.Mix(user_id=first_user.user_id if first_user else None, name="Türkiz", created_at=datetime(2023, 10, 1, 10, 0, 0)),
                models.Mix(user_id=second_user.user_id if second_user else None, name="Lila", created_at=datetime(2023, 10, 2, 11, 0, 0)),
            ]
            db.add_all(mixes)
            db.flush()
            print("Mixes seeded")

        # --- Mix Components ---
        if db.query(models.MixComponent).count() == 0:
            # find a mix and colors
            mix1 = db.query(models.Mix).filter_by(name="Türkiz").first()
            color_green = db.query(models.Color).filter_by(name="Zöld").first()
            color_blue = db.query(models.Color).filter_by(name="Kék").first()
            mix_components = []
            if mix1 and color_green and color_blue:
                mix_components = [
                    models.MixComponent(mix_id=mix1.mix_id, color_id=color_green.color_id, ratio=0.5),
                    models.MixComponent(mix_id=mix1.mix_id, color_id=color_blue.color_id, ratio=0.5),
                ]
                db.add_all(mix_components)
                db.flush()
                print("MixComponents seeded")

        # --- Inventory ---
        if db.query(models.Inventory).count() == 0:
            # associate inventory with created products
            p_all = db.query(models.Product).all()
            inventory_items = []
            locations = ["Raktár-1", "Raktár-2", "Raktár-3"]
            for i, p in enumerate(p_all, start=1):
                inventory_items.append(models.Inventory(product_id=p.product_id, location=locations[i % len(locations)], quantity=p.stock_quantity, updated_at=datetime(2023, 10, 1, 9, 0, 0)))
            db.add_all(inventory_items)
            db.flush()
            print("Inventory seeded")

        # --- Orders & OrderItems ---
        if db.query(models.Order).count() == 0:
            # create example orders for users
            admin = db.query(models.User).filter_by(email="admin@example.com").first()
            user1 = db.query(models.User).filter_by(email="user1@example.com").first()
            products_for_order = db.query(models.Product).limit(4).all()

            orders = []
            if user1:
                orders.append(models.Order(user_id=user1.user_id, status=models.OrderStatus.paid, total_price=products_for_order[0].price * 2 if products_for_order else 0, created_at=datetime(2023,10,5,12,0,0)))
            if admin:
                orders.append(models.Order(user_id=admin.user_id, status=models.OrderStatus.pending, total_price=products_for_order[1].price if len(products_for_order)>1 else 0, created_at=datetime(2023,10,6,13,0,0)))

            db.add_all(orders)
            db.flush()

            # create order items referencing the created orders and products
            created_orders = db.query(models.Order).order_by(models.Order.created_at).all()
            order_items = []
            for o in created_orders:
                # attach up to 2 products per order
                for idx, prod in enumerate(products_for_order[:2]):
                    qty = 2 if idx == 0 else 1
                    order_items.append(models.OrderItem(order_id=o.order_id, product_id=prod.product_id, quantity=qty, unit_price=prod.price))

            if order_items:
                db.add_all(order_items)
                db.flush()
                print("Orders and OrderItems seeded")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_data()
    print("Database seeding complete!")
