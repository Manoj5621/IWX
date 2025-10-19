from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from models.notification import (
    NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationListResponse, NotificationPreferences,
    NotificationPreferencesUpdate, NotificationStats
)
from models.user import UserInDB
from services.notification_service import NotificationService
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_notification_service():
    return NotificationService()

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new notification (admin only, but allowing user to create for themselves)"""
    try:
        notification_service = get_notification_service()
        notification = await notification_service.create_notification(notification_data)
        return notification
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create notification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification"
        )

@router.get("/", response_model=NotificationListResponse)
async def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get notifications for current user"""
    try:
        notification_service = get_notification_service()
        notifications = await notification_service.get_user_notifications(
            current_user.id, skip, limit
        )
        return notifications
    except Exception as e:
        logger.error(f"Get user notifications error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notifications"
        )

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific notification by ID"""
    try:
        notification_service = get_notification_service()
        notification = await notification_service.get_notification_by_id(
            notification_id, current_user.id
        )
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return notification
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get notification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification"
        )

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Mark a notification as read"""
    try:
        notification_service = get_notification_service()
        notification = await notification_service.mark_as_read(
            notification_id, current_user.id
        )
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return notification
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mark as read error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )

@router.put("/read-all")
async def mark_all_as_read(current_user: UserInDB = Depends(get_current_active_user)):
    """Mark all notifications as read for current user"""
    try:
        notification_service = get_notification_service()
        count = await notification_service.mark_all_as_read(current_user.id)
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        logger.error(f"Mark all as read error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a notification"""
    try:
        notification_service = get_notification_service()
        deleted = await notification_service.delete_notification(
            notification_id, current_user.id
        )
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        return {"message": "Notification deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete notification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )

@router.get("/preferences/", response_model=NotificationPreferences)
async def get_notification_preferences(current_user: UserInDB = Depends(get_current_active_user)):
    """Get notification preferences for current user"""
    try:
        notification_service = get_notification_service()
        preferences = await notification_service.get_notification_preferences(current_user.id)
        return preferences
    except Exception as e:
        logger.error(f"Get notification preferences error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification preferences"
        )

@router.put("/preferences/", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences_data: NotificationPreferencesUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update notification preferences for current user"""
    try:
        notification_service = get_notification_service()
        preferences = await notification_service.update_notification_preferences(
            current_user.id, preferences_data
        )
        return preferences
    except Exception as e:
        logger.error(f"Update notification preferences error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )

@router.get("/stats/", response_model=NotificationStats)
async def get_notification_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """Get notification statistics for current user"""
    try:
        notification_service = get_notification_service()
        stats = await notification_service.get_notification_stats(current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Get notification stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification statistics"
        )