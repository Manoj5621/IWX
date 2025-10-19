from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.security import (
    SecuritySettings, SecuritySettingsUpdate, LoginHistory, DeviceInfo,
    SecurityStats, ChangePasswordRequest, EnableTwoFactorRequest,
    VerifyTwoFactorRequest, DeactivateAccountRequest
)
from models.user import UserInDB
from services.security_service import SecurityService
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/security", tags=["Security"])

def get_security_service():
    return SecurityService()

@router.get("/settings/", response_model=SecuritySettings)
async def get_security_settings(current_user: UserInDB = Depends(get_current_active_user)):
    """Get security settings for current user"""
    try:
        security_service = get_security_service()
        settings = await security_service.get_security_settings(current_user.id)
        return settings
    except Exception as e:
        logger.error(f"Get security settings error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security settings"
        )

@router.put("/settings/", response_model=SecuritySettings)
async def update_security_settings(
    settings_data: SecuritySettingsUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update security settings for current user"""
    try:
        security_service = get_security_service()
        settings = await security_service.update_security_settings(
            current_user.id, settings_data
        )
        return settings
    except Exception as e:
        logger.error(f"Update security settings error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update security settings"
        )

@router.put("/password/", response_model=dict)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Change user's password"""
    try:
        security_service = get_security_service()
        success = await security_service.change_password(current_user.id, password_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

@router.post("/two-factor/enable/", response_model=dict)
async def enable_two_factor(current_user: UserInDB = Depends(get_current_active_user)):
    """Enable two-factor authentication"""
    try:
        security_service = get_security_service()
        result = await security_service.enable_two_factor(current_user.id)
        return result
    except Exception as e:
        logger.error(f"Enable two factor error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enable two-factor authentication"
        )

@router.post("/two-factor/verify/", response_model=dict)
async def verify_two_factor_setup(
    verification_data: VerifyTwoFactorRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Verify two-factor setup with code"""
    try:
        security_service = get_security_service()
        success = await security_service.verify_two_factor_setup(
            current_user.id, verification_data
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        return {"message": "Two-factor authentication enabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify two factor setup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify two-factor setup"
        )

@router.delete("/two-factor/", response_model=dict)
async def disable_two_factor(current_user: UserInDB = Depends(get_current_active_user)):
    """Disable two-factor authentication"""
    try:
        security_service = get_security_service()
        success = await security_service.disable_two_factor(current_user.id)
        return {"message": "Two-factor authentication disabled successfully"}
    except Exception as e:
        logger.error(f"Disable two factor error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable two-factor authentication"
        )

@router.get("/login-history/", response_model=List[LoginHistory])
async def get_login_history(
    limit: int = 50,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get login history for current user"""
    try:
        security_service = get_security_service()
        history = await security_service.get_login_history(current_user.id, limit)
        return history
    except Exception as e:
        logger.error(f"Get login history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get login history"
        )

@router.get("/devices/", response_model=List[DeviceInfo])
async def get_connected_devices(current_user: UserInDB = Depends(get_current_active_user)):
    """Get connected devices for current user"""
    try:
        security_service = get_security_service()
        devices = await security_service.get_connected_devices(current_user.id)
        return devices
    except Exception as e:
        logger.error(f"Get connected devices error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connected devices"
        )

@router.get("/stats/", response_model=SecurityStats)
async def get_security_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """Get security statistics for current user"""
    try:
        security_service = get_security_service()
        stats = await security_service.get_security_stats(current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Get security stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security statistics"
        )

@router.delete("/account/", response_model=dict)
async def deactivate_account(
    deactivation_data: DeactivateAccountRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Deactivate user account"""
    try:
        security_service = get_security_service()
        success = await security_service.deactivate_account(current_user.id, deactivation_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to deactivate account"
            )
        return {"message": "Account deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deactivate account error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate account"
        )