from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

# ---- ENUM ----
class UserRole(enum.Enum):
    user = "user"
    admin = "admin"

class OrderStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    completed = "completed"
    cancelled = "cancelled"

# ---- Users ----
class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mixes = relationship("Mix", back_populates="user")
    carts = relationship("Cart", back_populates="user")
    orders = relationship("Order", back_populates="user")

# ---- Products ----
class Product(Base):
    __tablename__ = 'products'
    
    product_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Float, default=0)
    unit = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    inventory_items = relationship("Inventory", back_populates="product")

# ---- Colors & Mixes ----
class Color(Base):
    __tablename__ = 'colors'
    
    color_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    hex_code = Column(String(7))
    rgb_code = Column(String)
    available = Column(Boolean, default=True)
    
    mix_components = relationship("MixComponent", back_populates="color")

class Mix(Base):
    __tablename__ = 'mixes'
    
    mix_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="mixes")
    components = relationship("MixComponent", back_populates="mix")

class MixComponent(Base):
    __tablename__ = 'mix_components'
    
    mix_id = Column(Integer, ForeignKey('mixes.mix_id'), primary_key=True)
    color_id = Column(Integer, ForeignKey('colors.color_id'), primary_key=True)
    ratio = Column(Float, nullable=False)
    
    mix = relationship("Mix", back_populates="components")
    color = relationship("Color", back_populates="mix_components")

# ---- Carts & CartItems ----
class Cart(Base):
    __tablename__ = 'carts'
    
    cart_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart")

class CartItem(Base):
    __tablename__ = 'cart_items'
    
    cart_item_id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey('carts.cart_id'))
    product_id = Column(Integer, ForeignKey('products.product_id'))
    quantity = Column(Float, nullable=False)
    
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

# ---- Orders & OrderItems ----
class Order(Base):
    __tablename__ = 'orders'
    
    order_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_price = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    order_item_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'))
    product_id = Column(Integer, ForeignKey('products.product_id'))
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

# ---- Inventory ----
class Inventory(Base):
    __tablename__ = 'inventory'
    
    inventory_id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.product_id'))
    location = Column(String)
    quantity = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="inventory_items")