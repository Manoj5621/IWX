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

class ReturnStatus(str, enum.Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    RECEIVED = "received"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class RefundMethod(str, enum.Enum):
    ORIGINAL_PAYMENT = "original_payment"
    STORE_CREDIT = "store_credit"

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

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(String(36), primary_key=True, index=True)
    return_number = Column(String(50), unique=True, nullable=False, index=True)
    order_id = Column(String(36), ForeignKey('orders.id'), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    status = Column(Enum(ReturnStatus), default=ReturnStatus.REQUESTED, nullable=False, index=True)
    refund_method = Column(Enum(RefundMethod), nullable=False)
    refund_amount = Column(Float)
    admin_notes = Column(Text)
    additional_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True))

    # Relationships
    order = relationship("Order")
    user = relationship("User")
    items = relationship("ReturnItem", back_populates="return_request", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_return_order_user', 'order_id', 'user_id'),
        Index('idx_return_status_created', 'status', 'created_at'),
    )

class ReturnItem(Base):
    __tablename__ = "return_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    return_request_id = Column(String(36), ForeignKey('return_requests.id'), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey('order_items.id'), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    reason = Column(String(200), nullable=False)
    condition = Column(String(50), default="good")
    notes = Column(Text)

    # Relationships
    return_request = relationship("ReturnRequest", back_populates="items")
    order_item = relationship("OrderItem")
    product = relationship("Product")

    # Indexes
    __table_args__ = (
        Index('idx_return_item_product', 'product_id'),
    )

class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    company = Column(String(100))
    street_address = Column(String(200), nullable=False)
    apartment = Column(String(50))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(20))
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_address_user_id', 'user_id'),
        Index('idx_address_is_default', 'is_default'),
    )

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    type = Column(String(20), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    is_default = Column(Boolean, default=False)
    nickname = Column(String(100))
    credit_card = Column(JSON)
    paypal = Column(JSON)
    bank_transfer = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_used = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_payment_user_id', 'user_id'),
        Index('idx_payment_is_default', 'is_default'),
        Index('idx_payment_status', 'status'),
    )

class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False, index=True)
    size = Column(String(50))
    color = Column(String(50))
    quantity = Column(Integer, default=1, nullable=False)
    notes = Column(String(500))
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")
    product = relationship("Product")

    # Indexes
    __table_args__ = (
        Index('idx_wishlist_user_product', 'user_id', 'product_id', unique=True),
        Index('idx_wishlist_added_at', 'added_at'),
    )

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    channels = Column(JSON, default=list)
    status = Column(String(20), default="pending", nullable=False)
    data = Column(JSON)
    priority = Column(Integer, default=1)
    sent_at = Column(DateTime(timezone=True))
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_notification_user_id', 'user_id'),
        Index('idx_notification_status', 'status'),
        Index('idx_notification_type', 'type'),
        Index('idx_notification_created_at', 'created_at'),
    )

class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, unique=True, index=True)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)
    order_updates = Column(Boolean, default=True)
    payment_updates = Column(Boolean, default=True)
    shipping_updates = Column(Boolean, default=True)
    promotional_emails = Column(Boolean, default=True)
    product_alerts = Column(Boolean, default=True)
    security_alerts = Column(Boolean, default=True)
    system_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")

class SecuritySettings(Base):
    __tablename__ = "security_settings"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, unique=True, index=True)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(100))
    backup_codes = Column(JSON)
    login_alerts = Column(Boolean, default=True)
    suspicious_activity_alerts = Column(Boolean, default=True)
    password_last_changed = Column(DateTime(timezone=True))
    account_locked = Column(Boolean, default=False)
    account_locked_until = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0)
    last_failed_login = Column(DateTime(timezone=True))
    trusted_devices = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User")

class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text)
    device_type = Column(String(20), default="unknown")
    location = Column(String(100))
    status = Column(String(20), nullable=False)
    failure_reason = Column(String(200))

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_login_history_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_login_history_ip_address', 'ip_address'),
    )

class DeviceInfo(Base):
    __tablename__ = "device_info"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    device_id = Column(String(100), nullable=False)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(20), default="unknown")
    browser = Column(String(50))
    os = Column(String(50))
    ip_address = Column(String(45), nullable=False)
    last_used = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_trusted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_device_user_device', 'user_id', 'device_id', unique=True),
        Index('idx_device_last_used', 'last_used'),
    )

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text)
    location = Column(String(100))
    details = Column(JSON)
    severity = Column(Integer, default=1)

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_security_event_user_timestamp', 'user_id', 'timestamp'),
        Index('idx_security_event_type', 'event_type'),
    )