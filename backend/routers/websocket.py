from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import Dict, List
import json
import logging
from datetime import datetime
from auth.dependencies import get_current_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws")

class WebSocketManager:
    """Clean WebSocket connection manager"""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        """Connect to a channel"""
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        logger.info(f"Client connected to {channel} channel")

    def disconnect(self, websocket: WebSocket, channel: str):
        """Disconnect from a channel"""
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
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

# Global WebSocket manager
ws_manager = WebSocketManager()

@router.websocket("/admin-dashboard")
async def admin_dashboard_websocket(websocket: WebSocket, current_user: dict = Depends(get_current_admin_user)):
    """Clean WebSocket endpoint for admin dashboard"""
    await websocket.accept()
    await ws_manager.connect(websocket, "admin-dashboard")
    logger.info(f"Admin {current_user.get('id')} connected to dashboard WebSocket")

    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for connection health check
            await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "admin-dashboard")
        logger.info("Admin dashboard WebSocket disconnected")
    except Exception as e:
        logger.error(f"Admin dashboard WebSocket error: {e}")
        ws_manager.disconnect(websocket, "admin-dashboard")

@router.websocket("/products")
async def products_websocket(websocket: WebSocket):
    """WebSocket for product updates"""
    await websocket.accept()
    await ws_manager.connect(websocket, "products")

    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "products")
    except Exception as e:
        logger.error(f"Products WebSocket error: {e}")
        ws_manager.disconnect(websocket, "products")

@router.websocket("/orders")
async def orders_websocket(websocket: WebSocket):
    """WebSocket for order updates"""
    await websocket.accept()
    await ws_manager.connect(websocket, "orders")

    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "orders")
    except Exception as e:
        logger.error(f"Orders WebSocket error: {e}")
        ws_manager.disconnect(websocket, "orders")

# Clean broadcast functions
async def broadcast_to_channel(channel: str, message_type: str, data: dict):
    """Broadcast message to a specific channel"""
    await ws_manager.broadcast(channel, {
        "type": message_type,
        "data": data
    })

async def broadcast_dashboard_update(update_type: str, data: dict):
    """Broadcast dashboard update"""
    await broadcast_to_channel("admin-dashboard", update_type, data)

async def broadcast_product_update(product_id: str, update_type: str, data: dict):
    """Broadcast product update"""
    await broadcast_to_channel("products", update_type, {
        "product_id": product_id,
        **data
    })

async def broadcast_order_update(order_id: str, update_type: str, data: dict):
    """Broadcast order update"""
    await broadcast_to_channel("orders", update_type, {
        "order_id": order_id,
        **data
    })

# Admin dashboard broadcast functions
async def broadcast_inventory_update(message_type: str, data: dict):
    """Broadcast inventory update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_marketing_campaigns_update(message_type: str, data: dict):
    """Broadcast marketing campaigns update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_marketing_stats_update(message_type: str, data: dict):
    """Broadcast marketing stats update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_performance_update(message_type: str, data: dict):
    """Broadcast performance update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_customer_satisfaction_update(message_type: str, data: dict):
    """Broadcast customer satisfaction update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_traffic_update(message_type: str, data: dict):
    """Broadcast traffic update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_system_status_update(message_type: str, data: dict):
    """Broadcast system status update"""
    await broadcast_to_channel("admin-dashboard", message_type, data)

async def broadcast_user_activity(user_id: str, activity_type: str, data: dict):
    """Broadcast user activity"""
    await broadcast_to_channel("admin-dashboard", activity_type, {
        "user_id": user_id,
        **data
    })

# Trigger functions for data updates
async def trigger_traffic_data_update(data):
    """Trigger traffic data update"""
    await broadcast_traffic_update("traffic_update", {"sources": data})

async def trigger_performance_data_update(data):
    """Trigger performance data update"""
    await broadcast_performance_update("metrics_update", data)

async def trigger_marketing_campaigns_update(data):
    """Trigger marketing campaigns update"""
    await broadcast_marketing_campaigns_update("campaigns_update", {"campaigns": data})

async def trigger_customer_satisfaction_update(data):
    """Trigger customer satisfaction update"""
    await broadcast_customer_satisfaction_update("satisfaction_update", data)

async def trigger_system_status_update(data):
    """Trigger system status update"""
    await broadcast_system_status_update("status_update", {"services": data})

async def trigger_marketing_stats_update(data):
    """Trigger marketing stats update"""
    await broadcast_marketing_stats_update("stats_update", data)