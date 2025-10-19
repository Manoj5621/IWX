from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from models.payment import (
    PaymentCreate, PaymentUpdate, PaymentResponse, PaymentListResponse,
    BillingHistoryResponse
)
from models.user import UserInDB
from services.payment_service import PaymentService
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_payment_service():
    return PaymentService()

@router.post("/", response_model=PaymentResponse)
async def create_payment_method(
    payment_data: PaymentCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new payment method"""
    try:
        # Ensure payment belongs to current user
        if payment_data.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create payment method for another user"
            )

        payment_service = get_payment_service()
        payment = await payment_service.create_payment_method(payment_data)
        return payment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create payment method error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment method"
        )

@router.get("/", response_model=PaymentListResponse)
async def get_user_payment_methods(current_user: UserInDB = Depends(get_current_active_user)):
    """Get all payment methods for current user"""
    try:
        payment_service = get_payment_service()
        payments = await payment_service.get_user_payment_methods(current_user.id)
        return payments
    except Exception as e:
        logger.error(f"Get user payment methods error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment methods"
        )

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment_method(
    payment_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific payment method by ID"""
    try:
        payment_service = get_payment_service()
        payment = await payment_service.get_payment_method_by_id(payment_id, current_user.id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return payment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get payment method error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment method"
        )

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment_method(
    payment_id: str,
    payment_data: PaymentUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update a payment method"""
    try:
        payment_service = get_payment_service()
        payment = await payment_service.update_payment_method(payment_id, current_user.id, payment_data)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return payment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update payment method error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update payment method"
        )

@router.delete("/{payment_id}")
async def delete_payment_method(
    payment_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete a payment method"""
    try:
        payment_service = get_payment_service()
        deleted = await payment_service.delete_payment_method(payment_id, current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return {"message": "Payment method deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete payment method error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete payment method"
        )

@router.put("/{payment_id}/default", response_model=PaymentResponse)
async def set_default_payment_method(
    payment_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Set a payment method as default"""
    try:
        payment_service = get_payment_service()
        payment = await payment_service.set_default_payment_method(payment_id, current_user.id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return payment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Set default payment method error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set default payment method"
        )

@router.get("/billing/history/", response_model=BillingHistoryResponse)
async def get_billing_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get billing history for current user"""
    try:
        payment_service = get_payment_service()
        history = await payment_service.get_billing_history(current_user.id, skip, limit)
        return history
    except Exception as e:
        logger.error(f"Get billing history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get billing history"
        )