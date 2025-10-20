from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.user import UserResponse, UserUpdate, UserStats, UserCreate
from models.product import ProductStats
from models.order import OrderStats
from services.user_service import UserService
from services.product_service import ProductService
from services.order_service import OrderService
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
    status: Optional[UserStatus] = None,
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
            status=status
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