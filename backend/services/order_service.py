from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import string
import random
from database.mongodb import MongoDB, ORDERS_COLLECTION, PRODUCTS_COLLECTION
from models.order import (
    OrderCreate, OrderUpdate, OrderInDB, OrderResponse,
    OrderListResponse, OrderStats, Cart, CartResponse, OrderStatus, PaymentStatus
)
from models.product import ProductInDB
import logging

logger = logging.getLogger(__name__)

class OrderService:
    @staticmethod
    def generate_order_number() -> str:
        """Generate unique order number"""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"IWX{timestamp}{random_chars}"

    @staticmethod
    async def create_order(order_data: OrderCreate) -> OrderInDB:
        """Create a new order"""
        # Validate and calculate order totals
        items_with_details = []
        subtotal = 0.0

        for item in order_data.items:
            # Get product details
            product_doc = await MongoDB.get_collection(PRODUCTS_COLLECTION).find_one(
                {"_id": item.product_id}
            )
            if not product_doc:
                raise ValueError(f"Product {item.product_id} not found")

            product = ProductInDB(**product_doc)
            product_doc["id"] = product_doc["_id"]

            # Check inventory
            if product.inventory_quantity < item.quantity:
                raise ValueError(f"Insufficient inventory for product {product.name}")

            # Calculate item subtotal
            price = product.sale_price if product.sale_price else product.price
            item_subtotal = price * item.quantity
            subtotal += item_subtotal

            items_with_details.append({
                **item.dict(),
                "product": product,
                "price": price,
                "subtotal": item_subtotal
            })

        # Calculate totals
        tax_rate = 0.08  # 8% tax
        shipping_cost = 9.99 if subtotal < 100 else 0.0  # Free shipping over $100
        tax_amount = subtotal * tax_rate
        discount_amount = 0.0  # Could be calculated based on coupons
        total_amount = subtotal + tax_amount + shipping_cost - discount_amount

        now = datetime.utcnow()
        order_doc = {
            "_id": str(ObjectId()),
            **order_data.dict(),
            "order_number": OrderService.generate_order_number(),
            "status": OrderStatus.PENDING,
            "payment_status": PaymentStatus.PENDING,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "shipping_cost": shipping_cost,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "tracking_number": None,
            "notes": None,
            "created_at": now,
            "updated_at": now,
            "shipped_at": None,
            "delivered_at": None
        }

        # Insert order
        result = await MongoDB.get_collection(ORDERS_COLLECTION).insert_one(order_doc)

        # Update product inventory
        for item in order_data.items:
            await MongoDB.get_collection(PRODUCTS_COLLECTION).update_one(
                {"_id": item.product_id},
                {"$inc": {"inventory_quantity": -item.quantity}}
            )

        order_doc["id"] = order_doc["_id"]
        return OrderInDB(**order_doc)

    @staticmethod
    async def get_order_by_id(order_id: str) -> Optional[OrderInDB]:
        """Get order by ID"""
        order_doc = await MongoDB.get_collection(ORDERS_COLLECTION).find_one(
            {"_id": order_id}
        )

        if not order_doc:
            return None

        order_doc["id"] = order_doc["_id"]
        return OrderInDB(**order_doc)

    @staticmethod
    async def get_order_by_number(order_number: str) -> Optional[OrderInDB]:
        """Get order by order number"""
        order_doc = await MongoDB.get_collection(ORDERS_COLLECTION).find_one(
            {"order_number": order_number}
        )

        if not order_doc:
            return None

        order_doc["id"] = order_doc["_id"]
        return OrderInDB(**order_doc)

    @staticmethod
    async def update_order(order_id: str, update_data: OrderUpdate) -> Optional[OrderInDB]:
        """Update order information"""
        update_dict = {"updated_at": datetime.utcnow()}

        # Handle status changes
        if update_data.status:
            update_dict["status"] = update_data.status
            if update_data.status == OrderStatus.SHIPPED and not update_dict.get("shipped_at"):
                update_dict["shipped_at"] = datetime.utcnow()
            elif update_data.status == OrderStatus.DELIVERED and not update_dict.get("delivered_at"):
                update_dict["delivered_at"] = datetime.utcnow()

        if update_data.payment_status:
            update_dict["payment_status"] = update_data.payment_status

        if update_data.tracking_number is not None:
            update_dict["tracking_number"] = update_data.tracking_number

        if update_data.notes is not None:
            update_dict["notes"] = update_data.notes

        result = await MongoDB.get_collection(ORDERS_COLLECTION).update_one(
            {"_id": order_id},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await OrderService.get_order_by_id(order_id)

    @staticmethod
    async def list_orders(
        user_id: Optional[str] = None,
        status: Optional[OrderStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> OrderListResponse:
        """List orders with filters"""
        query = {}

        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status

        # Get total count
        total = await MongoDB.get_collection(ORDERS_COLLECTION).count_documents(query)

        # Get orders
        cursor = MongoDB.get_collection(ORDERS_COLLECTION).find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)

        orders = []
        async for order_doc in cursor:
            order_doc["id"] = order_doc["_id"]
            order = OrderInDB(**order_doc)
            orders.append(OrderResponse(**order.dict()))

        return OrderListResponse(
            orders=orders,
            total=total,
            page=(skip // limit) + 1,
            limit=limit,
            has_next=(skip + limit) < total,
            has_prev=skip > 0
        )

    @staticmethod
    async def get_order_stats() -> OrderStats:
        """Get order statistics"""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_orders": {"$sum": 1},
                    "pending_orders": {
                        "$sum": {"$cond": [{"$eq": ["$status", OrderStatus.PENDING]}, 1, 0]}
                    },
                    "processing_orders": {
                        "$sum": {"$cond": [{"$eq": ["$status", OrderStatus.PROCESSING]}, 1, 0]}
                    },
                    "shipped_orders": {
                        "$sum": {"$cond": [{"$eq": ["$status", OrderStatus.SHIPPED]}, 1, 0]}
                    },
                    "delivered_orders": {
                        "$sum": {"$cond": [{"$eq": ["$status", OrderStatus.DELIVERED]}, 1, 0]}
                    },
                    "cancelled_orders": {
                        "$sum": {"$cond": [{"$eq": ["$status", OrderStatus.CANCELLED]}, 1, 0]}
                    },
                    "total_revenue": {"$sum": "$total_amount"},
                    "order_values": {"$push": "$total_amount"}
                }
            },
            {
                "$addFields": {
                    "orders_today": {
                        "$size": {
                            "$filter": {
                                "input": "$order_values",
                                "cond": {
                                    "$gte": ["$$this", datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)]
                                }
                            }
                        }
                    },
                    "revenue_today": {
                        "$sum": {
                            "$cond": [
                                {"$gte": ["$created_at", datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)]},
                                "$total_amount", 0
                            ]
                        }
                    }
                }
            }
        ]

        result = await MongoDB.get_collection(ORDERS_COLLECTION).aggregate(pipeline).to_list(1)

        if not result:
            return OrderStats(
                total_orders=0,
                pending_orders=0,
                processing_orders=0,
                shipped_orders=0,
                delivered_orders=0,
                cancelled_orders=0,
                total_revenue=0.0,
                average_order_value=0.0,
                orders_today=0,
                revenue_today=0.0
            )

        stats = result[0]
        order_values = stats.get("order_values", [])
        average_order_value = sum(order_values) / len(order_values) if order_values else 0.0

        return OrderStats(
            total_orders=stats["total_orders"],
            pending_orders=stats["pending_orders"],
            processing_orders=stats["processing_orders"],
            shipped_orders=stats["shipped_orders"],
            delivered_orders=stats["delivered_orders"],
            cancelled_orders=stats["cancelled_orders"],
            total_revenue=stats["total_revenue"],
            average_order_value=round(average_order_value, 2),
            orders_today=stats.get("orders_today", 0),
            revenue_today=stats.get("revenue_today", 0.0)
        )

    @staticmethod
    async def get_user_cart(user_id: str) -> CartResponse:
        """Get user's cart"""
        # For now, using a simple in-memory approach
        # In production, this should be stored in database
        cart_doc = await MongoDB.get_collection("carts").find_one({"user_id": user_id})

        if not cart_doc:
            return CartResponse(
                user_id=user_id,
                items=[],
                subtotal=0.0,
                tax_amount=0.0,
                shipping_cost=0.0,
                total_amount=0.0,
                item_count=0
            )

        # Get product details for cart items
        items_with_details = []
        subtotal = 0.0

        for item in cart_doc.get("items", []):
            product_doc = await MongoDB.get_collection(PRODUCTS_COLLECTION).find_one(
                {"_id": item["product_id"]}
            )
            if product_doc:
                product = ProductInDB(**product_doc)
                product_doc["id"] = product_doc["_id"]

                price = product.sale_price if product.sale_price else product.price
                item_subtotal = price * item["quantity"]
                subtotal += item_subtotal

                items_with_details.append({
                    **item,
                    "product": product,
                    "price": price,
                    "subtotal": item_subtotal
                })

        tax_amount = subtotal * 0.08
        shipping_cost = 9.99 if subtotal < 100 else 0.0
        total_amount = subtotal + tax_amount + shipping_cost

        return CartResponse(
            user_id=user_id,
            items=items_with_details,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            item_count=len(items_with_details)
        )

    @staticmethod
    async def update_cart(user_id: str, items: List[Dict[str, Any]]) -> CartResponse:
        """Update user's cart"""
        cart_doc = {
            "user_id": user_id,
            "items": items,
            "updated_at": datetime.utcnow()
        }

        await MongoDB.get_collection("carts").replace_one(
            {"user_id": user_id},
            cart_doc,
            upsert=True
        )

        return await OrderService.get_user_cart(user_id)

    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int = 1, size: Optional[str] = None, color: Optional[str] = None) -> CartResponse:
        """Add item to cart"""
        cart = await OrderService.get_user_cart(user_id)

        # Check if item already exists
        existing_item = None
        for item in cart.items:
            if (item["product_id"] == product_id and
                item.get("size") == size and
                item.get("color") == color):
                existing_item = item
                break

        if existing_item:
            existing_item["quantity"] += quantity
        else:
            cart.items.append({
                "product_id": product_id,
                "quantity": quantity,
                "size": size,
                "color": color
            })

        return await OrderService.update_cart(user_id, cart.items)

    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str, size: Optional[str] = None, color: Optional[str] = None) -> CartResponse:
        """Remove item from cart"""
        cart = await OrderService.get_user_cart(user_id)

        cart.items = [
            item for item in cart.items
            if not (item["product_id"] == product_id and
                   item.get("size") == size and
                   item.get("color") == color)
        ]

        return await OrderService.update_cart(user_id, cart.items)