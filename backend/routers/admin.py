from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.user import UserResponse, UserUpdate, UserStats, UserCreate
from models.product import ProductStats
from models.order import OrderStats
from models.security import SecurityStats, LoginHistory, SecurityEvent, DeviceInfo
from services.user_service import UserService
from services.product_service import ProductService
from services.order_service import OrderService
from services.security_service import SecurityService
from auth.dependencies import get_current_admin_user
from models.user import UserInDB, UserRole, UserStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Create a new user (Admin only)"""
    try:
        user = await UserService.create_user(user_data)

        # Broadcast user creation via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user.id, "user_created", {
            "action": "create",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        })

        return UserResponse(**user.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    user_status: Optional[UserStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """List all users (Admin only)"""
    try:
        users = await UserService.list_users(
            skip=skip,
            limit=limit,
            role=role,
            status=user_status
        )
        return users
    except Exception as e:
        logger.error(f"List users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get user by ID (Admin only)"""
    try:
        user = await UserService.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse(**user.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update user (Admin only)"""
    try:
        user = await UserService.update_user(user_id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Broadcast user update via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user_id, "user_updated", {
            "action": "update",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        })

        return UserResponse(**user.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Delete user (Admin only)"""
    try:
        deleted = await UserService.delete_user(user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Broadcast user deletion via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user_id, "user_deleted", {
            "action": "delete",
            "user_id": user_id
        })

        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@router.get("/stats/users", response_model=UserStats)
async def get_user_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get user statistics (Admin only)"""
    try:
        stats = await UserService.get_user_stats()
        return stats
    except Exception as e:
        logger.error(f"Get user stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )

@router.get("/stats/products", response_model=ProductStats)
async def get_product_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get product statistics (Admin only)"""
    try:
        stats = await ProductService.get_product_stats()
        return stats
    except Exception as e:
        logger.error(f"Get product stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product statistics"
        )

@router.get("/stats/orders", response_model=OrderStats)
async def get_order_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get order statistics (Admin only)"""
    try:
        stats = await OrderService.get_order_stats()
        return stats
    except Exception as e:
        logger.error(f"Get order stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order statistics"
        )

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get comprehensive dashboard statistics (Admin only)"""
    try:
        user_stats = await UserService.get_user_stats()
        product_stats = await ProductService.get_product_stats()
        order_stats = await OrderService.get_order_stats()

        # Broadcast stats update via WebSocket
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("stats_update", {
            "totalSales": order_stats.total_revenue,
            "totalOrders": order_stats.total_orders,
            "totalCustomers": user_stats.total_users,
            "totalProducts": product_stats.total_products,
            "revenue": order_stats.total_revenue,
            "visitors": 0,  # Would come from analytics
            "conversionRate": 0  # Would be calculated
        })

        return {
            "users": user_stats.dict(),
            "products": product_stats.dict(),
            "orders": order_stats.dict(),
            "revenue": {
                "total": order_stats.total_revenue,
                "today": order_stats.revenue_today,
                "growth": 12.5  # Could be calculated
            }
        }
    except Exception as e:
        logger.error(f"Get dashboard stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )

@router.get("/security/stats", response_model=SecurityStats)
async def get_admin_security_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get global security statistics (Admin only)"""
    try:
        security_service = SecurityService()
        # Get stats for all users (admin view)
        all_users = await UserService.list_users(limit=1000)  # Get all users
        total_stats = SecurityStats(
            total_login_attempts=0,
            successful_logins=0,
            failed_logins=0,
            suspicious_activities=0,
            active_sessions=0,
            trusted_devices=0
        )

        for user in all_users:
            user_stats = await security_service.get_security_stats(user.id)
            total_stats.total_login_attempts += user_stats.total_login_attempts
            total_stats.successful_logins += user_stats.successful_logins
            total_stats.failed_logins += user_stats.failed_logins
            total_stats.suspicious_activities += user_stats.suspicious_activities
            total_stats.active_sessions += user_stats.active_sessions
            total_stats.trusted_devices += user_stats.trusted_devices

        return total_stats
    except Exception as e:
        logger.error(f"Get admin security stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security statistics"
        )

@router.get("/security/login-history", response_model=List[LoginHistory])
async def get_admin_login_history(
    user_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get login history for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        if user_id:
            # Get history for specific user
            return await security_service.get_login_history(user_id, limit)
        else:
            # Get history for all users (aggregate)
            all_users = await UserService.list_users(limit=1000)
            all_history = []
            for user in all_users:
                user_history = await security_service.get_login_history(user.id, min(limit // len(all_users) + 1, 50))
                all_history.extend(user_history)

            # Sort by timestamp descending and limit
            all_history.sort(key=lambda x: x.timestamp, reverse=True)
            return all_history[:limit]
    except Exception as e:
        logger.error(f"Get admin login history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get login history"
        )

@router.get("/security/events", response_model=List[SecurityEvent])
async def get_admin_security_events(
    user_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get security events for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        # This would need to be implemented in SecurityService for admin view
        # For now, return events for specific user or empty list
        if user_id:
            # Get events from security_events collection filtered by user_id
            db = security_service.db
            query = {"user_id": user_id}
            if event_type:
                query["event_type"] = event_type

            cursor = db.security_events.find(query).sort("timestamp", -1).limit(limit)
            events = []
            async for event in cursor:
                event["id"] = str(event["_id"])
                events.append(SecurityEvent(**event))
            return events
        else:
            # Get all events (admin view)
            db = security_service.db
            query = {}
            if event_type:
                query["event_type"] = event_type

            cursor = db.security_events.find(query).sort("timestamp", -1).limit(limit)
            events = []
            async for event in cursor:
                event["id"] = str(event["_id"])
                events.append(SecurityEvent(**event))
            return events
    except Exception as e:
        logger.error(f"Get admin security events error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security events"
        )

@router.get("/security/devices", response_model=List[DeviceInfo])
async def get_admin_connected_devices(
    user_id: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get connected devices for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        if user_id:
            return await security_service.get_connected_devices(user_id)
        else:
            # Get devices for all users
            all_users = await UserService.list_users(limit=1000)
            all_devices = []
            for user in all_users:
                user_devices = await security_service.get_connected_devices(user.id)
                all_devices.extend(user_devices)
            return all_devices
    except Exception as e:
        logger.error(f"Get admin connected devices error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connected devices"
        )

@router.post("/security/scan")
async def run_security_scan(current_user: UserInDB = Depends(get_current_admin_user)):
    """Run a comprehensive security scan (Admin only)"""
    try:
        security_service = SecurityService()
        user_service = UserService()

        # Get all users
        all_users = await UserService.list_users(limit=1000)

        scan_results = {
            "total_users": len(all_users),
            "users_with_2fa": 0,
            "users_without_password": 0,
            "failed_login_attempts": 0,
            "suspicious_activities": 0,
            "untrusted_devices": 0,
            "weak_passwords": 0,  # Would need password strength checking
            "inactive_accounts": 0,
            "scan_timestamp": datetime.utcnow().isoformat()
        }

        for user in all_users:
            # Get security settings
            try:
                settings = await security_service.get_security_settings(user.id)
                if settings.two_factor_enabled:
                    scan_results["users_with_2fa"] += 1

                if not user.hashed_password:
                    scan_results["users_without_password"] += 1

                if settings.failed_login_attempts > 0:
                    scan_results["failed_login_attempts"] += settings.failed_login_attempts

                if user.status == "inactive":
                    scan_results["inactive_accounts"] += 1
            except:
                pass

            # Get security stats
            try:
                stats = await security_service.get_security_stats(user.id)
                scan_results["suspicious_activities"] += stats.suspicious_activities

                # Get devices
                devices = await security_service.get_connected_devices(user.id)
                untrusted_count = sum(1 for d in devices if not d.is_trusted)
                scan_results["untrusted_devices"] += untrusted_count
            except:
                pass

        return {
            "message": "Security scan completed",
            "results": scan_results
        }
    except Exception as e:
        logger.error(f"Run security scan error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run security scan"
        )