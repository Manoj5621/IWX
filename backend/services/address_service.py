from typing import List, Optional
from datetime import datetime
from models.address import (
    AddressCreate, AddressUpdate, AddressInDB, AddressResponse,
    AddressListResponse
)
from database.mongodb import MongoDB
import logging

logger = logging.getLogger(__name__)

class AddressService:
    def __init__(self):
        self.db = MongoDB.get_database()
        self.collection = self.db.addresses

    async def create_address(self, address_data: AddressCreate) -> AddressResponse:
        """Create a new address for a user"""
        try:
            # If this is set as default, unset other defaults
            if address_data.is_default:
                await self._unset_other_defaults(address_data.user_id)

            address_dict = address_data.dict()
            address_dict.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })

            result = await self.collection.insert_one(address_dict)
            address_dict["id"] = str(result.inserted_id)

            return AddressResponse(**address_dict)
        except Exception as e:
            logger.error(f"Create address error: {e}")
            raise

    async def get_user_addresses(self, user_id: str) -> AddressListResponse:
        """Get all addresses for a user"""
        try:
            addresses = []
            cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
            async for address in cursor:
                address["id"] = str(address["_id"])
                addresses.append(AddressResponse(**address))

            default_address = next((addr for addr in addresses if addr.is_default), None)
            default_id = default_address.id if default_address else None

            return AddressListResponse(
                addresses=addresses,
                total=len(addresses),
                default_address_id=default_id
            )
        except Exception as e:
            logger.error(f"Get user addresses error: {e}")
            raise

    async def get_address_by_id(self, address_id: str, user_id: str) -> Optional[AddressResponse]:
        """Get a specific address by ID"""
        try:
            from bson import ObjectId
            address = await self.collection.find_one({
                "_id": ObjectId(address_id),
                "user_id": user_id
            })

            if address:
                address["id"] = str(address["_id"])
                return AddressResponse(**address)
            return None
        except Exception as e:
            logger.error(f"Get address by ID error: {e}")
            raise

    async def update_address(self, address_id: str, user_id: str, update_data: AddressUpdate) -> Optional[AddressResponse]:
        """Update an address"""
        try:
            from bson import ObjectId

            # If setting as default, unset other defaults
            if update_data.is_default:
                await self._unset_other_defaults(user_id)

            update_dict = update_data.dict(exclude_unset=True)
            update_dict["updated_at"] = datetime.utcnow()

            result = await self.collection.update_one(
                {"_id": ObjectId(address_id), "user_id": user_id},
                {"$set": update_dict}
            )

            if result.modified_count:
                return await self.get_address_by_id(address_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Update address error: {e}")
            raise

    async def delete_address(self, address_id: str, user_id: str) -> bool:
        """Delete an address"""
        try:
            from bson import ObjectId
            result = await self.collection.delete_one({
                "_id": ObjectId(address_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Delete address error: {e}")
            raise

    async def set_default_address(self, address_id: str, user_id: str) -> Optional[AddressResponse]:
        """Set an address as default"""
        try:
            from bson import ObjectId

            # Unset all defaults first
            await self._unset_other_defaults(user_id)

            # Set this one as default
            result = await self.collection.update_one(
                {"_id": ObjectId(address_id), "user_id": user_id},
                {"$set": {"is_default": True, "updated_at": datetime.utcnow()}}
            )

            if result.modified_count:
                return await self.get_address_by_id(address_id, user_id)
            return None
        except Exception as e:
            logger.error(f"Set default address error: {e}")
            raise

    async def _unset_other_defaults(self, user_id: str):
        """Unset default flag for all other addresses of a user"""
        try:
            await self.collection.update_many(
                {"user_id": user_id, "is_default": True},
                {"$set": {"is_default": False, "updated_at": datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"Unset other defaults error: {e}")
            raise