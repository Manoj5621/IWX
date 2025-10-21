from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import Dict, List
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws")

class ConnectionManager:
    """WebSocket connection manager for real-time updates"""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "dashboard": [],  # Admin dashboard updates
            "products": [],   # Product updates
            "orders": [],     # Order updates
            "users": []       # User activity
        }

    async def connect(self, websocket: WebSocket, channel: str):
        """Connect to a channel"""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"Client connected to {channel} channel")

    def disconnect(self, websocket: WebSocket, channel: str):
        """Disconnect from a channel"""
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            logger.info(f"Client disconnected from {channel} channel")

    async def broadcast(self, channel: str, message: dict):
        """Broadcast message to all clients in a channel"""
        if channel not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[channel]:
            try:
                await connection.send_json({
                    **message,
                    "timestamp": datetime.utcnow().isoformat(),
                    "channel": channel
                })
            except Exception as e:
                logger.error(f"Failed to send message to client: {e}")
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, channel)

    async def send_to_user(self, user_id: str, message: dict):
        """Send message to specific user (if connected)"""
        # This would require tracking user connections
        pass

# Global connection manager
manager = ConnectionManager()

@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """WebSocket for admin dashboard real-time updates"""
    # Get token from query parameters
    token = websocket.query_params.get('token')

    # Authenticate user if token is provided
    if token:
        from auth.security import verify_token
        from auth.dependencies import get_current_admin_user
        from models.user import UserInDB

        payload = verify_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                from database.mongodb import MongoDB, USERS_COLLECTION
                user_doc = await MongoDB.get_collection(USERS_COLLECTION).find_one({"_id": user_id})
                if user_doc and user_doc.get("role") == "admin" and user_doc.get("status") == "active":
                    await manager.connect(websocket, "dashboard")
                else:
                    await websocket.close(code=1008, reason="Unauthorized")
                    return
            else:
                await websocket.close(code=1008, reason="Invalid token")
                return
        else:
            await websocket.close(code=1008, reason="Invalid token")
            return
    else:
        await websocket.close(code=1008, reason="Authentication required")
        return

    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            # Handle client messages if needed
            logger.info(f"Dashboard WS received: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, "dashboard")
    except Exception as e:
        logger.error(f"Dashboard WebSocket error: {e}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass

@router.websocket("/products")
async def products_websocket(websocket: WebSocket):
    """WebSocket for product updates"""
    await manager.connect(websocket, "products")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Products WS received: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, "products")

@router.websocket("/orders")
async def orders_websocket(websocket: WebSocket):
    """WebSocket for order updates"""
    await manager.connect(websocket, "orders")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Orders WS received: {data}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, "orders")

# Utility functions for broadcasting updates
async def broadcast_dashboard_update(update_type: str, data: dict):
    """Broadcast dashboard update"""
    await manager.broadcast("dashboard", {
        "type": update_type,
        "data": data
    })

async def broadcast_product_update(product_id: str, update_type: str, data: dict):
    """Broadcast product update"""
    await manager.broadcast("products", {
        "type": update_type,
        "product_id": product_id,
        "data": data
    })

async def broadcast_order_update(order_id: str, update_type: str, data: dict):
    """Broadcast order update"""
    await manager.broadcast("orders", {
        "type": update_type,
        "order_id": order_id,
        "data": data
    })

async def broadcast_user_activity(user_id: str, activity_type: str, data: dict):
    """Broadcast user activity"""
    await manager.broadcast("users", {
        "type": activity_type,
        "user_id": user_id,
        "data": data
    })