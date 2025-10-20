import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from typing import Optional, List, Dict, Any
from datetime import datetime
from database.mongodb import MongoDB, USERS_COLLECTION
from models.user import (
    UserCreate, UserUpdate, UserInDB, UserResponse,
    UserLogin, UserStats, UserRole, UserStatus
)
from auth.security import get_password_hash, verify_password
from utils.config import settings
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserInDB:
        """Create a new user"""
        # Check if user already exists
        existing_user = await MongoDB.get_collection(USERS_COLLECTION).find_one(
            {"email": user_data.email}
        )
        if existing_user:
            raise ValueError("User with this email already exists")

        # Create user document
        now = datetime.utcnow()
        user_doc = {
            "_id": str(now.timestamp()) + user_data.email,  # Simple ID generation
            "email": user_data.email,
            "first_name": user_data.first_name or "",
            "last_name": user_data.last_name or "",
            "hashed_password": get_password_hash(user_data.password) if user_data.password else None,
            "google_id": user_data.google_id,
            "role": str(user_data.role) if hasattr(user_data, 'role') and user_data.role is not None else str(UserRole.CUSTOMER),
            "status": str(user_data.status) if hasattr(user_data, 'status') and user_data.status is not None else str(UserStatus.ACTIVE),
            "created_at": now,
            "updated_at": now,
            "last_login": None,
            "profile_image": None,
            "phone": None,
            "address": None,
            "preferences": {
                "email_newsletter": getattr(user_data, 'newsletter_subscription', True),
                "sms_notifications": False,
                "promotions": True,
                "order_updates": True,
                "stock_alerts": True
            },
            "birth_date": None,
            "gender": None
        }

        # Insert user
        result = await MongoDB.get_collection(USERS_COLLECTION).insert_one(user_doc)

        # Return user object
        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)

    @staticmethod
    async def authenticate_user(login_data: UserLogin) -> Optional[UserInDB]:
        """Authenticate user with email and password"""
        user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one(
            {"email": login_data.email}
        )

        if not user_doc:
            return None

        # Check if user has a password (not Google-only account)
        if not user_doc.get("hashed_password"):
            return None

        if not verify_password(login_data.password, user_doc["hashed_password"]):
            return None

        # Update last login
        await MongoDB.get_collection(USERS_COLLECTION).update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)

    @staticmethod
    async def get_user_by_google_id(google_id: str) -> Optional[UserInDB]:
        """Get user by Google ID"""
        user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one(
            {"google_id": google_id}
        )

        if not user_doc:
            return None

        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)

    @staticmethod
    async def create_or_update_google_user(google_user_data: dict) -> UserInDB:
        """Create or update user from Google OAuth data"""
        # Check if user exists by Google ID
        existing_user = await UserService.get_user_by_google_id(google_user_data["google_id"])

        if existing_user:
            # Update existing user with latest Google data
            update_data = {
                "first_name": google_user_data.get("first_name", existing_user.first_name),
                "last_name": google_user_data.get("last_name", existing_user.last_name),
                "profile_image": google_user_data.get("profile_image", existing_user.profile_image),
                "updated_at": datetime.utcnow()
            }
            return await UserService.update_user(existing_user.id, update_data)

        # Check if user exists by email
        existing_email_user = await UserService.get_user_by_email(google_user_data["email"])
        if existing_email_user:
            # Link Google account to existing user
            update_data = {
                "google_id": google_user_data["google_id"],
                "first_name": google_user_data.get("first_name", existing_email_user.first_name),
                "last_name": google_user_data.get("last_name", existing_email_user.last_name),
                "profile_image": google_user_data.get("profile_image", existing_email_user.profile_image),
                "updated_at": datetime.utcnow()
            }
            return await UserService.update_user(existing_email_user.id, update_data)

        # Create new user from Google data
        user_create_data = UserCreate(
            email=google_user_data["email"],
            first_name=google_user_data.get("first_name", ""),
            last_name=google_user_data.get("last_name", ""),
            google_id=google_user_data["google_id"],
            newsletter_subscription=True
        )

        return await UserService.create_user(user_create_data)

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one(
            {"_id": user_id}
        )

        if not user_doc:
            return None

        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[UserInDB]:
        """Get user by email"""
        user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one(
            {"email": email}
        )

        if not user_doc:
            return None

        user_doc["id"] = user_doc["_id"]
        return UserInDB(**user_doc)

    @staticmethod
    async def update_user(user_id: str, update_data) -> Optional[UserInDB]:
        """Update user information"""
        update_dict = {"updated_at": datetime.utcnow()}

        # Handle both UserUpdate objects and dictionaries
        if hasattr(update_data, 'dict'):
            # It's a Pydantic model
            data_dict = update_data.dict(exclude_unset=True)
        else:
            # It's a dictionary
            data_dict = update_data

        # Only include non-None values
        for field, value in data_dict.items():
            if value is not None:
                update_dict[field] = value

        result = await MongoDB.get_collection(USERS_COLLECTION).update_one(
            {"_id": user_id},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await UserService.get_user_by_id(user_id)

    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """Delete user"""
        result = await MongoDB.get_collection(USERS_COLLECTION).delete_one(
            {"_id": user_id}
        )
        return result.deleted_count > 0

    @staticmethod
    async def list_users(
        skip: int = 0,
        limit: int = 50,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None
    ) -> List[UserResponse]:
        """List users with pagination and filters"""
        query = {}

        if role:
            query["role"] = role
        if status:
            query["status"] = status

        cursor = MongoDB.get_collection(USERS_COLLECTION).find(query).skip(skip).limit(limit)

        users = []
        async for user_doc in cursor:
            user_doc["id"] = user_doc["_id"]
            user = UserInDB(**user_doc)
            users.append(UserResponse(**user.dict()))

        return users

    @staticmethod
    async def get_user_stats() -> UserStats:
        """Get user statistics"""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "active_users": {
                        "$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}
                    },
                    "new_users_today": {
                        "$sum": {
                            "$cond": [
                                {"$gte": ["$created_at", datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)]},
                                1, 0
                            ]
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": USERS_COLLECTION,
                    "pipeline": [
                        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
                    ],
                    "as": "role_counts"
                }
            }
        ]

        result = await MongoDB.get_collection(USERS_COLLECTION).aggregate(pipeline).to_list(1)

        if not result:
            return UserStats(
                total_users=0,
                active_users=0,
                new_users_today=0,
                users_by_role={}
            )

        stats = result[0]
        users_by_role = {item["_id"]: item["count"] for item in stats.get("role_counts", [])}

        return UserStats(
            total_users=stats["total_users"],
            active_users=stats["active_users"],
            new_users_today=stats["new_users_today"],
            users_by_role=users_by_role
        )

    @staticmethod
    async def create_admin_user():
        """Create default admin user if not exists"""
        admin_user = await UserService.get_user_by_email(settings.admin_email)
        if admin_user:
            return admin_user

        admin_data = UserCreate(
            email=settings.admin_email,
            first_name="Admin",
            last_name="User",
            password=settings.admin_password,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )

        return await UserService.create_user(admin_data)