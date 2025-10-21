import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from database.mongodb import MongoDB, USERS_COLLECTION
from models.user import UserInDB, UserRole, TokenData
from auth.security import verify_token
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserInDB]:
    """Get current authenticated user"""
    if not credentials:
        return None

    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        logger.info("Token verification failed - token may be expired or invalid")
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one({"_id": user_id})
        if not user_doc:
            return None

        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None

async def get_current_active_user(
    current_user: Optional[UserInDB] = Depends(get_current_user)
) -> UserInDB:
    """Get current active user"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return current_user

async def get_current_admin_user(
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserInDB:
    """Get current admin user"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return current_user

async def get_current_editor_user(
    current_user: UserInDB = Depends(get_current_active_user)
) -> UserInDB:
    """Get current editor or admin user"""
    if current_user.role not in [UserRole.ADMIN, UserRole.EDITOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return current_user

def require_auth():
    """Dependency that requires authentication"""
    def dependency(current_user: Optional[UserInDB] = Depends(get_current_user)):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return current_user
    return dependency

def require_admin():
    """Dependency that requires admin role"""
    def dependency(current_user: UserInDB = Depends(get_current_admin_user)):
        return current_user
    return dependency

def require_editor():
    """Dependency that requires editor or admin role"""
    def dependency(current_user: UserInDB = Depends(get_current_editor_user)):
        return current_user
    return dependency