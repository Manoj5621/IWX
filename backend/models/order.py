from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from .user import UserResponse
from .product import ProductResponse

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class ShippingMethod(str, Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    OVERNIGHT = "overnight"

class OrderItem(BaseModel):
    product_id: str
    product: Optional[ProductResponse] = None
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    size: Optional[str] = None
    color: Optional[str] = None
    subtotal: float

class OrderAddress(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None

class OrderBase(BaseModel):
    user_id: str
    items: List[OrderItem]
    shipping_address: OrderAddress
    billing_address: OrderAddress
    shipping_method: ShippingMethod = ShippingMethod.STANDARD
    payment_method: str

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

class OrderInDB(OrderBase):
    id: str
    order_number: str
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    subtotal: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float = 0.0
    total_amount: float
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: str
    user: Optional[UserResponse] = None
    items: List[OrderItem]
    shipping_address: OrderAddress
    billing_address: OrderAddress
    shipping_method: ShippingMethod
    payment_method: str
    status: OrderStatus
    payment_status: PaymentStatus
    subtotal: float
    tax_amount: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool

class OrderStats(BaseModel):
    total_orders: int
    pending_orders: int
    processing_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: float
    average_order_value: float
    orders_today: int
    revenue_today: float

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    size: Optional[str] = None
    color: Optional[str] = None

class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

class CartResponse(BaseModel):
    user_id: str
    items: List[Dict[str, Any]]  # Items with product details
    subtotal: float
    tax_amount: float
    shipping_cost: float
    total_amount: float
    item_count: int