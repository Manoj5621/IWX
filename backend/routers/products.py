from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ProductSearchFilters, ProductStats
)
from models.user import UserInDB
from services.product_service import ProductService
from auth.dependencies import get_current_editor_user, require_auth
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: UserInDB = Depends(get_current_editor_user)
):
    """Create a new product (Editor/Admin only)"""
    try:
        product = await ProductService.create_product(product_data, current_user.id)
        return ProductResponse(**product.dict())
    except Exception as e:
        logger.error(f"Create product error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get product by ID"""
    try:
        product = await ProductService.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return ProductResponse(**product.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get product error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: UserInDB = Depends(get_current_editor_user)
):
    """Update product (Editor/Admin only)"""
    try:
        product = await ProductService.update_product(product_id, product_data)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return ProductResponse(**product.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update product error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: UserInDB = Depends(get_current_editor_user)
):
    """Delete product (Editor/Admin only)"""
    try:
        deleted = await ProductService.delete_product(product_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete product error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

@router.get("/", response_model=ProductListResponse)
async def list_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sizes: Optional[List[str]] = Query(None),
    colors: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    status: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_trending: Optional[bool] = None,
    is_sustainable: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: int = Query(-1, regex="^(1|-1)$")
):
    """List products with filters and pagination"""
    try:
        filters = ProductSearchFilters(
            query=query,
            category=category,
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            sizes=sizes,
            colors=colors,
            tags=tags,
            status=status,
            is_featured=is_featured,
            is_trending=is_trending,
            is_sustainable=is_sustainable
        )

        result = await ProductService.list_products(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        logger.error(f"List products error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list products"
        )

@router.get("/featured/", response_model=List[ProductResponse])
async def get_featured_products(limit: int = Query(8, ge=1, le=50)):
    """Get featured products"""
    try:
        products = await ProductService.get_featured_products(limit)
        return products
    except Exception as e:
        logger.error(f"Get featured products error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get featured products"
        )

@router.get("/trending/", response_model=List[ProductResponse])
async def get_trending_products(limit: int = Query(8, ge=1, le=50)):
    """Get trending products"""
    try:
        products = await ProductService.get_trending_products(limit)
        return products
    except Exception as e:
        logger.error(f"Get trending products error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get trending products"
        )

@router.get("/new-arrivals/", response_model=List[ProductResponse])
async def get_new_arrivals(limit: int = Query(8, ge=1, le=50)):
    """Get new arrival products"""
    try:
        products = await ProductService.get_new_arrivals(limit)
        return products
    except Exception as e:
        logger.error(f"Get new arrivals error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get new arrivals"
        )

@router.get("/stats/", response_model=ProductStats)
async def get_product_stats(current_user: UserInDB = Depends(get_current_editor_user)):
    """Get product statistics (Editor/Admin only)"""
    try:
        stats = await ProductService.get_product_stats()
        return stats
    except Exception as e:
        logger.error(f"Get product stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product statistics"
        )