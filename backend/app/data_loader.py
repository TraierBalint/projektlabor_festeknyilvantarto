"""
Database Loader Module for Paint Inventory Management System

This module provides comprehensive data loading capabilities for all entities
in the paint inventory system including users, products, colors, mixes, 
carts, orders, and inventory.
"""

import json
import csv
import logging
from typing import List, Dict, Any, Optional, Union, Type
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime
import pandas as pd
from pathlib import Path

from app.database import SessionLocal, get_db
from app.models import (
    User, Product, Color, Mix, MixComponent, Cart, CartItem, 
    Order, OrderItem, Inventory, UserRole, OrderStatus
)
from app.utils.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseLoader:
    """
    Comprehensive database loader for all entities in the paint inventory system.
    Supports JSON, CSV, and dictionary data formats with batch processing capabilities.
    """
    
    def __init__(self, db: Optional[Session] = None):
        """Initialize the database loader."""
        self.db = db if db else SessionLocal()
        self._should_close_db = db is None
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._should_close_db:
            self.db.close()
    
    def load_data_from_file(self, file_path: str, entity_type: str, **kwargs) -> bool:
        """
        Load data from a file (JSON or CSV) for a specific entity type.
        
        Args:
            file_path: Path to the data file
            entity_type: Type of entity (users, products, colors, etc.)
            **kwargs: Additional parameters for loading
            
        Returns:
            bool: Success status
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return False
                
            if file_path.suffix.lower() == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            elif file_path.suffix.lower() == '.csv':
                df = pd.read_csv(file_path)
                data = df.to_dict('records')
            else:
                logger.error(f"Unsupported file format: {file_path.suffix}")
                return False
                
            return self.load_entity_data(entity_type, data, **kwargs)
            
        except Exception as e:
            logger.error(f"Error loading data from file {file_path}: {str(e)}")
            return False
    
    def load_entity_data(self, entity_type: str, data: List[Dict[str, Any]], 
                        batch_size: int = 100, validate_only: bool = False) -> bool:
        """
        Load data for a specific entity type.
        
        Args:
            entity_type: Type of entity to load
            data: List of dictionaries containing entity data
            batch_size: Number of records to process in each batch
            validate_only: If True, only validate data without saving
            
        Returns:
            bool: Success status
        """
        entity_loaders = {
            'users': self._load_users,
            'products': self._load_products,
            'colors': self._load_colors,
            'mixes': self._load_mixes,
            'mix_components': self._load_mix_components,
            'carts': self._load_carts,
            'cart_items': self._load_cart_items,
            'orders': self._load_orders,
            'order_items': self._load_order_items,
            'inventory': self._load_inventory
        }
        
        if entity_type not in entity_loaders:
            logger.error(f"Unsupported entity type: {entity_type}")
            return False
            
        try:
            loader_func = entity_loaders[entity_type]
            return loader_func(data, batch_size, validate_only)
            
        except Exception as e:
            logger.error(f"Error loading {entity_type}: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_users(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load user data."""
        logger.info(f"Loading {len(data)} users...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                users = []
                
                for user_data in batch:
                    # Validate required fields
                    if not all(key in user_data for key in ['name', 'email', 'password']):
                        logger.warning(f"Skipping user with missing required fields: {user_data}")
                        continue
                    
                    # Create user object
                    user = User(
                        name=user_data['name'],
                        email=user_data['email'],
                        password_hash=get_password_hash(user_data['password']),
                        phone=user_data.get('phone'),
                        address=user_data.get('address'),
                        role=UserRole(user_data.get('role', 'user')),
                        created_at=datetime.fromisoformat(user_data['created_at']) if 'created_at' in user_data else datetime.utcnow()
                    )
                    users.append(user)
                
                if not validate_only:
                    self.db.add_all(users)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(users)} users")
                
            logger.info(f"Successfully loaded {len(data)} users")
            return True
            
        except IntegrityError as e:
            logger.error(f"Integrity error loading users: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_products(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load product data."""
        logger.info(f"Loading {len(data)} products...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                products = []
                
                for product_data in batch:
                    # Validate required fields
                    if not all(key in product_data for key in ['name', 'price']):
                        logger.warning(f"Skipping product with missing required fields: {product_data}")
                        continue
                    
                    # Create product object
                    product = Product(
                        name=product_data['name'],
                        description=product_data.get('description'),
                        category=product_data.get('category'),
                        price=float(product_data['price']),
                        stock_quantity=float(product_data.get('stock_quantity', 0)),
                        unit=product_data.get('unit'),
                        image_url=product_data.get('image_url'),
                        created_at=datetime.fromisoformat(product_data['created_at']) if 'created_at' in product_data else datetime.utcnow()
                    )
                    products.append(product)
                
                if not validate_only:
                    self.db.add_all(products)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(products)} products")
                
            logger.info(f"Successfully loaded {len(data)} products")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading products: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_colors(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load color data."""
        logger.info(f"Loading {len(data)} colors...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                colors = []
                
                for color_data in batch:
                    # Validate required fields
                    if 'name' not in color_data:
                        logger.warning(f"Skipping color with missing name: {color_data}")
                        continue
                    
                    # Create color object
                    color = Color(
                        name=color_data['name'],
                        hex_code=color_data.get('hex_code'),
                        rgb_code=color_data.get('rgb_code'),
                        available=color_data.get('available', True)
                    )
                    colors.append(color)
                
                if not validate_only:
                    self.db.add_all(colors)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(colors)} colors")
                
            logger.info(f"Successfully loaded {len(data)} colors")
            return True
            
        except IntegrityError as e:
            logger.error(f"Error loading colors: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_mixes(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load mix data."""
        logger.info(f"Loading {len(data)} mixes...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                mixes = []
                
                for mix_data in batch:
                    # Validate required fields
                    if not all(key in mix_data for key in ['user_id', 'name']):
                        logger.warning(f"Skipping mix with missing required fields: {mix_data}")
                        continue
                    
                    # Create mix object
                    mix = Mix(
                        user_id=int(mix_data['user_id']),
                        name=mix_data['name'],
                        created_at=datetime.fromisoformat(mix_data['created_at']) if 'created_at' in mix_data else datetime.utcnow()
                    )
                    mixes.append(mix)
                
                if not validate_only:
                    self.db.add_all(mixes)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(mixes)} mixes")
                
            logger.info(f"Successfully loaded {len(data)} mixes")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading mixes: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_mix_components(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load mix component data."""
        logger.info(f"Loading {len(data)} mix components...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                components = []
                
                for component_data in batch:
                    # Validate required fields
                    if not all(key in component_data for key in ['mix_id', 'color_id', 'ratio']):
                        logger.warning(f"Skipping mix component with missing required fields: {component_data}")
                        continue
                    
                    # Create mix component object
                    component = MixComponent(
                        mix_id=int(component_data['mix_id']),
                        color_id=int(component_data['color_id']),
                        ratio=float(component_data['ratio'])
                    )
                    components.append(component)
                
                if not validate_only:
                    self.db.add_all(components)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(components)} mix components")
                
            logger.info(f"Successfully loaded {len(data)} mix components")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading mix components: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_carts(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load cart data."""
        logger.info(f"Loading {len(data)} carts...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                carts = []
                
                for cart_data in batch:
                    # Validate required fields
                    if 'user_id' not in cart_data:
                        logger.warning(f"Skipping cart with missing user_id: {cart_data}")
                        continue
                    
                    # Create cart object
                    cart = Cart(
                        user_id=int(cart_data['user_id']),
                        created_at=datetime.fromisoformat(cart_data['created_at']) if 'created_at' in cart_data else datetime.utcnow()
                    )
                    carts.append(cart)
                
                if not validate_only:
                    self.db.add_all(carts)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(carts)} carts")
                
            logger.info(f"Successfully loaded {len(data)} carts")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading carts: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_cart_items(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load cart item data."""
        logger.info(f"Loading {len(data)} cart items...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                cart_items = []
                
                for item_data in batch:
                    # Validate required fields
                    if not all(key in item_data for key in ['cart_id', 'product_id', 'quantity']):
                        logger.warning(f"Skipping cart item with missing required fields: {item_data}")
                        continue
                    
                    # Create cart item object
                    cart_item = CartItem(
                        cart_id=int(item_data['cart_id']),
                        product_id=int(item_data['product_id']),
                        quantity=float(item_data['quantity'])
                    )
                    cart_items.append(cart_item)
                
                if not validate_only:
                    self.db.add_all(cart_items)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(cart_items)} cart items")
                
            logger.info(f"Successfully loaded {len(data)} cart items")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading cart items: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_orders(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load order data."""
        logger.info(f"Loading {len(data)} orders...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                orders = []
                
                for order_data in batch:
                    # Validate required fields
                    if 'user_id' not in order_data:
                        logger.warning(f"Skipping order with missing user_id: {order_data}")
                        continue
                    
                    # Create order object
                    order = Order(
                        user_id=int(order_data['user_id']),
                        status=OrderStatus(order_data.get('status', 'pending')),
                        total_price=float(order_data.get('total_price', 0)),
                        created_at=datetime.fromisoformat(order_data['created_at']) if 'created_at' in order_data else datetime.utcnow()
                    )
                    orders.append(order)
                
                if not validate_only:
                    self.db.add_all(orders)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(orders)} orders")
                
            logger.info(f"Successfully loaded {len(data)} orders")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading orders: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_order_items(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load order item data."""
        logger.info(f"Loading {len(data)} order items...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                order_items = []
                
                for item_data in batch:
                    # Validate required fields
                    if not all(key in item_data for key in ['order_id', 'product_id', 'quantity', 'unit_price']):
                        logger.warning(f"Skipping order item with missing required fields: {item_data}")
                        continue
                    
                    # Create order item object
                    order_item = OrderItem(
                        order_id=int(item_data['order_id']),
                        product_id=int(item_data['product_id']),
                        quantity=float(item_data['quantity']),
                        unit_price=float(item_data['unit_price'])
                    )
                    order_items.append(order_item)
                
                if not validate_only:
                    self.db.add_all(order_items)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(order_items)} order items")
                
            logger.info(f"Successfully loaded {len(data)} order items")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading order items: {str(e)}")
            self.db.rollback()
            return False
    
    def _load_inventory(self, data: List[Dict[str, Any]], batch_size: int, validate_only: bool) -> bool:
        """Load inventory data."""
        logger.info(f"Loading {len(data)} inventory records...")
        
        try:
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                inventory_items = []
                
                for inventory_data in batch:
                    # Validate required fields
                    if 'product_id' not in inventory_data:
                        logger.warning(f"Skipping inventory with missing product_id: {inventory_data}")
                        continue
                    
                    # Create inventory object
                    inventory = Inventory(
                        product_id=int(inventory_data['product_id']),
                        location=inventory_data.get('location'),
                        quantity=float(inventory_data.get('quantity', 0)),
                        updated_at=datetime.fromisoformat(inventory_data['updated_at']) if 'updated_at' in inventory_data else datetime.utcnow()
                    )
                    inventory_items.append(inventory)
                
                if not validate_only:
                    self.db.add_all(inventory_items)
                    self.db.commit()
                    
                logger.info(f"Processed batch {i//batch_size + 1}: {len(inventory_items)} inventory records")
                
            logger.info(f"Successfully loaded {len(data)} inventory records")
            return True
            
        except (ValueError, IntegrityError) as e:
            logger.error(f"Error loading inventory: {str(e)}")
            self.db.rollback()
            return False
    
    def validate_data(self, entity_type: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate data without loading it to the database.
        
        Args:
            entity_type: Type of entity to validate
            data: List of dictionaries containing entity data
            
        Returns:
            Dict with validation results
        """
        results = {
            'valid_records': 0,
            'invalid_records': 0,
            'errors': []
        }
        
        try:
            # Use validate_only=True to check data without saving
            success = self.load_entity_data(entity_type, data, validate_only=True)
            if success:
                results['valid_records'] = len(data)
            else:
                results['invalid_records'] = len(data)
                results['errors'].append(f"Validation failed for {entity_type}")
                
        except Exception as e:
            results['invalid_records'] = len(data)
            results['errors'].append(str(e))
            
        return results
    
    def clear_all_data(self) -> bool:
        """
        Clear all data from the database. Use with caution!
        
        Returns:
            bool: Success status
        """
        try:
            # Delete in reverse order of dependencies
            self.db.query(OrderItem).delete()
            self.db.query(CartItem).delete()
            self.db.query(MixComponent).delete()
            self.db.query(Inventory).delete()
            self.db.query(Order).delete()
            self.db.query(Cart).delete()
            self.db.query(Mix).delete()
            self.db.query(Color).delete()
            self.db.query(Product).delete()
            self.db.query(User).delete()
            
            self.db.commit()
            logger.info("Successfully cleared all data from database")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing database: {str(e)}")
            self.db.rollback()
            return False


# Convenience functions for quick data loading
def load_from_file(file_path: str, entity_type: str, **kwargs) -> bool:
    """Convenience function to load data from a file."""
    with DatabaseLoader() as loader:
        return loader.load_data_from_file(file_path, entity_type, **kwargs)


def load_data(entity_type: str, data: List[Dict[str, Any]], **kwargs) -> bool:
    """Convenience function to load data from a list of dictionaries."""
    with DatabaseLoader() as loader:
        return loader.load_entity_data(entity_type, data, **kwargs)


def validate_data(entity_type: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convenience function to validate data."""
    with DatabaseLoader() as loader:
        return loader.validate_data(entity_type, data)