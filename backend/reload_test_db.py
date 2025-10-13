#!/usr/bin/env python3
"""
Test Database Reload Script

Ez a script törli a jelenlegi test.db-t és újratölti a sample adatokkal:
- sample_data_users.json
- sample_data_colors.json  
- sample_data_products.csv
"""

import os
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.append(str(Path(__file__).parent))

from app.data_loader import DatabaseLoader
from app.database import engine, SessionLocal
from app.models import Base


def clear_database():
    """Törli az összes táblát és újra létrehozza őket."""
    print("Adatbázis törlése...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Recreate all tables  
    Base.metadata.create_all(bind=engine)
    
    print("✓ Adatbázis táblák újra létrehozva")


def load_sample_data():
    """Betölti a sample adatokat a fájlokból."""
    print("Sample adatok betöltése...")
    
    # A sample fájlok elérési útjai
    data_dir = Path(__file__).parent / "data_loading_examples"
    
    files_to_load = [
        (data_dir / "sample_data_users.json", "users"),
        (data_dir / "sample_data_colors.json", "colors"),
        (data_dir / "sample_data_products.csv", "products")
    ]
    
    with DatabaseLoader() as loader:
        for file_path, entity_type in files_to_load:
            if file_path.exists():
                print(f"  Betöltés: {file_path.name} ({entity_type})")
                success = loader.load_data_from_file(str(file_path), entity_type)
                if success:
                    print(f"  ✓ Sikeresen betöltve: {entity_type}")
                else:
                    print(f"  ✗ Hiba történt: {entity_type}")
                    return False
            else:
                print(f"  ✗ Fájl nem található: {file_path}")
                return False
    
    return True


def show_statistics():
    """Megmutatja az adatbázis statisztikákat."""
    print("\nAdatbázis statisztikák:")
    
    db = SessionLocal()
    try:
        from app.models import User, Product, Color
        
        user_count = db.query(User).count()
        product_count = db.query(Product).count()
        color_count = db.query(Color).count()
        
        print(f"  Felhasználók: {user_count}")
        print(f"  Termékek: {product_count}")
        print(f"  Színek: {color_count}")
        
    finally:
        db.close()


def main():
    """Főprogram: törli és újratölti a test.db-t."""
    print("=== Test.db újratöltése sample adatokkal ===\n")
    
    try:
        # 1. Adatbázis törlése és újralétrehozása
        clear_database()
        
        # 2. Sample adatok betöltése
        success = load_sample_data()
        
        if success:
            print("\n✓ Minden adat sikeresen betöltve!")
            
            # 3. Statisztikák megjelenítése
            show_statistics()
            
            print(f"\n✓ test.db sikeresen frissítve!")
            
        else:
            print("\n✗ Hiba történt az adatok betöltése során")
            return 1
            
    except Exception as e:
        print(f"\n✗ Hiba történt: {str(e)}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())