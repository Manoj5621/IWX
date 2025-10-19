from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from models.user import UserInDB
from services.ai_service import ai_service
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Features"])

@router.post("/recommendations")
async def get_product_recommendations(
    user_id: str,
    viewed_products: List[str] = [],
    purchased_products: List[str] = [],
    user_preferences: Optional[Dict[str, Any]] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get AI-powered product recommendations"""
    try:
        # Users can only get recommendations for themselves
        if user_id != current_user.id and current_user.role.value not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot get recommendations for other users"
            )

        recommendations = await ai_service.generate_product_recommendations(
            user_id=user_id,
            viewed_products=viewed_products,
            purchased_products=purchased_products,
            user_preferences=user_preferences
        )

        return {"recommendations": recommendations}

    except Exception as e:
        logger.error(f"AI recommendations error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )

@router.post("/analyze-trends")
async def analyze_product_trends(
    product_data: List[Dict[str, Any]],
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Analyze product trends using AI"""
    try:
        # Only editors and admins can use trend analysis
        if current_user.role.value not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to analyze trends"
            )

        analysis = await ai_service.analyze_product_trends(product_data)
        return analysis

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI trend analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze trends"
        )

@router.post("/generate-description")
async def generate_product_description(
    product_name: str,
    category: str,
    features: List[str],
    brand: str = "IWX",
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Generate AI-powered product description"""
    try:
        # Only editors and admins can generate descriptions
        if current_user.role.value not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to generate descriptions"
            )

        description = await ai_service.generate_product_description(
            product_name=product_name,
            category=category,
            features=features,
            brand=brand
        )

        return {"description": description}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI description generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate description"
        )

@router.post("/predict-inventory")
async def predict_inventory_needs(
    product_id: str,
    sales_history: List[Dict[str, Any]],
    current_stock: int,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Predict inventory needs using AI"""
    try:
        # Only editors and admins can predict inventory
        if current_user.role.value not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to predict inventory"
            )

        prediction = await ai_service.predict_inventory_needs(
            product_id=product_id,
            sales_history=sales_history,
            current_stock=current_stock
        )

        return prediction

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI inventory prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to predict inventory needs"
        )

@router.post("/categorize-image")
async def categorize_product_image(
    image_url: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Categorize product from image using AI"""
    try:
        # Only editors and admins can categorize images
        if current_user.role.value not in ["admin", "editor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to categorize images"
            )

        categorization = await ai_service.categorize_product_image(image_url)
        return categorization

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI image categorization error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to categorize image"
        )