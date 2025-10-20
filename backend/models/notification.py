from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    ORDER_UPDATE = "order_update"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    SHIPMENT_UPDATE = "shipment_update"
    PROMOTION = "promotion"
    ACCOUNT_SECURITY = "account_security"
    PRODUCT_RESTOCK = "product_restock"
    PRICE_DROP = "price_drop"
    REVIEW_REMINDER = "review_reminder"
    SYSTEM = "system"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    channels: list[NotificationChannel] = Field(default_factory=lambda: [NotificationChannel.IN_APP])
    data: Optional[Dict[str, Any]] = None
    priority: int = Field(default=1, ge=1, le=5)  # 1=low, 5=high

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    read_at: Optional[datetime] = None

class NotificationInDB(NotificationBase):
    id: str
    status: NotificationStatus = NotificationStatus.PENDING
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    channels: list[NotificationChannel]
    status: NotificationStatus
    data: Optional[Dict[str, Any]]
    priority: int
    sent_at: Optional[datetime]
    read_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool

class NotificationPreferences(BaseModel):
    user_id: str
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    order_updates: bool = True
    payment_updates: bool = True
    shipping_updates: bool = True
    promotional_emails: bool = True
    product_alerts: bool = True
    security_alerts: bool = True
    system_notifications: bool = True
    created_at: datetime
    updated_at: datetime

class NotificationPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    order_updates: Optional[bool] = None
    payment_updates: Optional[bool] = None
    shipping_updates: Optional[bool] = None
    promotional_emails: Optional[bool] = None
    product_alerts: Optional[bool] = None
    security_alerts: Optional[bool] = None
    system_notifications: Optional[bool] = None

class NotificationStats(BaseModel):
    total_notifications: int
    unread_notifications: int
    sent_today: int
    failed_today: int