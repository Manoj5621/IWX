from typing import List, Optional
from datetime import datetime, timedelta
from models.security import (
    SecuritySettings, SecuritySettingsUpdate, LoginHistory, DeviceInfo,
    SecurityEvent, ChangePasswordRequest, EnableTwoFactorRequest,
    VerifyTwoFactorRequest, DeactivateAccountRequest, SecurityStats
)
from models.user import UserInDB
from database.mongodb import MongoDB
from auth.security import get_password_hash, verify_password, create_access_token
import logging
import secrets
import pyotp

logger = logging.getLogger(__name__)

class SecurityService:
    def __init__(self):
        try:
            self.db = MongoDB.get_database()
            self.settings_collection = self.db.security_settings
            self.login_history_collection = self.db.login_history
            self.devices_collection = self.db.devices
            self.security_events_collection = self.db.security_events
        except Exception as e:
            logger.error(f"Failed to initialize SecurityService: {e}")
            raise RuntimeError("Database connection failed") from e

    async def get_security_settings(self, user_id: str) -> SecuritySettings:
        """Get security settings for a user"""
        try:
            settings = await self.settings_collection.find_one({"user_id": user_id})

            if settings:
                settings["id"] = str(settings["_id"])
                return SecuritySettings(**settings)

            # Create default settings
            default_settings = SecuritySettings(
                user_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            settings_dict = default_settings.dict()
            result = await self.settings_collection.insert_one(settings_dict)
            settings_dict["id"] = str(result.inserted_id)

            return SecuritySettings(**settings_dict)
        except Exception as e:
            logger.error(f"Get security settings error: {e}")
            raise ValueError(f"Failed to get security settings: {str(e)}")

    async def update_security_settings(self, user_id: str, update_data: SecuritySettingsUpdate) -> SecuritySettings:
        """Update security settings for a user"""
        try:
            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            result = await self.settings_collection.update_one(
                {"user_id": user_id},
                {"$set": update_dict},
                upsert=True
            )

            return await self.get_security_settings(user_id)
        except Exception as e:
            logger.error(f"Update security settings error: {e}")
            raise ValueError(f"Failed to update security settings: {str(e)}")

    async def change_password(self, user_id: str, request: ChangePasswordRequest) -> bool:
        """Change user's password"""
        try:
            from services.user_service import UserService
            user_service = UserService()

            user = await user_service.get_user_by_id(user_id)
            if not user:
                logger.error(f"User not found: {user_id}")
                return False

            # Check if user has a password (not Google-only account)
            if not user.hashed_password:
                logger.error("User does not have a password set (Google-only account)")
                return False

            # Verify current password
            if not verify_password(request.current_password, user.hashed_password):
                logger.error("Current password verification failed")
                return False

            # Update password
            hashed_password = get_password_hash(request.new_password)

            # Use the update_user method properly
            update_result = await user_service.update_user(user_id, {"hashed_password": hashed_password})
            if not update_result:
                logger.error(f"Failed to update password for user: {user_id}")
                return False

            # Log security event
            await self.log_security_event(
                user_id=user_id,
                event_type="password_change",
                details={"method": "manual"}
            )

            # Update last changed timestamp
            await self.update_security_settings(
                user_id,
                SecuritySettingsUpdate(password_last_changed=datetime.utcnow())
            )

            return True
        except Exception as e:
            logger.error(f"Change password error: {e}")
            raise ValueError(f"Failed to change password: {str(e)}")

    async def enable_two_factor(self, user_id: str) -> dict:
        """Enable two-factor authentication for a user"""
        try:
            # Generate secret
            secret = pyotp.random_base32()

            # Update settings
            await self.update_security_settings(
                user_id,
                SecuritySettingsUpdate(
                    two_factor_enabled=False,  # Will be enabled after verification
                    two_factor_secret=secret
                )
            )

            # Generate QR code URI
            totp = pyotp.TOTP(secret)
            provisioning_uri = totp.provisioning_uri(name=f"user_{user_id}", issuer_name="YourApp")

            return {
                "secret": secret,
                "provisioning_uri": provisioning_uri
            }
        except Exception as e:
            logger.error(f"Enable two factor error: {e}")
            raise ValueError(f"Failed to enable two-factor authentication: {str(e)}")

    async def verify_two_factor_setup(self, user_id: str, request: VerifyTwoFactorRequest) -> bool:
        """Verify two-factor setup with code"""
        try:
            settings = await self.get_security_settings(user_id)
            if not settings.two_factor_secret:
                return False

            totp = pyotp.TOTP(settings.two_factor_secret)
            if totp.verify(request.code):
                # Enable 2FA
                await self.update_security_settings(
                    user_id,
                    SecuritySettingsUpdate(two_factor_enabled=True)
                )

                # Log event
                await self.log_security_event(
                    user_id=user_id,
                    event_type="two_fa_enable"
                )

                return True
            return False
        except Exception as e:
            logger.error(f"Verify two factor setup error: {e}")
            raise ValueError(f"Failed to verify two-factor setup: {str(e)}")

    async def disable_two_factor(self, user_id: str) -> bool:
        """Disable two-factor authentication"""
        try:
            await self.update_security_settings(
                user_id,
                SecuritySettingsUpdate(
                    two_factor_enabled=False,
                    two_factor_secret=None
                )
            )

            # Log event
            await self.log_security_event(
                user_id=user_id,
                event_type="two_fa_disable"
            )

            return True
        except Exception as e:
            logger.error(f"Disable two factor error: {e}")
            raise ValueError(f"Failed to disable two-factor authentication: {str(e)}")

    async def log_login_attempt(self, user_id: str, ip_address: str, user_agent: str, success: bool, failure_reason: Optional[str] = None):
        """Log a login attempt"""
        try:
            login_data = {
                "user_id": user_id,
                "timestamp": datetime.utcnow(),
                "ip_address": ip_address,
                "user_agent": user_agent,
                "status": "success" if success else "failed",
                "failure_reason": failure_reason
            }

            await self.login_history_collection.insert_one(login_data)

            # Update security settings if failed attempt
            if not success:
                await self.settings_collection.update_one(
                    {"user_id": user_id},
                    {"$inc": {"failed_login_attempts": 1}, "$set": {"last_failed_login": datetime.utcnow()}},
                    upsert=True
                )
            else:
                # Reset failed attempts on successful login
                await self.settings_collection.update_one(
                    {"user_id": user_id},
                    {"$set": {"failed_login_attempts": 0, "last_failed_login": None}},
                    upsert=True
                )
        except Exception as e:
            logger.error(f"Log login attempt error: {e}")
            # Don't raise here as logging should not break main functionality

    async def get_login_history(self, user_id: str, limit: int = 50) -> List[LoginHistory]:
        """Get login history for a user"""
        try:
            history = []
            cursor = self.login_history_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)

            async for item in cursor:
                item["id"] = str(item["_id"])
                history.append(LoginHistory(**item))

            return history
        except Exception as e:
            logger.error(f"Get login history error: {e}")
            raise ValueError(f"Failed to get login history: {str(e)}")

    async def get_connected_devices(self, user_id: str) -> List[DeviceInfo]:
        """Get connected devices for a user"""
        try:
            devices = []
            cursor = self.devices_collection.find({"user_id": user_id}).sort("last_used", -1)

            async for device in cursor:
                device["id"] = str(device["_id"])
                devices.append(DeviceInfo(**device))

            return devices
        except Exception as e:
            logger.error(f"Get connected devices error: {e}")
            raise ValueError(f"Failed to get connected devices: {str(e)}")

    async def log_security_event(self, user_id: str, event_type: str, ip_address: str = "", user_agent: str = "", details: Optional[dict] = None):
        """Log a security event"""
        try:
            event_data = {
                "user_id": user_id,
                "event_type": event_type,
                "timestamp": datetime.utcnow(),
                "ip_address": ip_address,
                "user_agent": user_agent,
                "details": details or {}
            }

            await self.security_events_collection.insert_one(event_data)
        except Exception as e:
            logger.error(f"Log security event error: {e}")
            # Don't raise here as logging should not break main functionality

    async def get_security_stats(self, user_id: str) -> SecurityStats:
        """Get security statistics for a user"""
        try:
            # Login attempts
            total_attempts = await self.login_history_collection.count_documents({"user_id": user_id})
            successful_logins = await self.login_history_collection.count_documents({
                "user_id": user_id,
                "status": "success"
            })
            failed_logins = total_attempts - successful_logins

            # Active sessions (simplified - in real app would check active tokens)
            active_sessions = 1  # Placeholder

            # Trusted devices
            trusted_devices = await self.devices_collection.count_documents({
                "user_id": user_id,
                "is_trusted": True
            })

            # Suspicious activities (events in last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            suspicious_activities = await self.security_events_collection.count_documents({
                "user_id": user_id,
                "event_type": "suspicious_activity",
                "timestamp": {"$gte": thirty_days_ago}
            })

            return SecurityStats(
                total_login_attempts=total_attempts,
                successful_logins=successful_logins,
                failed_logins=failed_logins,
                suspicious_activities=suspicious_activities,
                active_sessions=active_sessions,
                trusted_devices=trusted_devices
            )
        except Exception as e:
            logger.error(f"Get security stats error: {e}")
            raise ValueError(f"Failed to get security statistics: {str(e)}")

    async def deactivate_account(self, user_id: str, request: DeactivateAccountRequest) -> bool:
        """Deactivate user account"""
        try:
            from services.user_service import UserService
            user_service = UserService()

            user = await user_service.get_user_by_id(user_id)
            if not user:
                return False

            # Verify password
            if not verify_password(request.password, user.hashed_password):
                return False

            # Deactivate account
            await user_service.update_user(user_id, {"status": "inactive"})

            # Log event
            await self.log_security_event(
                user_id=user_id,
                event_type="account_deactivation",
                details={"reason": request.reason}
            )

            return True
        except Exception as e:
            logger.error(f"Deactivate account error: {e}")
            raise ValueError(f"Failed to deactivate account: {str(e)}")