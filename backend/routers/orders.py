from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse,
    OrderStats, CartResponse
)
from models.user import UserInDB
from services.order_service import OrderService
from auth.dependencies import get_current_active_user, get_current_editor_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new order"""
    try:
        # Ensure order belongs to current user
        if order_data.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create order for another user"
            )

        order = await OrderService.create_order(order_data)
        return OrderResponse(**order.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get order by ID"""
    try:
        order = await OrderService.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Users can only see their own orders, admins can see all
        if order.user_id != current_user.id and current_user.role not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )

        return OrderResponse(**order.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order"
        )

@router.get("/by-number/{order_number}", response_model=OrderResponse)
async def get_order_by_number(
    order_number: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get order by order number"""
    try:
        order = await OrderService.get_order_by_number(order_number)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Users can only see their own orders, admins can see all
        if order.user_id != current_user.id and current_user.role not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )

        return OrderResponse(**order.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order by number error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order"
        )

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_data: OrderUpdate,
    current_user: UserInDB = Depends(get_current_editor_user)
):
    """Update order (Editor/Admin only)"""
    try:
        order = await OrderService.update_order(order_id, order_data)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return OrderResponse(**order.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update order error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )

@router.get("/", response_model=OrderListResponse)
async def list_orders(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """List orders with filters"""
    try:
        # Regular users can only see their own orders
        if current_user.role not in ["admin", "editor"]:
            user_id = current_user.id

        result = await OrderService.list_orders(
            user_id=user_id,
            status=status,
            skip=skip,
            limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"List orders error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list orders"
        )

@router.get("/stats/", response_model=OrderStats)
async def get_order_stats(current_user: UserInDB = Depends(get_current_editor_user)):
    """Get order statistics (Editor/Admin only)"""
    try:
        stats = await OrderService.get_order_stats()
        return stats
    except Exception as e:
        logger.error(f"Get order stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order statistics"
        )

# Cart endpoints
@router.get("/cart/", response_model=CartResponse)
async def get_cart(current_user: UserInDB = Depends(get_current_active_user)):
    """Get user's cart"""
    try:
        cart = await OrderService.get_user_cart(current_user.id)
        return cart
    except Exception as e:
        logger.error(f"Get cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get cart"
        )

@router.post("/cart/add/")
async def add_to_cart(
    product_id: str,
    quantity: int = 1,
    size: Optional[str] = None,
    color: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Add item to cart"""
    try:
        cart = await OrderService.add_to_cart(
            current_user.id, product_id, quantity, size, color
        )
        return {"message": "Item added to cart", "cart": cart}
    except Exception as e:
        logger.error(f"Add to cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to cart"
        )

@router.delete("/cart/remove/")
async def remove_from_cart(
    product_id: str,
    size: Optional[str] = None,
    color: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Remove item from cart"""
    try:
        cart = await OrderService.remove_from_cart(
            current_user.id, product_id, size, color
        )
        return {"message": "Item removed from cart", "cart": cart}
    except Exception as e:
        logger.error(f"Remove from cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove item from cart"
        )

@router.put("/cart/update/")
async def update_cart(
    items: List[dict],
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update entire cart"""
    try:
        cart = await OrderService.update_cart(current_user.id, items)
        return {"message": "Cart updated", "cart": cart}
    except Exception as e:
        logger.error(f"Update cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cart"
        )