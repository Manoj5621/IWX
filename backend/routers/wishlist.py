from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from models.wishlist import (
    WishlistItemCreate, WishlistItemUpdate, WishlistItemResponse,
    WishlistResponse, WishlistStats
)
from models.user import UserInDB
from services.wishlist_service import WishlistService
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

def get_wishlist_service():
    return WishlistService()

@router.post("/", response_model=WishlistItemResponse)
async def add_to_wishlist(
    item_data: WishlistItemCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Add an item to user's wishlist"""
    try:
        # Ensure item belongs to current user
        if item_data.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot add item to another user's wishlist"
            )

        wishlist_service = get_wishlist_service()
        item = await wishlist_service.add_to_wishlist(item_data)
        return item
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Add to wishlist error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to wishlist"
        )

@router.get("/", response_model=WishlistResponse)
async def get_user_wishlist(current_user: UserInDB = Depends(get_current_active_user)):
    """Get user's wishlist"""
    try:
        wishlist_service = get_wishlist_service()
        wishlist = await wishlist_service.get_user_wishlist(current_user.id)
        return wishlist
    except Exception as e:
        logger.error(f"Get user wishlist error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get wishlist"
        )

@router.get("/{item_id}", response_model=WishlistItemResponse)
async def get_wishlist_item(
    item_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific wishlist item by ID"""
    try:
        wishlist_service = get_wishlist_service()
        item = await wishlist_service.get_wishlist_item_by_id(item_id, current_user.id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wishlist item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get wishlist item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get wishlist item"
        )

@router.put("/{item_id}", response_model=WishlistItemResponse)
async def update_wishlist_item(
    item_id: str,
    item_data: WishlistItemUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a wishlist item"""
    try:
        wishlist_service = get_wishlist_service()
        item = await wishlist_service.update_wishlist_item(item_id, current_user.id, item_data)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wishlist item not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update wishlist item error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update wishlist item"
        )

@router.delete("/{item_id}")
async def remove_from_wishlist(
    item_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Remove an item from wishlist"""
    try:
        wishlist_service = get_wishlist_service()
        removed = await wishlist_service.remove_from_wishlist(item_id, current_user.id)
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wishlist item not found"
            )
        return {"message": "Item removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove from wishlist error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove item from wishlist"
        )

@router.get("/check/{product_id}")
async def check_in_wishlist(
    product_id: str,
    size: Optional[str] = None,
    color: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Check if a product is in user's wishlist"""
    try:
        wishlist_service = get_wishlist_service()
        in_wishlist = await wishlist_service.check_in_wishlist(
            current_user.id, product_id, size, color
        )
        return {"in_wishlist": in_wishlist}
    except Exception as e:
        logger.error(f"Check in wishlist error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check wishlist status"
        )

@router.get("/stats/", response_model=WishlistStats)
async def get_wishlist_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """Get wishlist statistics for current user"""
    try:
        wishlist_service = get_wishlist_service()
        stats = await wishlist_service.get_wishlist_stats(current_user.id)
        return stats
    except Exception as e:
        logger.error(f"Get wishlist stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get wishlist statistics"
        )