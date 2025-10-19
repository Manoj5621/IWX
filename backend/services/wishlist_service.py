from typing import List, Optional
from datetime import datetime
from models.wishlist import (
    WishlistItemCreate, WishlistItemUpdate, WishlistItemInDB,
    WishlistItemResponse, WishlistResponse, WishlistStats
)
from models.product import ProductResponse
from services.product_service import ProductService
from database.mongodb import MongoDB
import logging

logger = logging.getLogger(__name__)

class WishlistService:
    def __init__(self):
        self.db = MongoDB.get_database()
        self.collection = self.db.wishlist
        self.product_service = ProductService()

    async def add_to_wishlist(self, item_data: WishlistItemCreate) -> WishlistItemResponse:
        """Add an item to user's wishlist"""
        try:
            # Check if item already exists
            existing = await self.collection.find_one({
                "user_id": item_data.user_id,
                "product_id": item_data.product_id,
                "size": item_data.size,
                "color": item_data.color
            })

            if existing:
                # Update quantity if exists
                await self.collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {
                        "quantity": item_data.quantity,
                        "notes": item_data.notes,
                        "updated_at": datetime.utcnow()
                    }}
                )
                existing["quantity"] = item_data.quantity
                existing["notes"] = item_data.notes
                existing["updated_at"] = datetime.utcnow()
                existing["id"] = str(existing["_id"])
                return WishlistItemResponse(**existing)

            # Create new item
            item_dict = item_data.dict()
            item_dict.update({
                "added_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })

            result = await self.collection.insert_one(item_dict)
            item_dict["id"] = str(result.inserted_id)

            return WishlistItemResponse(**item_dict)
        except Exception as e:
            logger.error(f"Add to wishlist error: {e}")
            raise

    async def get_user_wishlist(self, user_id: str) -> WishlistResponse:
        """Get user's wishlist with product details"""
        try:
            items = []
            cursor = self.collection.find({"user_id": user_id}).sort("added_at", -1)

            async for item in cursor:
                item["id"] = str(item["_id"])

                # Get product details
                product = await self.product_service.get_product_by_id(item["product_id"])
                item["product"] = product.dict() if product else None

                items.append(WishlistItemResponse(**item))

            return WishlistResponse(
                user_id=user_id,
                items=items,
                total_items=len(items),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Get user wishlist error: {e}")
            raise

    async def update_wishlist_item(self, item_id: str, user_id: str, update_data: WishlistItemUpdate) -> Optional[WishlistItemResponse]:
        """Update a wishlist item"""
        try:
            from bson import ObjectId

            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            result = await self.collection.update_one(
                {"_id": ObjectId(item_id), "user_id": user_id},
                {"$set": update_dict}
            )

            if result.modified_count:
                return await self.get_wishlist_item_by_id(item_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Update wishlist item error: {e}")
            raise

    async def remove_from_wishlist(self, item_id: str, user_id: str) -> bool:
        """Remove an item from wishlist"""
        try:
            from bson import ObjectId
            result = await self.collection.delete_one({
                "_id": ObjectId(item_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Remove from wishlist error: {e}")
            raise

    async def get_wishlist_item_by_id(self, item_id: str, user_id: str) -> Optional[WishlistItemResponse]:
        """Get a specific wishlist item by ID"""
        try:
            from bson import ObjectId
            item = await self.collection.find_one({
                "_id": ObjectId(item_id),
                "user_id": user_id
            })

            if item:
                item["id"] = str(item["_id"])

                # Get product details
                product = await self.product_service.get_product_by_id(item["product_id"])
                item["product"] = product.dict() if product else None

                return WishlistItemResponse(**item)
            return None
        except Exception as e:
            logger.error(f"Get wishlist item by ID error: {e}")
            raise

    async def check_in_wishlist(self, user_id: str, product_id: str, size: Optional[str] = None, color: Optional[str] = None) -> bool:
        """Check if a product is in user's wishlist"""
        try:
            query = {
                "user_id": user_id,
                "product_id": product_id
            }

            if size is not None:
                query["size"] = size
            if color is not None:
                query["color"] = color

            count = await self.collection.count_documents(query)
            return count > 0
        except Exception as e:
            logger.error(f"Check in wishlist error: {e}")
            raise

    async def get_wishlist_stats(self, user_id: str) -> WishlistStats:
        """Get wishlist statistics for a user"""
        try:
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$lookup": {
                    "from": "products",
                    "localField": "product_id",
                    "foreignField": "_id",
                    "as": "product"
                }},
                {"$unwind": {"path": "$product", "preserveNullAndEmptyArrays": True}},
                {"$group": {
                    "_id": None,
                    "total_items": {"$sum": 1},
                    "in_stock_items": {
                        "$sum": {"$cond": [{"$gt": ["$product.inventory_quantity", 0]}, 1, 0]}
                    },
                    "total_value": {
                        "$sum": {"$multiply": ["$product.price", "$quantity"]}
                    }
                }}
            ]

            result = await self.collection.aggregate(pipeline).to_list(length=1)

            if result:
                stats = result[0]
                return WishlistStats(
                    total_items=stats.get("total_items", 0),
                    in_stock_items=stats.get("in_stock_items", 0),
                    out_of_stock_items=stats.get("total_items", 0) - stats.get("in_stock_items", 0),
                    total_value=stats.get("total_value", 0)
                )

            return WishlistStats(total_items=0, in_stock_items=0, out_of_stock_items=0, total_value=0)
        except Exception as e:
            logger.error(f"Get wishlist stats error: {e}")
            raise