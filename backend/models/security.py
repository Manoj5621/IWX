from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class LoginAttemptStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    BLOCKED = "blocked"

class DeviceType(str, Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"
    TABLET = "tablet"
    UNKNOWN = "unknown"

class SecurityEventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    EMAIL_CHANGE = "email_change"
    TWO_FA_ENABLE = "two_fa_enable"
    TWO_FA_DISABLE = "two_fa_disable"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ACCOUNT_LOCK = "account_lock"
    ACCOUNT_UNLOCK = "account_unlock"

class LoginHistory(BaseModel):
    id: str
    user_id: str
    timestamp: datetime
    ip_address: str
    user_agent: str
    device_type: DeviceType
    location: Optional[str] = None
    status: LoginAttemptStatus
    failure_reason: Optional[str] = None

class DeviceInfo(BaseModel):
    id: str
    user_id: str
    device_id: str
    device_name: str
    device_type: DeviceType
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: str
    last_used: datetime
    is_trusted: bool = False
    created_at: datetime

class SecuritySettings(BaseModel):
    user_id: str
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None
    backup_codes: Optional[List[str]] = None
    login_alerts: bool = True
    suspicious_activity_alerts: bool = True
    password_last_changed: Optional[datetime] = None
    account_locked: bool = False
    account_locked_until: Optional[datetime] = None
    failed_login_attempts: int = 0
    last_failed_login: Optional[datetime] = None
    trusted_devices: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

class SecuritySettingsUpdate(BaseModel):
    two_factor_enabled: Optional[bool] = None
    login_alerts: Optional[bool] = None
    suspicious_activity_alerts: Optional[bool] = None
    password_last_changed: Optional[datetime] = None

class SecurityEvent(BaseModel):
    id: str
    user_id: str
    event_type: SecurityEventType
    timestamp: datetime
    ip_address: str
    user_agent: str
    location: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    severity: int = Field(default=1, ge=1, le=5)  # 1=low, 5=critical

class PasswordResetToken(BaseModel):
    id: str
    user_id: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime

class TwoFactorCode(BaseModel):
    id: str
    user_id: str
    code: str
    expires_at: datetime
    used: bool = False
    created_at: datetime

class SecurityStats(BaseModel):
    total_login_attempts: int
    successful_logins: int
    failed_logins: int
    suspicious_activities: int
    active_sessions: int
    trusted_devices: int

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

class EnableTwoFactorRequest(BaseModel):
    verification_code: str = Field(..., min_length=6, max_length=6)

class VerifyTwoFactorRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)

class DeactivateAccountRequest(BaseModel):
    password: str = Field(..., min_length=1)
    reason: Optional[str] = Field(None, max_length=500)