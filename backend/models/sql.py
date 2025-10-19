from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, Enum, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.mysql import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"
    CUSTOMER = "customer"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    OUT_OF_STOCK = "out_of_stock"

class ProductCategory(str, enum.Enum):
    WOMAN = "woman"
    MAN = "man"
    KIDS = "kids"
    ACCESSORIES = "accessories"
    BEAUTY = "beauty"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class ShippingMethod(str, enum.Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    OVERNIGHT = "overnight"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True))
    profile_image = Column(String(500))
    phone = Column(String(20), index=True)
    address = Column(JSON)
    preferences = Column(JSON)
    birth_date = Column(String(10))
    gender = Column(String(20))

    # Relationships
    orders = relationship("Order", back_populates="user")
    products_created = relationship("Product", back_populates="created_by_user")

    # Indexes
    __table_args__ = (
        Index('idx_user_email_status', 'email', 'status'),
        Index('idx_user_role_status', 'role', 'status'),
        Index('idx_user_created_at', 'created_at'),
    )

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    sale_price = Column(Float)
    category = Column(Enum(ProductCategory), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False, index=True)
    images = Column(JSON, default=list)
    sizes = Column(JSON, default=list)
    colors = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    attributes = Column(JSON)
    inventory_quantity = Column(Integer, default=0, nullable=False)
    weight = Column(Float)
    dimensions = Column(JSON)
    seo_title = Column(String(200))
    seo_description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False, index=True)
    is_trending = Column(Boolean, default=False, index=True)
    is_sustainable = Column(Boolean, default=False)

    # Relationships
    created_by_user = relationship("User", back_populates="products_created")
    order_items = relationship("OrderItem", back_populates="product")

    # Indexes
    __table_args__ = (
        Index('idx_product_category_status', 'category', 'status'),
        Index('idx_product_brand_category', 'brand', 'category'),
        Index('idx_product_price', 'price'),
        Index('idx_product_sale_price', 'sale_price'),
        Index('idx_product_created_at', 'created_at'),
        Index('idx_product_featured_trending', 'is_featured', 'is_trending'),
        Index('idx_product_inventory', 'inventory_quantity'),
    )

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, nullable=False)
    shipping_cost = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(JSON, nullable=False)
    billing_address = Column(JSON, nullable=False)
    shipping_method = Column(Enum(ShippingMethod), default=ShippingMethod.STANDARD, nullable=False)
    payment_method = Column(String(100), nullable=False)
    tracking_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_order_user_status', 'user_id', 'status'),
        Index('idx_order_status_payment', 'status', 'payment_status'),
        Index('idx_order_created_at', 'created_at'),
        Index('idx_order_total_amount', 'total_amount'),
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(36), ForeignKey('orders.id'), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    size = Column(String(50))
    color = Column(String(50))
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    # Indexes
    __table_args__ = (
        Index('idx_order_item_product', 'product_id'),
    )

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cart_id = Column(Integer, ForeignKey('carts.id'), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    size = Column(String(50))
    color = Column(String(50))

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

    # Indexes
    __table_args__ = (
        Index('idx_cart_item_product', 'product_id'),
    )