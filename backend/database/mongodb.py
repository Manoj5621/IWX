from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

    @classmethod
    async def connect_to_mongo(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            # Test the connection
            await cls.client.admin.command('ping')
            # Extract database name from URL or use default
            from urllib.parse import urlparse
            parsed = urlparse(settings.mongodb_url)
            db_name = parsed.path.lstrip('/') or 'iwx_ecommerce'
            cls.database = cls.client[db_name]
            logger.info("Connected to MongoDB")
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_mongo_connection(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("Disconnected from MongoDB")

    @classmethod
    def get_database(cls):
        """Get database instance"""
        if cls.database is None:
            raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
        return cls.database

    @classmethod
    def get_collection(cls, collection_name: str):
        """Get collection instance"""
        db = cls.get_database()
        return db[collection_name]

# Collections
USERS_COLLECTION = "users"
PRODUCTS_COLLECTION = "products"
CATEGORIES_COLLECTION = "categories"
ORDERS_COLLECTION = "orders"
REVIEWS_COLLECTION = "reviews"
WISHLISTS_COLLECTION = "wishlists"
SESSIONS_COLLECTION = "sessions"
ANALYTICS_COLLECTION = "analytics"
CARTS_COLLECTION = "carts"