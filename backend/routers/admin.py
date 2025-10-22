from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.user import UserResponse, UserUpdate, UserStats, UserCreate
from models.product import ProductStats, ProductListResponse, ProductSearchFilters, ProductResponse, ProductStatus
from models.order import OrderStats, OrderListResponse, OrderResponse, OrderUpdate, OrderStatus, PaymentStatus
from models.security import SecurityStats, LoginHistory, SecurityEvent, DeviceInfo
from services.user_service import UserService
from services.product_service import ProductService
from services.order_service import OrderService
from services.security_service import SecurityService
from auth.dependencies import get_current_admin_user
from models.user import UserInDB, UserRole, UserStatus
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Create a new user (Admin only)"""
    try:
        user = await UserService.create_user(user_data)

        # Broadcast user creation via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user.id, "user_created", {
            "action": "create",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        })

        return UserResponse(**user.dict())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Create user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    user_status: Optional[UserStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """List all users (Admin only)"""
    try:
        users = await UserService.list_users(
            skip=skip,
            limit=limit,
            role=role,
            status=user_status
        )
        return users
    except Exception as e:
        logger.error(f"List users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get user by ID (Admin only)"""
    try:
        user = await UserService.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse(**user.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update user (Admin only)"""
    try:
        user = await UserService.update_user(user_id, user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Broadcast user update via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user_id, "user_updated", {
            "action": "update",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        })

        return UserResponse(**user.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Delete user (Admin only)"""
    try:
        deleted = await UserService.delete_user(user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Broadcast user deletion via WebSocket
        from routers.websocket import broadcast_user_activity
        await broadcast_user_activity(user_id, "user_deleted", {
            "action": "delete",
            "user_id": user_id
        })

        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@router.get("/stats/users", response_model=UserStats)
async def get_user_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get user statistics (Admin only)"""
    try:
        stats = await UserService.get_user_stats()
        return stats
    except Exception as e:
        logger.error(f"Get user stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )

@router.get("/stats/products", response_model=ProductStats)
async def get_product_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get product statistics (Admin only)"""
    try:
        stats = await ProductService.get_product_stats()
        return stats
    except Exception as e:
        logger.error(f"Get product stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product statistics"
        )

@router.get("/stats/orders", response_model=OrderStats)
async def get_order_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get order statistics (Admin only)"""
    try:
        stats = await OrderService.get_order_stats()
        return stats
    except Exception as e:
        logger.error(f"Get order stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order statistics"
        )

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get comprehensive dashboard statistics (Admin only)"""
    try:
        user_stats = await UserService.get_user_stats()
        product_stats = await ProductService.get_product_stats()
        order_stats = await OrderService.get_order_stats()

        # Broadcast stats update via WebSocket
        from routers.websocket import broadcast_dashboard_update

        stats_data = {
            "totalSales": order_stats.total_revenue,
            "totalOrders": order_stats.total_orders,
            "totalCustomers": user_stats.total_users,
            "totalProducts": product_stats.total_products,
            "revenue": order_stats.total_revenue,
            "visitors": 0,  # Would come from analytics
            "conversionRate": 0  # Would be calculated
        }
        await broadcast_dashboard_update("stats_update", stats_data)

        return {
            "users": user_stats.dict(),
            "products": product_stats.dict(),
            "orders": order_stats.dict(),
            "revenue": {
                "total": order_stats.total_revenue,
                "today": order_stats.revenue_today,
                "growth": 12.5  # Could be calculated
            }
        }
    except Exception as e:
        logger.error(f"Get dashboard stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )

@router.get("/security/stats", response_model=SecurityStats)
async def get_admin_security_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get global security statistics (Admin only)"""
    try:
        security_service = SecurityService()
        # Get stats for all users (admin view)
        all_users = await UserService.list_users(limit=1000)  # Get all users
        total_stats = SecurityStats(
            total_login_attempts=0,
            successful_logins=0,
            failed_logins=0,
            suspicious_activities=0,
            active_sessions=0,
            trusted_devices=0
        )

        for user in all_users:
            user_stats = await security_service.get_security_stats(user.id)
            total_stats.total_login_attempts += user_stats.total_login_attempts
            total_stats.successful_logins += user_stats.successful_logins
            total_stats.failed_logins += user_stats.failed_logins
            total_stats.suspicious_activities += user_stats.suspicious_activities
            total_stats.active_sessions += user_stats.active_sessions
            total_stats.trusted_devices += user_stats.trusted_devices

        return total_stats
    except Exception as e:
        logger.error(f"Get admin security stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security statistics"
        )

@router.get("/security/login-history", response_model=List[LoginHistory])
async def get_admin_login_history(
    user_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get login history for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        if user_id:
            # Get history for specific user
            return await security_service.get_login_history(user_id, limit)
        else:
            # Get history for all users (aggregate)
            all_users = await UserService.list_users(limit=1000)
            all_history = []
            for user in all_users:
                user_history = await security_service.get_login_history(user.id, min(limit // len(all_users) + 1, 50))
                all_history.extend(user_history)

            # Sort by timestamp descending and limit
            all_history.sort(key=lambda x: x.timestamp, reverse=True)
            return all_history[:limit]
    except Exception as e:
        logger.error(f"Get admin login history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get login history"
        )

@router.get("/security/events", response_model=List[SecurityEvent])
async def get_admin_security_events(
    user_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get security events for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        # This would need to be implemented in SecurityService for admin view
        # For now, return events for specific user or empty list
        if user_id:
            # Get events from security_events collection filtered by user_id
            db = security_service.db
            query = {"user_id": user_id}
            if event_type:
                query["event_type"] = event_type

            cursor = db.security_events.find(query).sort("timestamp", -1).limit(limit)
            events = []
            async for event in cursor:
                event["id"] = str(event["_id"])
                events.append(SecurityEvent(**event))
            return events
        else:
            # Get all events (admin view)
            db = security_service.db
            query = {}
            if event_type:
                query["event_type"] = event_type

            cursor = db.security_events.find(query).sort("timestamp", -1).limit(limit)
            events = []
            async for event in cursor:
                event["id"] = str(event["_id"])
                events.append(SecurityEvent(**event))
            return events
    except Exception as e:
        logger.error(f"Get admin security events error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security events"
        )

@router.get("/security/devices", response_model=List[DeviceInfo])
async def get_admin_connected_devices(
    user_id: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get connected devices for all users or specific user (Admin only)"""
    try:
        security_service = SecurityService()
        if user_id:
            return await security_service.get_connected_devices(user_id)
        else:
            # Get devices for all users
            all_users = await UserService.list_users(limit=1000)
            all_devices = []
            for user in all_users:
                user_devices = await security_service.get_connected_devices(user.id)
                all_devices.extend(user_devices)
            return all_devices
    except Exception as e:
        logger.error(f"Get admin connected devices error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connected devices"
        )

@router.post("/security/scan")
async def run_security_scan(current_user: UserInDB = Depends(get_current_admin_user)):
    """Run a comprehensive security scan (Admin only)"""
    try:
        security_service = SecurityService()
        user_service = UserService()

        # Get all users
        all_users = await UserService.list_users(limit=1000)

        scan_results = {
            "total_users": len(all_users),
            "users_with_2fa": 0,
            "users_without_password": 0,
            "failed_login_attempts": 0,
            "suspicious_activities": 0,
            "untrusted_devices": 0,
            "weak_passwords": 0,  # Would need password strength checking
            "inactive_accounts": 0,
            "scan_timestamp": datetime.utcnow().isoformat()
        }

        for user in all_users:
            # Get security settings
            try:
                settings = await security_service.get_security_settings(user.id)
                if settings.two_factor_enabled:
                    scan_results["users_with_2fa"] += 1

                if not user.hashed_password:
                    scan_results["users_without_password"] += 1

                if settings.failed_login_attempts > 0:
                    scan_results["failed_login_attempts"] += settings.failed_login_attempts

                if user.status == "inactive":
                    scan_results["inactive_accounts"] += 1
            except:
                pass

            # Get security stats
            try:
                stats = await security_service.get_security_stats(user.id)
                scan_results["suspicious_activities"] += stats.suspicious_activities

                # Get devices
                devices = await security_service.get_connected_devices(user.id)
                untrusted_count = sum(1 for d in devices if not d.is_trusted)
                scan_results["untrusted_devices"] += untrusted_count
            except:
                pass

        return {
            "message": "Security scan completed",
            "results": scan_results
        }
    except Exception as e:
        logger.error(f"Run security scan error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run security scan"
        )

@router.get("/inventory/alerts")
async def get_inventory_alerts(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get inventory alerts (Admin only)"""
    try:
        # Get products with low stock
        from models.product import ProductSearchFilters
        filters = ProductSearchFilters()  # Create default filters
        products_response = await ProductService.list_products(filters=filters, limit=1000)
        products = products_response.products
        alerts = []

        for product in products:
            if hasattr(product, 'stock') and hasattr(product, 'low_stock_threshold') and product.stock <= product.low_stock_threshold:
                alerts.append({
                    "product": product.name,
                    "stock": product.stock,
                    "threshold": product.low_stock_threshold,
                    "type": "low" if product.stock <= 5 else "warning"
                })

        # Broadcast inventory update
        from routers.websocket import broadcast_inventory_update
        await broadcast_inventory_update("alerts_update", {"alerts": alerts})

        return alerts
    except Exception as e:
        logger.error(f"Get inventory alerts error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory alerts"
        )

@router.get("/inventory/items")
async def get_inventory_items(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get inventory items (Admin only)"""
    try:
        from models.product import ProductSearchFilters
        filters = ProductSearchFilters()  # Create default filters
        products_response = await ProductService.list_products(filters=filters, limit=1000)
        products = products_response.products
        inventory_items = []

        for product in products:
            inventory_items.append({
                "name": product.name,
                "stock": getattr(product, 'stock', 0),
                "total": getattr(product, 'total_stock', getattr(product, 'stock', 0)),
                "category": getattr(product, 'category', 'Unknown')
            })

        return inventory_items
    except Exception as e:
        logger.error(f"Get inventory items error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get inventory items"
        )

@router.get("/marketing/campaigns")
async def get_marketing_campaigns(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get marketing campaigns (Admin only)"""
    try:
        # For now, return mock data - in real implementation, this would come from a marketing service
        campaigns = [
            {"name": "Summer Sale", "progress": 75, "budget": 5000, "spent": 3750, "status": "active"},
            {"name": "New Collection", "progress": 30, "budget": 10000, "spent": 3000, "status": "active"},
            {"name": "Email Newsletter", "progress": 100, "budget": 2000, "spent": 2000, "status": "completed"},
            {"name": "Social Media Ads", "progress": 45, "budget": 8000, "spent": 3600, "status": "active"}
        ]

        # Broadcast marketing update
        from routers.websocket import broadcast_marketing_campaigns_update
        await broadcast_marketing_campaigns_update("campaigns_update", {"campaigns": campaigns})

        return campaigns
    except Exception as e:
        logger.error(f"Get marketing campaigns error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketing campaigns"
        )

@router.get("/marketing/stats")
async def get_marketing_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get marketing statistics (Admin only)"""
    try:
        # Mock marketing stats - in real implementation, this would come from analytics service
        stats = {
            "roi": 245,
            "clickRate": 3.7,
            "impressions": 125000,
            "engagements": 12450
        }
        # Broadcast marketing stats update
        from routers.websocket import broadcast_marketing_stats_update
        await broadcast_marketing_stats_update("stats_update", stats)

        return stats
    except Exception as e:
        logger.error(f"Get marketing stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get marketing statistics"
        )

@router.get("/performance/metrics")
async def get_performance_metrics(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get performance metrics (Admin only)"""
    try:
        # Mock performance data - in real implementation, this would come from monitoring service
        metrics = {
            "pageLoadTime": 2.3,
            "bounceRate": 42.1,
            "avgSession": 8.5
        }

        # Broadcast performance update
        from routers.websocket import broadcast_performance_update
        await broadcast_performance_update("metrics_update", metrics)

        return metrics
    except Exception as e:
        logger.error(f"Get performance metrics error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get performance metrics"
        )

@router.get("/customers/satisfaction")
async def get_customer_satisfaction(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get customer satisfaction data (Admin only)"""
    try:
        # Mock satisfaction data - in real implementation, this would come from feedback service
        satisfaction = {
            "overall": 4.7,
            "support": 4.9,
            "product": 4.6,
            "delivery": 4.5
        }

        # Broadcast satisfaction update
        from routers.websocket import broadcast_customer_satisfaction_update
        await broadcast_customer_satisfaction_update("satisfaction_update", satisfaction)

        return satisfaction
    except Exception as e:
        logger.error(f"Get customer satisfaction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer satisfaction data"
        )

@router.get("/customers/stats")
async def get_customer_stats(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get customer statistics including total orders and total spent (Admin only)"""
    try:
        # Get all customers
        customers = await UserService.list_users(role="customer", limit=1000)

        customer_stats = []
        for customer in customers:
            # Get order stats for this customer
            pipeline = [
                {"$match": {"user_id": customer.id}},
                {
                    "$group": {
                        "_id": "$user_id",
                        "total_orders": {"$sum": 1},
                        "total_spent": {"$sum": "$total_amount"}
                    }
                }
            ]

            result = await MongoDB.get_collection(ORDERS_COLLECTION).aggregate(pipeline).to_list(1)

            if result:
                stats = result[0]
                customer_stats.append({
                    "id": customer.id,
                    "total_orders": stats.get("total_orders", 0),
                    "total_spent": stats.get("total_spent", 0.0)
                })
            else:
                customer_stats.append({
                    "id": customer.id,
                    "total_orders": 0,
                    "total_spent": 0.0
                })

        return customer_stats
    except Exception as e:
        logger.error(f"Get customer stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer statistics"
        )

@router.get("/analytics/traffic")
async def get_traffic_sources(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get traffic sources data (Admin only)"""
    try:
        # Mock traffic data - in real implementation, this would come from analytics service
        traffic_sources = [
            {"source": "Direct", "visitors": 12450, "percentage": 35},
            {"source": "Organic Search", "visitors": 9870, "percentage": 28},
            {"source": "Social Media", "visitors": 6540, "percentage": 18},
            {"source": "Email", "visitors": 4320, "percentage": 12},
            {"source": "Referral", "visitors": 2460, "percentage": 7}
        ]

        # Broadcast traffic update
        from routers.websocket import broadcast_traffic_update
        await broadcast_traffic_update("traffic_update", {"sources": traffic_sources})

        return traffic_sources
    except Exception as e:
        logger.error(f"Get traffic sources error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get traffic sources data"
        )

@router.get("/system/status")
async def get_system_status(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get system status (Admin only)"""
    try:
        # Mock system status - in real implementation, this would come from monitoring service
        system_status = [
            {"service": "Web Server", "status": "online", "uptime": "99.9%"},
            {"service": "Database", "status": "online", "uptime": "99.8%"},
            {"service": "Payment Gateway", "status": "warning", "uptime": "98.7%"},
            {"service": "Email Service", "status": "online", "uptime": "99.5%"}
        ]

        # Broadcast system update
        from routers.websocket import broadcast_system_status_update
        await broadcast_system_status_update("status_update", {"services": system_status})

        return system_status
    except Exception as e:
        logger.error(f"Get system status error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get system status"
        )

@router.get("/analytics/sales-data")
async def get_sales_data(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get sales data for charts (Admin only)"""
    try:
        # Mock sales data - in real implementation, this would come from analytics service
        sales_data = [
            {"month": "Jan", "sales": 12000, "orders": 240},
            {"month": "Feb", "sales": 19000, "orders": 320},
            {"month": "Mar", "sales": 15000, "orders": 280},
            {"month": "Apr", "sales": 22000, "orders": 380},
            {"month": "May", "sales": 18000, "orders": 310},
            {"month": "Jun", "sales": 25000, "orders": 420},
            {"month": "Jul", "sales": 21000, "orders": 360},
            {"month": "Aug", "sales": 28000, "orders": 470},
            {"month": "Sep", "sales": 24000, "orders": 410},
            {"month": "Oct", "sales": 31000, "orders": 520},
            {"month": "Nov", "sales": 27000, "orders": 450},
            {"month": "Dec", "sales": 35000, "orders": 580}
        ]

        # Broadcast sales data update
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("sales_data_update", {"sales_data": sales_data})

        return sales_data
    except Exception as e:
        logger.error(f"Get sales data error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get sales data"
        )

@router.get("/analytics/top-products")
async def get_top_products(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get top products data (Admin only)"""
    try:
        # Mock top products data - in real implementation, this would come from analytics service
        top_products = [
            {"name": "Premium Leather Jacket", "sales": 1243, "revenue": 248600},
            {"name": "Designer Silk Dress", "sales": 987, "revenue": 147825},
            {"name": "Limited Edition Sneakers", "sales": 856, "revenue": 110928},
            {"name": "Winter Parka", "sales": 743, "revenue": 96470},
            {"name": "Casual Sneakers", "sales": 689, "revenue": 48230}
        ]

        # Broadcast top products update
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("top_products_update", {"top_products": top_products})

        return top_products
    except Exception as e:
        logger.error(f"Get top products error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get top products data"
        )

@router.get("/analytics/recent-orders")
async def get_recent_orders(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get recent orders data (Admin only)"""
    try:
        # Mock recent orders data - in real implementation, this would come from order service
        recent_orders = [
            {"id": "IWX789012", "customer": "Emma Wilson", "date": "2025-01-15", "amount": 247.50, "status": "Delivered"},
            {"id": "IWX789011", "customer": "James Brown", "date": "2025-01-15", "amount": 149.99, "status": "Shipped"},
            {"id": "IWX789010", "customer": "Sophia Garcia", "date": "2025-01-14", "amount": 89.99, "status": "Processing"},
            {"id": "IWX789009", "customer": "Michael Chen", "date": "2025-01-14", "amount": 325.75, "status": "Delivered"},
            {"id": "IWX789008", "customer": "Olivia Martinez", "date": "2025-01-13", "amount": 159.98, "status": "Shipped"}
        ]

        # Broadcast recent orders update
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("recent_orders_update", {"recent_orders": recent_orders})

        return recent_orders
    except Exception as e:
        logger.error(f"Get recent orders error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recent orders data"
        )

@router.get("/analytics/revenue-trend")
async def get_revenue_trend(current_user: UserInDB = Depends(get_current_admin_user)):
    """Get revenue trend data (Admin only)"""
    try:
        # Mock revenue trend data - in real implementation, this would come from analytics service
        revenue_trend = [
            {"day": "1", "value": 12000},
            {"day": "2", "value": 18000},
            {"day": "3", "value": 15000},
            {"day": "4", "value": 22000},
            {"day": "5", "value": 19000},
            {"day": "6", "value": 25000},
            {"day": "7", "value": 21000},
            {"day": "8", "value": 28000},
            {"day": "9", "value": 24000},
            {"day": "10", "value": 31000},
            {"day": "11", "value": 27000},
            {"day": "12", "value": 35000},
            {"day": "13", "value": 32000},
            {"day": "14", "value": 38000}
        ]

        # Broadcast revenue trend update
        from routers.websocket import broadcast_dashboard_update
        await broadcast_dashboard_update("revenue_trend_update", {"revenue_trend": revenue_trend})

        return revenue_trend
    except Exception as e:
        logger.error(f"Get revenue trend error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get revenue trend data"
        )

# Order Management Endpoints for Admin
@router.get("/orders", response_model=OrderListResponse)
async def list_orders_admin(
    user_id: Optional[str] = None,
    status: Optional[OrderStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    sort_by: str = "created_at",
    sort_order: str = Query("-1", regex="^(1|-1)$"),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """List all orders for admin management (Admin only)"""
    try:
        result = await OrderService.list_orders_admin(
            user_id=user_id,
            status=status,
            payment_status=payment_status,
            search=search,
            start_date=start_date,
            end_date=end_date,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        logger.error(f"List orders admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list orders"
        )

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_admin(
    order_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Get order by ID for admin (Admin only)"""
    try:
        order = await OrderService.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return OrderResponse(**order.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get order admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get order"
        )

@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order_admin(
    order_id: str,
    update_data: OrderUpdate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update order information (Admin only)"""
    try:
        order = await OrderService.update_order(order_id, update_data)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return OrderResponse(**order.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update order admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )

@router.post("/orders/bulk-update")
async def bulk_update_orders_admin(
    update_data: dict,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Bulk update order status (Admin only)"""
    try:
        if "order_ids" not in update_data or "status" not in update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="order_ids and status fields are required"
            )

        order_ids = update_data["order_ids"]
        status_value = update_data["status"]

        if not isinstance(order_ids, list) or len(order_ids) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="order_ids must be a non-empty list"
            )

        if status_value not in [s.value for s in OrderStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in OrderStatus]}"
            )

        updated_orders = []
        for order_id in order_ids:
            order = await OrderService.update_order(order_id, OrderUpdate(status=OrderStatus(status_value)))
            if order:
                updated_orders.append(OrderResponse(**order.dict()))

        return {
            "message": f"Updated {len(updated_orders)} orders successfully",
            "updated_orders": updated_orders
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk update orders admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk update orders"
        )

@router.get("/orders/export")
async def export_orders_admin(
    user_id: Optional[str] = None,
    status: Optional[OrderStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Export orders to CSV (Admin only)"""
    try:
        orders = await OrderService.list_orders_admin(
            user_id=user_id,
            status=status,
            payment_status=payment_status,
            search=search,
            start_date=start_date,
            end_date=end_date,
            limit=10000  # Large limit for export
        )

        # Generate CSV content
        import csv
        import io
        from fastapi.responses import StreamingResponse

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            'Order Number', 'Customer', 'Email', 'Status', 'Payment Status',
            'Total Amount', 'Items Count', 'Created Date', 'Shipping Address'
        ])

        # Write data
        for order in orders.orders:
            customer_name = f"{order.user.first_name} {order.user.last_name}" if order.user else "N/A"
            customer_email = order.user.email if order.user else "N/A"
            items_count = len(order.items)
            shipping_address = f"{order.shipping_address.city}, {order.shipping_address.state}"

            writer.writerow([
                order.order_number,
                customer_name,
                customer_email,
                order.status.value,
                order.payment_status.value,
                f"${order.total_amount:.2f}",
                items_count,
                order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                shipping_address
            ])

        output.seek(0)

        def generate():
            yield output.getvalue()

        return StreamingResponse(
            generate(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=orders_export.csv"}
        )
    except Exception as e:
        logger.error(f"Export orders admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export orders"
        )

# Product Management Endpoints for Admin
@router.get("/products", response_model=ProductListResponse)
async def list_products_admin(
    query: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    product_status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    sort_by: str = "created_at",
    sort_order: str = Query("-1", regex="^(1|-1)$"),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """List all products for admin management (Admin only)"""
    try:
        filters = ProductSearchFilters(
            query=query,
            category=category,
            brand=brand,
            status=product_status
        )

        result = await ProductService.list_products(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        logger.error(f"List products admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list products"
        )

@router.put("/products/{product_id}/status", response_model=ProductResponse)
async def update_product_status_admin(
    product_id: str,
    status_data: dict,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Update product status (Admin only)"""
    try:
        if "status" not in status_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status field is required"
            )

        status_value = status_data["status"]
        if status_value not in [s.value for s in ProductStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in ProductStatus]}"
            )

        success = await ProductService.update_product_status(product_id, ProductStatus(status_value))
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Get updated product
        product = await ProductService.get_product_by_id(product_id)
        return ProductResponse(**product.dict())
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update product status admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product status"
        )

@router.delete("/products/{product_id}")
async def delete_product_admin(
    product_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Delete product (Admin only)"""
    try:
        deleted = await ProductService.delete_product(product_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete product admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

@router.post("/products/bulk-status-update")
async def bulk_update_product_status_admin(
    update_data: dict,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """Bulk update product status (Admin only)"""
    try:
        if "product_ids" not in update_data or "status" not in update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="product_ids and status fields are required"
            )

        product_ids = update_data["product_ids"]
        status_value = update_data["status"]

        if not isinstance(product_ids, list) or len(product_ids) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="product_ids must be a non-empty list"
            )

        if status_value not in [s.value for s in ProductStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in ProductStatus]}"
            )

        updates = {"status": ProductStatus(status_value), "updated_at": datetime.utcnow()}
        modified_count = await ProductService.bulk_update_products(product_ids, updates)

        return {
            "message": f"Updated {modified_count} products successfully",
            "modified_count": modified_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk update product status admin error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk update product status"
        )