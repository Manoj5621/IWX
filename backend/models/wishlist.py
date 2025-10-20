from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WishlistItemBase(BaseModel):
    user_id: str
    product_id: str
    size: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=50)
    quantity: int = Field(default=1, ge=1)
    notes: Optional[str] = Field(None, max_length=500)

class WishlistItemCreate(WishlistItemBase):
    pass

class WishlistItemUpdate(BaseModel):
    size: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=50)
    quantity: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = Field(None, max_length=500)

class WishlistItemInDB(WishlistItemBase):
    id: str
    added_at: datetime
    updated_at: datetime

class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: Optional[dict] = None  # Will be populated with product details
    size: Optional[str]
    color: Optional[str]
    quantity: int
    notes: Optional[str]
    added_at: datetime
    updated_at: datetime

class WishlistResponse(BaseModel):
    user_id: str
    items: list[WishlistItemResponse]
    total_items: int
    created_at: datetime
    updated_at: datetime

class WishlistStats(BaseModel):
    total_items: int
    total_value: float
    in_stock_items: int
    out_of_stock_items: int