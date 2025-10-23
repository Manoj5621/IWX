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

        # Broadcast user registration via WebSocket for real-time admin dashboard updates
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("user_update", {
            "action": "create",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        })

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

        access_token = create_access_token(data={"sub": user.id, "role": user.role}, remember_me=login_data.remember_me)
        return Token(access_token=access_token, user=UserResponse(**user.dict()))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        # Return empty response instead of error for better UX
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
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
        access_token = create_access_token(data={"sub": current_user.id, "role": current_user.role})
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
async def google_callback_get(code: str):
    """Handle Google OAuth callback and redirect to frontend"""
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

        # Broadcast user registration via WebSocket for real-time admin dashboard updates (only for new users)
        if user.created_at == user.updated_at:  # Assuming this indicates a new user
            from routers.websocket import broadcast_dashboard_update
            await broadcast_dashboard_update("user_update", {
                "action": "create",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.role,
                    "status": user.status,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                }
            })

        # Create access token
        access_token = create_access_token(data={"sub": user.id, "role": user.role})

        # Create user response data
        user_response_data = UserResponse(**user.dict()).dict()

        # Store auth data in session/temporary storage and redirect
        import uuid
        session_id = str(uuid.uuid4())

        # Store auth data temporarily (in a real app, use Redis/session store)
        # For now, we'll use a simple in-memory dict (not production ready)
        if not hasattr(google_callback_get, 'auth_sessions'):
            google_callback_get.auth_sessions = {}

        google_callback_get.auth_sessions[session_id] = {
            'user': user_response_data,
            'token': access_token,
            'role': user.role.value,
            'expires': datetime.utcnow().timestamp() + 300  # 5 minutes
        }

        # Redirect to frontend with session ID
        redirect_url = f"http://localhost:5173/auth/google/callback?session_id={session_id}"
        logger.info(f"Redirecting to: {redirect_url}")
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=redirect_url, status_code=302)

    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        logger.error(f"Error details: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

        # Redirect to frontend with error
        error_redirect_url = "http://localhost:5173/auth?error=google_auth_failed"
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=error_redirect_url, status_code=302)

@router.get("/google/session/{session_id}")
async def get_google_auth_session(session_id: str):
    """Get authentication data for a session"""
    try:
        # Check if session exists and hasn't expired
        if not hasattr(google_callback_get, 'auth_sessions'):
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = google_callback_get.auth_sessions.get(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")

        # Check if session has expired
        if datetime.utcnow().timestamp() > session_data['expires']:
            del google_callback_get.auth_sessions[session_id]
            raise HTTPException(status_code=404, detail="Session expired")

        # Clean up session after use
        del google_callback_get.auth_sessions[session_id]

        return {
            "access_token": session_data['token'],
            "token_type": "bearer",
            "user": session_data['user']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve authentication data"
        )