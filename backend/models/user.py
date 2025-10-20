from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"
    CUSTOMER = "customer"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    role: UserRole = UserRole.CUSTOMER
    status: UserStatus = UserStatus.ACTIVE

class UserCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    password: Optional[str] = Field(None, min_length=6)
    role: UserRole = UserRole.CUSTOMER
    status: UserStatus = UserStatus.ACTIVE
    newsletter_subscription: Optional[bool] = True
    google_id: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[dict] = None
    preferences: Optional[dict] = None

class UserInDB(UserBase):
    id: str
    hashed_password: Optional[str] = None
    google_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[dict] = None
    preferences: Optional[dict] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None

    model_config = {"populate_by_name": True}

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRole
    status: UserStatus
    google_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[dict] = None
    preferences: Optional[dict] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[UserRole] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class UserStats(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    users_by_role: dict