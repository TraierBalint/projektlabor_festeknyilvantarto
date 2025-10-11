"""
Advanced Database Loading Utilities

This module provides additional utilities for complex data loading scenarios,
including relationship handling, data transformation, and import/export capabilities.
"""

import json
import csv
import logging
from typing import List, Dict, Any, Optional, Callable, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import pandas as pd
from pathlib import Path

from app.data_loader import DatabaseLoader
from app.database import SessionLocal
from app.models import *

logger = logging.getLogger(__name__)


class AdvancedDataLoader(DatabaseLoader):
    """
    Advanced database loader with additional features for complex data operations.
    """
    
    def __init__(self, db: Optional[Session] = None):
        super().__init__(db)
        self.transformation_functions = {}
        self.validation_rules = {}
    
    def register_transformation(self, entity_type: str, transformer: Callable):
        """Register a data transformation function for an entity type."""
        self.transformation_functions[entity_type] = transformer
    
    def register_validation_rule(self, entity_type: str, validator: Callable):
        """Register a custom validation rule for an entity type."""
        self.validation_rules[entity_type] = validator
    
    def load_with_relationships(self, data_files: Dict[str, str], dependency_order: List[str] = None) -> bool:
        """
        Load multiple related entity types in the correct order.
        
        Args:
            data_files: Dictionary mapping entity types to file paths
            dependency_order: Order in which to load entities (defaults to standard order)
            
        Returns:
            bool: Success status
        """
        if dependency_order is None:
            dependency_order = [
                'users', 'products', 'colors', 'mixes', 'mix_components',
                'carts', 'cart_items', 'orders', 'order_items', 'inventory'
            ]
        
        try:
            logger.info("Starting batch load with relationships...")
            
            for entity_type in dependency_order:
                if entity_type in data_files:
                    logger.info(f"Loading {entity_type}...")
                    success = self.load_data_from_file(data_files[entity_type], entity_type)
                    if not success:
                        logger.error(f"Failed to load {entity_type}")
                        return False
                    logger.info(f"Successfully loaded {entity_type}")
            
            logger.info("Batch load completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error in batch load: {str(e)}")
            return False
    
    def export_data_to_files(self, output_dir: str, entity_types: List[str] = None, format: str = 'json') -> bool:
        """
        Export database data to files.
        
        Args:
            output_dir: Directory to save exported files
            entity_types: List of entity types to export (None for all)
            format: Export format ('json' or 'csv')
            
        Returns:
            bool: Success status
        """
        if entity_types is None:
            entity_types = [
                'users', 'products', 'colors', 'mixes', 'mix_components',
                'carts', 'cart_items', 'orders', 'order_items', 'inventory'
            ]
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        entity_models = {
            'users': User,
            'products': Product,
            'colors': Color,
            'mixes': Mix,
            'mix_components': MixComponent,
            'carts': Cart,
            'cart_items': CartItem,
            'orders': Order,
            'order_items': OrderItem,
            'inventory': Inventory
        }
        
        try:
            for entity_type in entity_types:
                if entity_type not in entity_models:
                    logger.warning(f"Unknown entity type: {entity_type}")
                    continue
                
                model = entity_models[entity_type]
                records = self.db.query(model).all()
                
                # Convert to dictionaries
                data = []
                for record in records:
                    record_dict = {}
                    for column in record.__table__.columns:
                        value = getattr(record, column.name)
                        if isinstance(value, datetime):
                            value = value.isoformat()
                        elif hasattr(value, 'value'):  # Enum values
                            value = value.value
                        record_dict[column.name] = value
                    data.append(record_dict)
                
                # Save to file
                filename = f"{entity_type}.{format}"
                file_path = output_path / filename
                
                if format == 'json':
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                elif format == 'csv':
                    if data:
                        df = pd.DataFrame(data)
                        df.to_csv(file_path, index=False)
                
                logger.info(f"Exported {len(data)} {entity_type} to {file_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error exporting data: {str(e)}")
            return False
    
    def load_entity_data_with_transform(self, entity_type: str, data: List[Dict[str, Any]], 
                                      batch_size: int = 100, validate_only: bool = False) -> bool:
        """
        Load data with optional transformation and custom validation.
        """
        # Apply transformation if registered
        if entity_type in self.transformation_functions:
            transformer = self.transformation_functions[entity_type]
            data = [transformer(record) for record in data]
        
        # Apply custom validation if registered
        if entity_type in self.validation_rules:
            validator = self.validation_rules[entity_type]
            validated_data = []
            for record in data:
                if validator(record):
                    validated_data.append(record)
                else:
                    logger.warning(f"Record failed custom validation: {record}")
            data = validated_data
        
        return super().load_entity_data(entity_type, data, batch_size, validate_only)
    
    def get_database_statistics(self) -> Dict[str, int]:
        """Get statistics about the current database state."""
        stats = {}
        
        entity_models = {
            'users': User,
            'products': Product,
            'colors': Color,
            'mixes': Mix,
            'mix_components': MixComponent,
            'carts': Cart,
            'cart_items': CartItem,
            'orders': Order,
            'order_items': OrderItem,
            'inventory': Inventory
        }
        
        try:
            for entity_type, model in entity_models.items():
                count = self.db.query(model).count()
                stats[entity_type] = count
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting database statistics: {str(e)}")
            return {}
    
    def create_sample_data(self, num_users: int = 10, num_products: int = 20, 
                          num_colors: int = 15) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generate sample data for testing purposes.
        
        Args:
            num_users: Number of sample users to create
            num_products: Number of sample products to create
            num_colors: Number of sample colors to create
            
        Returns:
            Dict containing sample data for all entity types
        """
        import random
        from faker import Faker
        
        fake = Faker()
        sample_data = {}
        
        # Generate users
        users = []
        for i in range(num_users):
            user = {
                'name': fake.name(),
                'email': fake.email(),
                'password': 'password123',
                'phone': fake.phone_number(),
                'address': fake.address(),
                'role': random.choice(['user', 'admin']),
                'created_at': fake.date_time_between(start_date='-1y', end_date='now').isoformat()
            }
            users.append(user)
        sample_data['users'] = users
        
        # Generate products
        products = []
        categories = ['Paint', 'Primer', 'Thinner', 'Brush', 'Roller', 'Spray']
        units = ['liter', 'gallon', 'kg', 'piece']
        
        for i in range(num_products):
            product = {
                'name': f"{fake.color_name()} {random.choice(categories)}",
                'description': fake.text(max_nb_chars=200),
                'category': random.choice(categories),
                'price': round(random.uniform(10, 200), 2),
                'stock_quantity': random.randint(0, 100),
                'unit': random.choice(units),
                'image_url': fake.image_url(),
                'created_at': fake.date_time_between(start_date='-6m', end_date='now').isoformat()
            }
            products.append(product)
        sample_data['products'] = products
        
        # Generate colors
        colors = []
        for i in range(num_colors):
            color = {
                'name': fake.color_name(),
                'hex_code': fake.hex_color(),
                'rgb_code': f"rgb({random.randint(0,255)},{random.randint(0,255)},{random.randint(0,255)})",
                'available': random.choice([True, False])
            }
            colors.append(color)
        sample_data['colors'] = colors
        
        # Generate some related data
        mixes = []
        for i in range(min(5, num_users)):
            mix = {
                'user_id': i + 1,  # Assuming users will have IDs 1, 2, 3...
                'name': f"Custom Mix {i + 1}",
                'created_at': fake.date_time_between(start_date='-3m', end_date='now').isoformat()
            }
            mixes.append(mix)
        sample_data['mixes'] = mixes
        
        # Generate mix components
        mix_components = []
        for mix_id in range(1, len(mixes) + 1):
            # Each mix has 2-4 colors
            num_components = random.randint(2, 4)
            remaining_ratio = 1.0
            
            for i in range(num_components):
                if i == num_components - 1:
                    # Last component gets remaining ratio
                    ratio = remaining_ratio
                else:
                    ratio = round(random.uniform(0.1, remaining_ratio - 0.1), 2)
                    remaining_ratio -= ratio
                
                component = {
                    'mix_id': mix_id,
                    'color_id': random.randint(1, min(num_colors, 10)),
                    'ratio': ratio
                }
                mix_components.append(component)
        sample_data['mix_components'] = mix_components
        
        return sample_data


class DataTransformers:
    """Collection of common data transformation functions."""
    
    @staticmethod
    def normalize_email(record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize email addresses to lowercase."""
        if 'email' in record:
            record['email'] = record['email'].lower().strip()
        return record
    
    @staticmethod
    def format_price(record: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure price is properly formatted."""
        if 'price' in record:
            try:
                record['price'] = round(float(record['price']), 2)
            except (ValueError, TypeError):
                record['price'] = 0.0
        return record
    
    @staticmethod
    def normalize_phone(record: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize phone numbers."""
        if 'phone' in record and record['phone']:
            # Remove all non-digit characters
            phone = ''.join(filter(str.isdigit, record['phone']))
            record['phone'] = phone
        return record


class DataValidators:
    """Collection of custom validation functions."""
    
    @staticmethod
    def validate_user(record: Dict[str, Any]) -> bool:
        """Validate user data."""
        required_fields = ['name', 'email', 'password']
        if not all(field in record and record[field] for field in required_fields):
            return False
        
        # Check email format
        email = record['email']
        if '@' not in email or '.' not in email:
            return False
        
        # Check password length
        if len(record['password']) < 6:
            return False
        
        return True
    
    @staticmethod
    def validate_product(record: Dict[str, Any]) -> bool:
        """Validate product data."""
        required_fields = ['name', 'price']
        if not all(field in record and record[field] for field in required_fields):
            return False
        
        # Check price is positive
        try:
            price = float(record['price'])
            if price < 0:
                return False
        except (ValueError, TypeError):
            return False
        
        return True


# Convenience functions for advanced loading
def load_with_sample_data(num_users: int = 10, num_products: int = 20, num_colors: int = 15) -> bool:
    """Load sample data into the database."""
    with AdvancedDataLoader() as loader:
        sample_data = loader.create_sample_data(num_users, num_products, num_colors)
        
        # Load in dependency order
        dependency_order = ['users', 'products', 'colors', 'mixes', 'mix_components']
        
        for entity_type in dependency_order:
            if entity_type in sample_data:
                success = loader.load_entity_data(entity_type, sample_data[entity_type])
                if not success:
                    return False
        
        return True


def export_database(output_dir: str, format: str = 'json') -> bool:
    """Export entire database to files."""
    with AdvancedDataLoader() as loader:
        return loader.export_data_to_files(output_dir, format=format)


def get_stats() -> Dict[str, int]:
    """Get database statistics."""
    with AdvancedDataLoader() as loader:
        return loader.get_database_statistics()