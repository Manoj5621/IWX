from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class PaymentType(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    BANK_TRANSFER = "bank_transfer"

class CardBrand(str, Enum):
    VISA = "visa"
    MASTERCARD = "mastercard"
    AMEX = "amex"
    DISCOVER = "discover"
    JCB = "jcb"
    DINERS = "diners"

class PaymentStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    BLOCKED = "blocked"
    REMOVED = "removed"

class PaymentBase(BaseModel):
    user_id: str
    type: PaymentType
    is_default: bool = False
    nickname: Optional[str] = Field(None, max_length=100)

class CreditCardInfo(BaseModel):
    card_brand: CardBrand
    last_four: str = Field(..., min_length=4, max_length=4, pattern=r'^\d{4}$')
    expiry_month: int = Field(..., ge=1, le=12)
    expiry_year: int = Field(..., ge=2024, le=2035)
    cardholder_name: str = Field(..., min_length=1, max_length=100)

class PayPalInfo(BaseModel):
    email: str = Field(..., min_length=1, max_length=254)

class BankTransferInfo(BaseModel):
    account_holder: str = Field(..., min_length=1, max_length=100)
    bank_name: str = Field(..., min_length=1, max_length=100)
    account_number: str = Field(..., min_length=1, max_length=50)
    routing_number: Optional[str] = Field(None, max_length=50)

class PaymentCreate(BaseModel):
    user_id: str
    type: PaymentType
    is_default: bool = False
    nickname: Optional[str] = Field(None, max_length=100)
    credit_card: Optional[CreditCardInfo] = None
    paypal: Optional[PayPalInfo] = None
    bank_transfer: Optional[BankTransferInfo] = None

class PaymentUpdate(BaseModel):
    nickname: Optional[str] = Field(None, max_length=100)
    is_default: Optional[bool] = None
    credit_card: Optional[CreditCardInfo] = None
    paypal: Optional[PayPalInfo] = None
    bank_transfer: Optional[BankTransferInfo] = None

class PaymentInDB(PaymentBase):
    id: str
    status: PaymentStatus = PaymentStatus.ACTIVE
    credit_card: Optional[CreditCardInfo] = None
    paypal: Optional[PayPalInfo] = None
    bank_transfer: Optional[BankTransferInfo] = None
    created_at: datetime
    updated_at: datetime
    last_used: Optional[datetime] = None

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    type: PaymentType
    status: PaymentStatus
    is_default: bool
    nickname: Optional[str]
    credit_card: Optional[CreditCardInfo] = None
    paypal: Optional[PayPalInfo] = None
    bank_transfer: Optional[BankTransferInfo] = None
    created_at: datetime
    updated_at: datetime
    last_used: Optional[datetime] = None

    @property
    def display_name(self) -> str:
        if self.nickname:
            return self.nickname
        if self.credit_card:
            return f"{self.credit_card.card_brand.title()} ending in {self.credit_card.last_four}"
        if self.paypal:
            return f"PayPal ({self.paypal.email})"
        if self.bank_transfer:
            return f"Bank Transfer ({self.bank_transfer.account_holder})"
        return f"{self.type.replace('_', ' ').title()}"

class PaymentListResponse(BaseModel):
    payments: list[PaymentResponse]
    total: int
    default_payment_id: Optional[str] = None

class BillingHistoryItem(BaseModel):
    id: str
    date: datetime
    description: str
    amount: float
    status: str
    payment_method: str

class BillingHistoryResponse(BaseModel):
    history: list[BillingHistoryItem]
    total: int