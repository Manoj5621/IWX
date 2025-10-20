from typing import List, Optional
from datetime import datetime
from models.notification import (
    NotificationCreate, NotificationUpdate, NotificationInDB,
    NotificationResponse, NotificationListResponse, NotificationPreferences,
    NotificationPreferencesUpdate, NotificationStats
)
from database.mongodb import MongoDB
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.db = MongoDB.get_database()
        self.collection = self.db.notifications
        self.preferences_collection = self.db.notification_preferences

    async def create_notification(self, notification_data: NotificationCreate) -> NotificationResponse:
        """Create a new notification"""
        try:
            notification_dict = notification_data.dict()
            notification_dict.update({
                "status": "pending",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })

            result = await self.collection.insert_one(notification_dict)
            notification_dict["id"] = str(result.inserted_id)

            return NotificationResponse(**notification_dict)
        except Exception as e:
            logger.error(f"Create notification error: {e}")
            raise

    async def get_user_notifications(self, user_id: str, skip: int = 0, limit: int = 50) -> NotificationListResponse:
        """Get notifications for a user"""
        try:
            # Get total count
            total = await self.collection.count_documents({"user_id": user_id})

            # Get unread count
            unread_count = await self.collection.count_documents({
                "user_id": user_id,
                "status": {"$in": ["pending", "sent"]}
            })

            # Get notifications
            notifications = []
            cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)

            async for notification in cursor:
                notification["id"] = str(notification["_id"])
                notifications.append(NotificationResponse(**notification))

            return NotificationListResponse(
                notifications=notifications,
                total=total,
                unread_count=unread_count,
                page=(skip // limit) + 1,
                limit=limit,
                has_next=(skip + limit) < total,
                has_prev=skip > 0
            )
        except Exception as e:
            logger.error(f"Get user notifications error: {e}")
            raise

    async def mark_as_read(self, notification_id: str, user_id: str) -> Optional[NotificationResponse]:
        """Mark a notification as read"""
        try:
            from bson import ObjectId

            result = await self.collection.update_one(
                {"_id": ObjectId(notification_id), "user_id": user_id},
                {"$set": {
                    "status": "read",
                    "read_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )

            if result.modified_count:
                return await self.get_notification_by_id(notification_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Mark as read error: {e}")
            raise

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        try:
            result = await self.collection.update_many(
                {"user_id": user_id, "status": {"$in": ["pending", "sent"]}},
                {"$set": {
                    "status": "read",
                    "read_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            return result.modified_count
        except Exception as e:
            logger.error(f"Mark all as read error: {e}")
            raise

    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        try:
            from bson import ObjectId
            result = await self.collection.delete_one({
                "_id": ObjectId(notification_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Delete notification error: {e}")
            raise

    async def get_notification_by_id(self, notification_id: str, user_id: str) -> Optional[NotificationResponse]:
        """Get a specific notification by ID"""
        try:
            from bson import ObjectId
            notification = await self.collection.find_one({
                "_id": ObjectId(notification_id),
                "user_id": user_id
            })

            if notification:
                notification["id"] = str(notification["_id"])
                return NotificationResponse(**notification)
            return None
        except Exception as e:
            logger.error(f"Get notification by ID error: {e}")
            raise

    async def get_notification_preferences(self, user_id: str) -> NotificationPreferences:
        """Get notification preferences for a user"""
        try:
            preferences = await self.preferences_collection.find_one({"user_id": user_id})

            if preferences:
                preferences["id"] = str(preferences["_id"])
                return NotificationPreferences(**preferences)

            # Return default preferences if none exist
            return NotificationPreferences(
                user_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Get notification preferences error: {e}")
            raise

    async def update_notification_preferences(self, user_id: str, update_data: NotificationPreferencesUpdate) -> NotificationPreferences:
        """Update notification preferences for a user"""
        try:
            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            result = await self.preferences_collection.update_one(
                {"user_id": user_id},
                {"$set": update_dict, "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": datetime.utcnow()
                }},
                upsert=True
            )

            return await self.get_notification_preferences(user_id)
        except Exception as e:
            logger.error(f"Update notification preferences error: {e}")
            raise

    async def get_notification_stats(self, user_id: str) -> NotificationStats:
        """Get notification statistics for a user"""
        try:
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }}
            ]

            results = await self.collection.aggregate(pipeline).to_list(length=None)

            stats = {"total_notifications": 0, "unread_notifications": 0, "sent_today": 0, "failed_today": 0}

            for result in results:
                status = result["_id"]
                count = result["count"]
                stats["total_notifications"] += count

                if status in ["pending", "sent"]:
                    stats["unread_notifications"] += count

            # Get today's sent/failed count
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_sent = await self.collection.count_documents({
                "user_id": user_id,
                "status": "sent",
                "sent_at": {"$gte": today_start}
            })
            today_failed = await self.collection.count_documents({
                "user_id": user_id,
                "status": "failed",
                "created_at": {"$gte": today_start}
            })

            stats["sent_today"] = today_sent
            stats["failed_today"] = today_failed

            return NotificationStats(**stats)
        except Exception as e:
            logger.error(f"Get notification stats error: {e}")
            raise