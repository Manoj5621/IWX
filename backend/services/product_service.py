from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from database.mongodb import MongoDB, PRODUCTS_COLLECTION
from models.product import (
    ProductCreate, ProductUpdate, ProductInDB, ProductResponse,
    ProductListResponse, ProductSearchFilters, ProductStats, ProductStatus
)
import logging

logger = logging.getLogger(__name__)

class ProductService:
    @staticmethod
    async def create_product(product_data: ProductCreate, created_by: str) -> ProductInDB:
        """Create a new product"""
        now = datetime.utcnow()
        product_doc = {
            "_id": str(ObjectId()),
            **product_data.dict(),
            "created_at": now,
            "updated_at": now,
            "created_by": created_by,
            "rating": 0.0,
            "review_count": 0,
            "view_count": 0,
            "is_featured": False,
            "is_trending": False,
            "is_sustainable": False
        }

        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).insert_one(product_doc)

        product_doc["id"] = product_doc["_id"]
        return ProductInDB(**product_doc)

    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[ProductInDB]:
        """Get product by ID"""
        product_doc = await MongoDB.get_collection(PRODUCTS_COLLECTION).find_one(
            {"_id": product_id}
        )

        if not product_doc:
            return None

        # Increment view count
        await MongoDB.get_collection(PRODUCTS_COLLECTION).update_one(
            {"_id": product_id},
            {"$inc": {"view_count": 1}}
        )

        product_doc["id"] = product_doc["_id"]
        return ProductInDB(**product_doc)

    @staticmethod
    async def update_product(product_id: str, update_data: ProductUpdate) -> Optional[ProductInDB]:
        """Update product information"""
        update_dict = {"updated_at": datetime.utcnow()}

        # Only include non-None values
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_dict[field] = value

        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).update_one(
            {"_id": product_id},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await ProductService.get_product_by_id(product_id)

    @staticmethod
    async def delete_product(product_id: str) -> bool:
        """Delete product"""
        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).delete_one(
            {"_id": product_id}
        )
        return result.deleted_count > 0

    @staticmethod
    async def list_products(
        filters: ProductSearchFilters,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "-1"
    ) -> ProductListResponse:
        """List products with filters, pagination, and sorting"""
        query = {"status": {"$ne": ProductStatus.DRAFT}}

        # Apply filters
        if filters.query:
            query["$or"] = [
                {"name": {"$regex": filters.query, "$options": "i"}},
                {"description": {"$regex": filters.query, "$options": "i"}},
                {"brand": {"$regex": filters.query, "$options": "i"}}
            ]

        if filters.category:
            query["category"] = filters.category
        if filters.brand:
            query["brand"] = filters.brand
        if filters.status:
            query["status"] = filters.status

        if filters.min_price is not None or filters.max_price is not None:
            query["price"] = {}
            if filters.min_price is not None:
                query["price"]["$gte"] = filters.min_price
            if filters.max_price is not None:
                query["price"]["$lte"] = filters.max_price

        if filters.sizes:
            query["sizes"] = {"$in": filters.sizes}
        if filters.colors:
            query["colors"] = {"$in": filters.colors}
        if filters.tags:
            query["tags"] = {"$in": filters.tags}

        if filters.is_featured is not None:
            query["is_featured"] = filters.is_featured
        if filters.is_trending is not None:
            query["is_trending"] = filters.is_trending
        if filters.is_sustainable is not None:
            query["is_sustainable"] = filters.is_sustainable

        # Get total count
        total = await MongoDB.get_collection(PRODUCTS_COLLECTION).count_documents(query)

        # Get products with sorting
        sort_field = sort_by if sort_by != "relevance" else "created_at"
        cursor = MongoDB.get_collection(PRODUCTS_COLLECTION).find(query)\
            .sort(sort_field, int(sort_order))\
            .skip(skip)\
            .limit(limit)

        products = []
        async for product_doc in cursor:
            product_doc["id"] = product_doc["_id"]
            try:
                # Try to create ProductInDB with validation, but handle missing fields gracefully
                product = ProductInDB(**product_doc)
                products.append(ProductResponse(**product.dict()))
            except Exception as e:
                logger.warning(f"Failed to parse product {product_doc.get('_id')}: {e}")
                # Skip invalid products but continue processing others
                continue

        return ProductListResponse(
            products=products,
            total=total,
            page=(skip // limit) + 1,
            limit=limit,
            has_next=(skip + limit) < total,
            has_prev=skip > 0
        )

    @staticmethod
    async def get_featured_products(limit: int = 8) -> List[ProductResponse]:
        """Get featured products"""
        cursor = MongoDB.get_collection(PRODUCTS_COLLECTION).find(
            {"is_featured": True, "status": ProductStatus.ACTIVE}
        ).limit(limit)

        products = []
        async for product_doc in cursor:
            product_doc["id"] = product_doc["_id"]
            try:
                # Try to create ProductInDB with validation, but handle missing fields gracefully
                product = ProductInDB(**product_doc)
                products.append(ProductResponse(**product.dict()))
            except Exception as e:
                logger.warning(f"Failed to parse product {product_doc.get('_id')}: {e}")
                # Skip invalid products but continue processing others
                continue

        return products

    @staticmethod
    async def get_trending_products(limit: int = 8) -> List[ProductResponse]:
        """Get trending products"""
        cursor = MongoDB.get_collection(PRODUCTS_COLLECTION).find(
            {"is_trending": True, "status": ProductStatus.ACTIVE}
        ).sort("view_count", -1).limit(limit)

        products = []
        async for product_doc in cursor:
            product_doc["id"] = product_doc["_id"]
            try:
                # Try to create ProductInDB with validation, but handle missing fields gracefully
                product = ProductInDB(**product_doc)
                products.append(ProductResponse(**product.dict()))
            except Exception as e:
                logger.warning(f"Failed to parse product {product_doc.get('_id')}: {e}")
                # Skip invalid products but continue processing others
                continue

        return products

    @staticmethod
    async def get_new_arrivals(limit: int = 8) -> List[ProductResponse]:
        """Get new arrival products"""
        cursor = MongoDB.get_collection(PRODUCTS_COLLECTION).find(
            {"status": ProductStatus.ACTIVE}
        ).sort("created_at", -1).limit(limit)

        products = []
        async for product_doc in cursor:
            product_doc["id"] = product_doc["_id"]
            try:
                # Try to create ProductInDB with validation, but handle missing fields gracefully
                product = ProductInDB(**product_doc)
                products.append(ProductResponse(**product.dict()))
            except Exception as e:
                logger.warning(f"Failed to parse product {product_doc.get('_id')}: {e}")
                # Skip invalid products but continue processing others
                continue

        return products

    @staticmethod
    async def get_product_stats() -> ProductStats:
        """Get product statistics"""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_products": {"$sum": 1},
                    "active_products": {
                        "$sum": {"$cond": [{"$eq": ["$status", ProductStatus.ACTIVE]}, 1, 0]}
                    },
                    "out_of_stock": {
                        "$sum": {"$cond": [{"$eq": ["$inventory_quantity", 0]}, 1, 0]}
                    },
                    "featured_products": {
                        "$sum": {"$cond": [{"$eq": ["$is_featured", True]}, 1, 0]}
                    },
                    "total_value": {"$sum": {"$multiply": ["$price", "$inventory_quantity"]}},
                    "prices": {"$push": "$price"}
                }
            },
            {
                "$lookup": {
                    "from": PRODUCTS_COLLECTION,
                    "pipeline": [
                        {"$match": {"status": ProductStatus.ACTIVE}},
                        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
                    ],
                    "as": "category_counts"
                }
            }
        ]

        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).aggregate(pipeline).to_list(1)

        if not result:
            return ProductStats(
                total_products=0,
                active_products=0,
                out_of_stock=0,
                featured_products=0,
                total_value=0.0,
                average_price=0.0,
                products_by_category={}
            )

        stats = result[0]
        prices = stats.get("prices", [])
        average_price = sum(prices) / len(prices) if prices else 0.0
        products_by_category = {item["_id"]: item["count"] for item in stats.get("category_counts", [])}

        return ProductStats(
            total_products=stats["total_products"],
            active_products=stats["active_products"],
            out_of_stock=stats["out_of_stock"],
            featured_products=stats["featured_products"],
            total_value=stats["total_value"],
            average_price=round(average_price, 2),
            products_by_category=products_by_category
        )

    @staticmethod
    async def update_product_status(product_id: str, status: ProductStatus) -> bool:
        """Update product status"""
        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).update_one(
            {"_id": product_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    @staticmethod
    async def bulk_update_products(product_ids: List[str], updates: Dict[str, Any]) -> int:
        """Bulk update multiple products"""
        updates["updated_at"] = datetime.utcnow()

        result = await MongoDB.get_collection(PRODUCTS_COLLECTION).update_many(
            {"_id": {"$in": product_ids}},
            {"$set": updates}
        )
        return result.modified_count