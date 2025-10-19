from typing import List, Optional
from datetime import datetime
from models.payment import (
    PaymentCreate, PaymentUpdate, PaymentInDB, PaymentResponse,
    PaymentListResponse, BillingHistoryResponse, BillingHistoryItem
)
from database.mongodb import MongoDB
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def __init__(self):
        self.db = MongoDB.get_database()
        self.collection = self.db.payments
        self.billing_collection = self.db.billing_history

    async def create_payment_method(self, payment_data: PaymentCreate) -> PaymentResponse:
        """Create a new payment method for a user"""
        try:
            # If this is set as default, unset other defaults
            if payment_data.is_default:
                await self._unset_other_defaults(payment_data.user_id)

            payment_dict = payment_data.dict()
            payment_dict.update({
                "status": "active",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })

            result = await self.collection.insert_one(payment_dict)
            payment_dict["id"] = str(result.inserted_id)

            return PaymentResponse(**payment_dict)
        except Exception as e:
            logger.error(f"Create payment method error: {e}")
            raise

    async def get_user_payment_methods(self, user_id: str) -> PaymentListResponse:
        """Get all payment methods for a user"""
        try:
            payments = []
            cursor = self.collection.find({
                "user_id": user_id,
                "status": "active"
            }).sort("created_at", -1)

            async for payment in cursor:
                payment["id"] = str(payment["_id"])
                payments.append(PaymentResponse(**payment))

            default_payment = next((p for p in payments if p.is_default), None)
            default_id = default_payment.id if default_payment else None

            return PaymentListResponse(
                payments=payments,
                total=len(payments),
                default_payment_id=default_id
            )
        except Exception as e:
            logger.error(f"Get user payment methods error: {e}")
            raise

    async def get_payment_method_by_id(self, payment_id: str, user_id: str) -> Optional[PaymentResponse]:
        """Get a specific payment method by ID"""
        try:
            from bson import ObjectId
            payment = await self.collection.find_one({
                "_id": ObjectId(payment_id),
                "user_id": user_id,
                "status": "active"
            })

            if payment:
                payment["id"] = str(payment["_id"])
                return PaymentResponse(**payment)
            return None
        except Exception as e:
            logger.error(f"Get payment method by ID error: {e}")
            raise

    async def update_payment_method(self, payment_id: str, user_id: str, update_data: PaymentUpdate) -> Optional[PaymentResponse]:
        """Update a payment method"""
        try:
            from bson import ObjectId

            # If setting as default, unset other defaults
            if update_data.is_default:
                await self._unset_other_defaults(user_id)

            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            result = await self.collection.update_one(
                {"_id": ObjectId(payment_id), "user_id": user_id, "status": "active"},
                {"$set": update_dict}
            )

            if result.modified_count:
                return await self.get_payment_method_by_id(payment_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Update payment method error: {e}")
            raise

    async def delete_payment_method(self, payment_id: str, user_id: str) -> bool:
        """Delete a payment method (soft delete by setting status to removed)"""
        try:
            from bson import ObjectId
            result = await self.collection.update_one(
                {"_id": ObjectId(payment_id), "user_id": user_id, "status": "active"},
                {"$set": {"status": "removed", "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Delete payment method error: {e}")
            raise

    async def set_default_payment_method(self, payment_id: str, user_id: str) -> Optional[PaymentResponse]:
        """Set a payment method as default"""
        try:
            from bson import ObjectId

            # Unset all defaults first
            await self._unset_other_defaults(user_id)

            # Set this one as default
            result = await self.collection.update_one(
                {"_id": ObjectId(payment_id), "user_id": user_id, "status": "active"},
                {"$set": {"is_default": True, "updated_at": datetime.utcnow()}}
            )

            if result.modified_count:
                return await self.get_payment_method_by_id(payment_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Set default payment method error: {e}")
            raise

    async def get_billing_history(self, user_id: str, skip: int = 0, limit: int = 50) -> BillingHistoryResponse:
        """Get billing history for a user"""
        try:
            history = []
            cursor = self.billing_collection.find({"user_id": user_id}).sort("date", -1).skip(skip).limit(limit)

            async for item in cursor:
                item["id"] = str(item["_id"])
                history.append(BillingHistoryItem(**item))

            return BillingHistoryResponse(
                history=history,
                total=len(history)
            )
        except Exception as e:
            logger.error(f"Get billing history error: {e}")
            raise

    async def _unset_other_defaults(self, user_id: str):
        """Unset default flag for all other payment methods of a user"""
        try:
            await self.collection.update_many(
                {"user_id": user_id, "is_default": True, "status": "active"},
                {"$set": {"is_default": False, "updated_at": datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"Unset other payment defaults error: {e}")
            raise