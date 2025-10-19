from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class AddressType(str, Enum):
    HOME = "home"
    WORK = "work"
    BILLING = "billing"
    SHIPPING = "shipping"
    OTHER = "other"

class AddressBase(BaseModel):
    user_id: str
    name: str = Field(..., min_length=1, max_length=100)  # e.g., "Home", "Work"
    type: AddressType = AddressType.HOME
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    company: Optional[str] = Field(None, max_length=100)
    street_address: str = Field(..., min_length=1, max_length=200)
    apartment: Optional[str] = Field(None, max_length=50)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[AddressType] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    company: Optional[str] = Field(None, max_length=100)
    street_address: Optional[str] = Field(None, min_length=1, max_length=200)
    apartment: Optional[str] = Field(None, max_length=50)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_default: Optional[bool] = None

class AddressInDB(AddressBase):
    id: str
    created_at: datetime
    updated_at: datetime

class AddressResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: AddressType
    first_name: str
    last_name: str
    company: Optional[str]
    street_address: str
    apartment: Optional[str]
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str]
    is_default: bool
    created_at: datetime
    updated_at: datetime

class AddressListResponse(BaseModel):
    addresses: list[AddressResponse]
    total: int
    default_address_id: Optional[str] = None