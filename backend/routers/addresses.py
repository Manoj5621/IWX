from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.address import AddressCreate, AddressUpdate, AddressResponse, AddressListResponse
from models.user import UserInDB
from services.address_service import AddressService
from auth.dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/addresses", tags=["Addresses"])

# Initialize service inside endpoint functions to avoid import-time database connection
def get_address_service():
    return AddressService()

@router.post("/", response_model=AddressResponse)
async def create_address(
    address_data: AddressCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new address"""
    try:
        # Ensure address belongs to current user
        if address_data.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create address for another user"
            )

        address_service = get_address_service()
        address = await address_service.create_address(address_data)
        return address
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create address error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create address"
        )

@router.get("/", response_model=AddressListResponse)
async def get_user_addresses(current_user: UserInDB = Depends(get_current_active_user)):
    """Get all addresses for current user"""
    try:
        address_service = get_address_service()
        addresses = await address_service.get_user_addresses(current_user.id)
        return addresses
    except Exception as e:
        logger.error(f"Get user addresses error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get addresses"
        )

@router.get("/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific address by ID"""
    try:
        address_service = get_address_service()
        address = await address_service.get_address_by_id(address_id, current_user.id)
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        return address
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get address error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get address"
        )

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: str,
    address_data: AddressUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update an address"""
    try:
        address_service = get_address_service()
        address = await address_service.update_address(address_id, current_user.id, address_data)
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        return address
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update address error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update address"
        )

@router.delete("/{address_id}")
async def delete_address(
    address_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Delete an address"""
    try:
        address_service = get_address_service()
        deleted = await address_service.delete_address(address_id, current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        return {"message": "Address deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete address error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete address"
        )

@router.put("/{address_id}/default", response_model=AddressResponse)
async def set_default_address(
    address_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Set an address as default"""
    try:
        address_service = get_address_service()
        address = await address_service.set_default_address(address_id, current_user.id)
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )
        return address
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Set default address error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set default address"
        )