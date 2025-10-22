from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import string
import random
from database.mongodb import MongoDB, ORDERS_COLLECTION, PRODUCTS_COLLECTION, CARTS_COLLECTION
from models.order import (
    OrderCreate, OrderUpdate, OrderInDB, OrderResponse,
    OrderListResponse, OrderStats, Cart, CartResponse, OrderStatus, PaymentStatus,
    ReturnRequestCreate, ReturnRequestUpdate, ReturnRequestInDB, ReturnRequestResponse,
    ReturnRequestListResponse, ReturnStats, ReturnStatus, RefundMethod
)
from models.product import ProductInDB
from routers.websocket import broadcast_cart_update
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
    def generate_return_number() -> str:
        """Generate unique return number"""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"RR{timestamp}{random_chars}"

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

            product_doc["id"] = product_doc["_id"]
            product = ProductInDB(**product_doc)

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
                "subtotal": item_subtotal,
                "name": product.name,
                "image": product.images[0] if product.images else None,
                "sku": product.sku,
                "brand": product.brand
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

        # Clear user's cart after successful order
        await OrderService.clear_user_cart(order_data.user_id)

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
    async def list_orders_admin(
        user_id: Optional[str] = None,
        status: Optional[OrderStatus] = None,
        payment_status: Optional[PaymentStatus] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
        sort_by: str = "created_at",
        sort_order: str = "-1"
    ) -> OrderListResponse:
        """List orders for admin with advanced filters"""
        query = {}

        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status
        if payment_status:
            query["payment_status"] = payment_status

        # Date range filter
        if start_date or end_date:
            date_query = {}
            if start_date:
                from datetime import datetime
                date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if end_date:
                from datetime import datetime
                date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["created_at"] = date_query

        # Search filter (order number, customer name, email)
        if search:
            search_regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"order_number": search_regex},
                {"user.first_name": search_regex},
                {"user.last_name": search_regex},
                {"user.email": search_regex}
            ]

        # Get total count
        total = await MongoDB.get_collection(ORDERS_COLLECTION).count_documents(query)

        # Build sort
        sort_direction = -1 if sort_order == "-1" else 1
        sort_field = sort_by
        if sort_by == "total_amount":
            sort_field = "total_amount"
        elif sort_by == "total_amount_asc":
            sort_field = "total_amount"
            sort_direction = 1
        elif sort_by == "created_at_asc":
            sort_field = "created_at"
            sort_direction = 1
        elif sort_by == "status":
            sort_field = "status"

        # Get orders with user information
        pipeline = [
            {"$match": query},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$sort": {sort_field: sort_direction}},
            {"$skip": skip},
            {"$limit": limit}
        ]

        cursor = MongoDB.get_collection(ORDERS_COLLECTION).aggregate(pipeline)

        orders = []
        async for order_doc in cursor:
            order_doc["id"] = order_doc["_id"]
            # Convert ObjectId to string for user
            if order_doc.get("user"):
                order_doc["user"]["id"] = str(order_doc["user"]["_id"])
                del order_doc["user"]["_id"]
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
        cart_doc = await MongoDB.get_collection(CARTS_COLLECTION).find_one({"user_id": user_id})

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
                product_doc["id"] = product_doc["_id"]
                product = ProductInDB(**product_doc)

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
        # Store only basic item data (product_id, quantity, size, color)
        basic_items = []
        for item in items:
            basic_items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "size": item.get("size"),
                "color": item.get("color")
            })

        cart_doc = {
            "user_id": user_id,
            "items": basic_items,
            "updated_at": datetime.utcnow()
        }

        await MongoDB.get_collection(CARTS_COLLECTION).replace_one(
            {"user_id": user_id},
            cart_doc,
            upsert=True
        )

        return await OrderService.get_user_cart(user_id)

    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int = 1, size: Optional[str] = None, color: Optional[str] = None) -> CartResponse:
        """Add item to cart with stock validation"""
        # Check product exists and has sufficient stock
        product_doc = await MongoDB.get_collection(PRODUCTS_COLLECTION).find_one(
            {"_id": product_id}
        )
        if not product_doc:
            raise ValueError(f"Product {product_id} not found")

        product_doc["id"] = product_doc["_id"]
        product = ProductInDB(**product_doc)

        # Get current cart
        cart = await OrderService.get_user_cart(user_id)

        # Check if item already exists
        existing_item = None
        for item in cart.items:
            if (item["product_id"] == product_id and
                item.get("size") == size and
                item.get("color") == color):
                existing_item = item
                break

        new_quantity = quantity
        if existing_item:
            new_quantity = existing_item["quantity"] + quantity

        # Validate stock - ensure inventory_quantity is a number
        try:
            available_stock = int(product.inventory_quantity)
        except (ValueError, TypeError):
            available_stock = 0

        if available_stock < new_quantity:
            raise ValueError(f"Insufficient stock. Available: {available_stock}, requested: {new_quantity}")

        if existing_item:
            existing_item["quantity"] = new_quantity
        else:
            cart.items.append({
                "product_id": product_id,
                "quantity": quantity,
                "size": size,
                "color": color
            })

        # Broadcast cart update
        updated_cart = await OrderService.update_cart(user_id, cart.items)
        await broadcast_cart_update(user_id, updated_cart.dict())
        return updated_cart

    @staticmethod
    async def update_cart_quantity(user_id: str, product_id: str, quantity: int, size: Optional[str] = None, color: Optional[str] = None) -> CartResponse:
        """Update cart item quantity with stock validation"""
        if quantity <= 0:
            return await OrderService.remove_from_cart(user_id, product_id, size, color)

        # Check product stock
        product_doc = await MongoDB.get_collection(PRODUCTS_COLLECTION).find_one(
            {"_id": product_id}
        )
        if not product_doc:
            raise ValueError(f"Product {product_id} not found")

        product_doc["id"] = product_doc["_id"]
        product = ProductInDB(**product_doc)

        # Validate stock - ensure inventory_quantity is a number
        try:
            available_stock = int(product.inventory_quantity)
        except (ValueError, TypeError):
            available_stock = 0

        if available_stock < quantity:
            raise ValueError(f"Insufficient stock. Available: {available_stock}, requested: {quantity}")

        # Get current cart
        cart = await OrderService.get_user_cart(user_id)

        # Find and update item
        for item in cart.items:
            if (item["product_id"] == product_id and
                item.get("size") == size and
                item.get("color") == color):
                item["quantity"] = quantity
                break

        # Broadcast cart update
        updated_cart = await OrderService.update_cart(user_id, cart.items)
        await broadcast_cart_update(user_id, updated_cart.dict())
        return updated_cart

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

        # Broadcast cart update
        updated_cart = await OrderService.update_cart(user_id, cart.items)
        await broadcast_cart_update(user_id, updated_cart.dict())
        return updated_cart

    @staticmethod
    async def clear_user_cart(user_id: str) -> None:
        """Clear user's cart after successful order"""
        await MongoDB.get_collection(CARTS_COLLECTION).delete_one({"user_id": user_id})

    # Return/Refund methods
    @staticmethod
    async def create_return_request(return_data: ReturnRequestCreate, user_id: str) -> ReturnRequestInDB:
        """Create a return request"""
        # Validate order ownership
        order = await OrderService.get_order_by_id(return_data.order_id)
        if not order:
            raise ValueError("Order not found")
        if order.user_id != user_id:
            raise ValueError("Order does not belong to user")

        # Validate order is eligible for return (delivered and within timeframe)
        if order.status != OrderStatus.DELIVERED:
            raise ValueError("Order must be delivered to be eligible for return")

        # Check if return window is still open (30 days)
        from datetime import timedelta
        if order.delivered_at and (datetime.utcnow() - order.delivered_at) > timedelta(days=30):
            raise ValueError("Return window has expired")

        # Validate return items
        total_refund = 0.0
        for return_item in return_data.items:
            # Find corresponding order item
            order_item = None
            for item in order.items:
                if item.id == return_item.order_item_id:
                    order_item = item
                    break

            if not order_item:
                raise ValueError(f"Order item {return_item.order_item_id} not found")

            if return_item.quantity > order_item.quantity:
                raise ValueError(f"Return quantity exceeds ordered quantity for item {return_item.order_item_id}")

            total_refund += order_item.price * return_item.quantity

        now = datetime.utcnow()
        return_doc = {
            "_id": str(ObjectId()),
            **return_data.dict(),
            "user_id": user_id,
            "return_number": OrderService.generate_return_number(),
            "status": ReturnStatus.REQUESTED,
            "refund_amount": total_refund,
            "created_at": now,
            "updated_at": now,
            "processed_at": None
        }

        # Insert return request
        await MongoDB.get_collection("return_requests").insert_one(return_doc)

        return_doc["id"] = return_doc["_id"]
        return ReturnRequestInDB(**return_doc)

    @staticmethod
    async def get_return_request(return_id: str, user_id: str) -> Optional[ReturnRequestInDB]:
        """Get return request by ID"""
        return_doc = await MongoDB.get_collection("return_requests").find_one({
            "_id": return_id,
            "user_id": user_id
        })

        if not return_doc:
            return None

        return_doc["id"] = return_doc["_id"]
        return ReturnRequestInDB(**return_doc)

    @staticmethod
    async def update_return_request(return_id: str, update_data: ReturnRequestUpdate) -> Optional[ReturnRequestInDB]:
        """Update return request"""
        update_dict = {"updated_at": datetime.utcnow()}

        if update_data.status:
            update_dict["status"] = update_data.status
            if update_data.status in [ReturnStatus.APPROVED, ReturnStatus.REJECTED, ReturnStatus.REFUNDED]:
                update_dict["processed_at"] = datetime.utcnow()

        if update_data.admin_notes is not None:
            update_dict["admin_notes"] = update_data.admin_notes

        if update_data.refund_amount is not None:
            update_dict["refund_amount"] = update_data.refund_amount

        result = await MongoDB.get_collection("return_requests").update_one(
            {"_id": return_id},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await OrderService.get_return_request(return_id, "")  # Admin can get any

    @staticmethod
    async def list_return_requests(
        user_id: Optional[str] = None,
        status: Optional[ReturnStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> ReturnRequestListResponse:
        """List return requests with filters"""
        query = {}

        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status

        total = await MongoDB.get_collection("return_requests").count_documents(query)

        cursor = MongoDB.get_collection("return_requests").find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)

        returns = []
        async for return_doc in cursor:
            return_doc["id"] = return_doc["_id"]
            return_request = ReturnRequestInDB(**return_doc)
            returns.append(ReturnRequestResponse(**return_request.dict()))

        return ReturnRequestListResponse(
            returns=returns,
            total=total,
            page=(skip // limit) + 1,
            limit=limit,
            has_next=(skip + limit) < total,
            has_prev=skip > 0
        )

    @staticmethod
    async def get_return_stats() -> ReturnStats:
        """Get return statistics"""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_returns": {"$sum": 1},
                    "pending_returns": {
                        "$sum": {"$cond": [{"$eq": ["$status", ReturnStatus.REQUESTED]}, 1, 0]}
                    },
                    "approved_returns": {
                        "$sum": {"$cond": [{"$eq": ["$status", ReturnStatus.APPROVED]}, 1, 0]}
                    },
                    "rejected_returns": {
                        "$sum": {"$cond": [{"$eq": ["$status", ReturnStatus.REJECTED]}, 1, 0]}
                    },
                    "completed_returns": {
                        "$sum": {"$cond": [{"$eq": ["$status", ReturnStatus.REFUNDED]}, 1, 0]}
                    },
                    "total_refund_amount": {"$sum": "$refund_amount"}
                }
            }
        ]

        result = await MongoDB.get_collection("return_requests").aggregate(pipeline).to_list(1)

        if not result:
            return ReturnStats(
                total_returns=0,
                pending_returns=0,
                approved_returns=0,
                rejected_returns=0,
                completed_returns=0,
                total_refund_amount=0.0
            )

        stats = result[0]
        return ReturnStats(**stats)