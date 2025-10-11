#!/usr/bin/env python3
"""
Database Loader Example Scripts

This script demonstrates how to use the DatabaseLoader to load data
into the paint inventory management system.
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent))

from app.data_loader import DatabaseLoader, load_from_file, load_data
from app.data_loader_utils import AdvancedDataLoader, load_with_sample_data, export_database, get_stats
from app.database import engine
from app.models import Base


def setup_database():
    """Create all database tables."""
    print("Setting up database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def example_1_load_sample_data():
    """Example 1: Load generated sample data."""
    print("\n=== Example 1: Loading Sample Data ===")
    
    success = load_with_sample_data(num_users=5, num_products=10, num_colors=8)
    
    if success:
        print("✓ Sample data loaded successfully!")
        
        # Show statistics
        stats = get_stats()
        print("\nDatabase Statistics:")
        for entity_type, count in stats.items():
            print(f"  {entity_type}: {count} records")
    else:
        print("✗ Failed to load sample data")


def example_2_load_from_files():
    """Example 2: Load data from JSON/CSV files."""
    print("\n=== Example 2: Loading from Files ===")
    
    # First, let's create some sample data files
    create_sample_data_files()
    
    # Load users from JSON
    users_file = "data_loading_examples/sample_users.json"
    success = load_from_file(users_file, "users")
    print(f"Users loaded: {'✓' if success else '✗'}")
    
    # Load products from CSV
    products_file = "data_loading_examples/sample_products.csv"
    success = load_from_file(products_file, "products")
    print(f"Products loaded: {'✓' if success else '✗'}")


def example_3_advanced_loading():
    """Example 3: Advanced loading with transformations and validation."""
    print("\n=== Example 3: Advanced Loading ===")
    
    with AdvancedDataLoader() as loader:
        # Register transformations
        from app.data_loader_utils import DataTransformers, DataValidators
        
        loader.register_transformation('users', DataTransformers.normalize_email)
        loader.register_transformation('products', DataTransformers.format_price)
        loader.register_validation_rule('users', DataValidators.validate_user)
        loader.register_validation_rule('products', DataValidators.validate_product)
        
        # Load data with custom rules
        user_data = [
            {
                "name": "John Doe",
                "email": "JOHN.DOE@EXAMPLE.COM",  # Will be normalized to lowercase
                "password": "password123",
                "role": "user"
            },
            {
                "name": "Jane Smith", 
                "email": "jane.smith@example.com",
                "password": "securepass",
                "role": "admin"
            }
        ]
        
        success = loader.load_entity_data_with_transform('users', user_data)
        print(f"Advanced user loading: {'✓' if success else '✗'}")


def example_4_batch_loading_with_relationships():
    """Example 4: Load multiple related entities in correct order."""
    print("\n=== Example 4: Batch Loading with Relationships ===")
    
    # Create data files
    create_sample_data_files()
    
    data_files = {
        'users': 'data_loading_examples/sample_users.json',
        'products': 'data_loading_examples/sample_products.csv',
        'colors': 'data_loading_examples/sample_colors.json'
    }
    
    with AdvancedDataLoader() as loader:
        success = loader.load_with_relationships(data_files)
        print(f"Batch loading: {'✓' if success else '✗'}")


def example_5_data_export():
    """Example 5: Export database data to files."""
    print("\n=== Example 5: Data Export ===")
    
    output_dir = "data_loading_examples/exports"
    
    # Export as JSON
    success = export_database(output_dir, format='json')
    print(f"JSON export: {'✓' if success else '✗'}")
    
    # Export as CSV
    success = export_database(f"{output_dir}_csv", format='csv')
    print(f"CSV export: {'✓' if success else '✗'}")


def example_6_data_validation():
    """Example 6: Validate data without loading."""
    print("\n=== Example 6: Data Validation ===")
    
    # Test data with some invalid records
    test_users = [
        {"name": "Valid User", "email": "valid@example.com", "password": "password123"},
        {"name": "", "email": "invalid", "password": "123"},  # Invalid: short password, bad email
        {"email": "missing@name.com", "password": "password123"},  # Invalid: missing name
        {"name": "Another Valid", "email": "another@example.com", "password": "validpass"}
    ]
    
    with DatabaseLoader() as loader:
        results = loader.validate_data('users', test_users)
        print(f"Validation results: {results}")


def create_sample_data_files():
    """Create sample data files for examples."""
    import json
    import csv
    
    # Sample users (JSON)
    users_data = [
        {
            "name": "Alice Johnson",
            "email": "alice@example.com", 
            "password": "password123",
            "phone": "+1234567890",
            "address": "123 Main St, City, State",
            "role": "user"
        },
        {
            "name": "Bob Smith",
            "email": "bob@example.com",
            "password": "securepass",
            "phone": "+1987654321", 
            "address": "456 Oak Ave, City, State",
            "role": "admin"
        }
    ]
    
    with open("data_loading_examples/sample_users.json", "w") as f:
        json.dump(users_data, f, indent=2)
    
    # Sample products (CSV)
    products_data = [
        {
            "name": "Red Paint",
            "description": "High-quality red paint for interior use",
            "category": "Paint",
            "price": 25.99,
            "stock_quantity": 50,
            "unit": "liter"
        },
        {
            "name": "Blue Paint", 
            "description": "Vibrant blue paint for exterior use",
            "category": "Paint",
            "price": 28.50,
            "stock_quantity": 30,
            "unit": "liter"
        },
        {
            "name": "Paint Brush Set",
            "description": "Professional brush set for painting",
            "category": "Brush",
            "price": 15.75,
            "stock_quantity": 100,
            "unit": "piece"
        }
    ]
    
    with open("data_loading_examples/sample_products.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=products_data[0].keys())
        writer.writeheader()
        writer.writerows(products_data)
    
    # Sample colors (JSON)
    colors_data = [
        {"name": "Crimson Red", "hex_code": "#DC143C", "rgb_code": "rgb(220, 20, 60)", "available": True},
        {"name": "Sky Blue", "hex_code": "#87CEEB", "rgb_code": "rgb(135, 206, 235)", "available": True},
        {"name": "Forest Green", "hex_code": "#228B22", "rgb_code": "rgb(34, 139, 34)", "available": True},
        {"name": "Sunset Orange", "hex_code": "#FF8C00", "rgb_code": "rgb(255, 140, 0)", "available": False}
    ]
    
    with open("data_loading_examples/sample_colors.json", "w") as f:
        json.dump(colors_data, f, indent=2)
    
    print("Sample data files created!")


def clear_database():
    """Clear all data from the database."""
    print("\n=== Clearing Database ===")
    
    with DatabaseLoader() as loader:
        success = loader.clear_all_data()
        print(f"Database cleared: {'✓' if success else '✗'}")


def main():
    """Run all examples."""
    print("Paint Inventory Database Loader Examples")
    print("=" * 50)
    
    # Setup database
    setup_database()
    
    # Run examples
    try:
        example_1_load_sample_data()
        example_2_load_from_files()
        example_3_advanced_loading()
        example_4_batch_loading_with_relationships()
        
        # Show final statistics
        print("\n=== Final Database Statistics ===")
        stats = get_stats()
        for entity_type, count in stats.items():
            print(f"{entity_type}: {count} records")
        
        example_5_data_export()
        example_6_data_validation()
        
        # Optionally clear database
        user_input = input("\nClear database? (y/N): ")
        if user_input.lower() == 'y':
            clear_database()
        
    except Exception as e:
        print(f"Error running examples: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()