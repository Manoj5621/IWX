import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import APIRouter, Depends, HTTPException, status, Request
from models.user import UserCreate, UserResponse, Token, UserLogin, UserUpdate
from services.user_service import UserService
from auth.security import create_access_token
from auth.dependencies import get_current_active_user
from models.user import UserInDB
from utils.config import settings
import logging
import httpx
from typing import Dict, Any

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

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.google_redirect_uri}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return {"auth_url": google_auth_url}

@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    try:
        # Exchange code for access token
        token_data = {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.google_redirect_uri,
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data=token_data
            )
            token_response.raise_for_status()
            token_info = token_response.json()

            # Get user info from Google
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_info['access_token']}"}
            )
            user_response.raise_for_status()
            google_user = user_response.json()

        # Process user data
        user_data = {
            "google_id": google_user["id"],
            "email": google_user["email"],
            "first_name": google_user.get("given_name", ""),
            "last_name": google_user.get("family_name", ""),
            "profile_image": google_user.get("picture", ""),
        }

        # Create or update user
        user = await UserService.create_or_update_google_user(user_data)

        # Create access token
        access_token = create_access_token(data={"sub": user.id, "role": user.role.value})

        # Return JSON response instead of redirect
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(**user.dict()).dict()
        }

    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )