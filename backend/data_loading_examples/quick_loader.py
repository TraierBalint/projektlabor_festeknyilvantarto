"""
Quick Data Loading Script

A simple script for quick data loading operations.
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from app.data_loader import DatabaseLoader
from app.data_loader_utils import load_with_sample_data, get_stats, export_database
from app.database import engine
from app.models import Base


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Quick data loading operations")
    parser.add_argument("--action", choices=["sample", "clear", "stats", "export"], 
                       required=True, help="Action to perform")
    parser.add_argument("--users", type=int, default=10, help="Number of sample users")
    parser.add_argument("--products", type=int, default=20, help="Number of sample products") 
    parser.add_argument("--colors", type=int, default=15, help="Number of sample colors")
    parser.add_argument("--output", default="exports", help="Output directory for exports")
    parser.add_argument("--format", choices=["json", "csv"], default="json", help="Export format")
    
    args = parser.parse_args()
    
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    
    if args.action == "sample":
        print(f"Loading sample data: {args.users} users, {args.products} products, {args.colors} colors...")
        success = load_with_sample_data(args.users, args.products, args.colors)
        if success:
            print("✓ Sample data loaded successfully!")
            stats = get_stats()
            print("\nDatabase Statistics:")
            for entity_type, count in stats.items():
                print(f"  {entity_type}: {count}")
        else:
            print("✗ Failed to load sample data")
    
    elif args.action == "clear":
        with DatabaseLoader() as loader:
            success = loader.clear_all_data()
            print(f"Database cleared: {'✓' if success else '✗'}")
    
    elif args.action == "stats":
        stats = get_stats()
        print("Database Statistics:")
        for entity_type, count in stats.items():
            print(f"  {entity_type}: {count}")
    
    elif args.action == "export":
        success = export_database(args.output, format=args.format)
        print(f"Export to {args.output}: {'✓' if success else '✗'}")


if __name__ == "__main__":
    main()