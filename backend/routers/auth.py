import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserCreate, UserResponse, Token, UserLogin, UserUpdate
from services.user_service import UserService
from auth.security import create_access_token
from auth.dependencies import get_current_active_user
from models.user import UserInDB
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user = await UserService.create_user(user_data)
        return UserResponse(**user.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user and return access token"""
    try:
        user = await UserService.authenticate_user(login_data)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is not active"
            )

        access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
        return Token(access_token=access_token, user=UserResponse(**user.dict()))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(**current_user.dict())

@router.post("/refresh-token", response_model=Token)
async def refresh_access_token(current_user: UserInDB = Depends(get_current_active_user)):
    """Refresh access token"""
    try:
        access_token = create_access_token(data={"sub": current_user.id, "role": current_user.role.value})
        return Token(access_token=access_token)
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update current user information"""
    try:
        updated_user = await UserService.update_user(current_user.id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse(**updated_user.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User update failed"
        )