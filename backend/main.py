from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import uvicorn
from contextlib import asynccontextmanager
import time
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.mongodb import MongoDB
from database.mysql import create_tables
from utils.config import settings
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from routers import auth, products, orders, admin, websocket, ai
from middleware.security import SecurityMiddleware, CORSMiddleware as CustomCORSMiddleware
from middleware.logging import RequestLoggingMiddleware
from services.user_service import UserService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting up IWX E-commerce Backend...")

    try:
        # Connect to databases
        await MongoDB.connect_to_mongo()
        await create_tables()

        # Create default admin user
        await UserService.create_admin_user()

        logger.info("Database connections established")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down...")
    await MongoDB.close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="IWX E-commerce API",
    description="Professional e-commerce backend for InfiniteWaveX",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CustomCORSMiddleware,
    allow_origins=settings.cors_origins
)

app.add_middleware(
    RequestLoggingMiddleware
)

app.add_middleware(
    SecurityMiddleware,
    rate_limit_requests=1000,  # 1000 requests per minute
    rate_limit_window=60
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(websocket.router)
app.include_router(ai.router)

# Log all API endpoints on startup
logger.info("Registered API Endpoints:")
for route in app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        methods = ', '.join(route.methods)
        path = route.path
        endpoint_func = getattr(route, 'endpoint', None)
        doc = (getattr(endpoint_func, '__doc__', None) or 'No description').strip() if endpoint_func else 'No description'
        logger.info(f"  {methods} {path} - {doc}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "IWX E-commerce API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to IWX E-commerce API",
        "docs": "/docs",
        "health": "/health"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
        access_log=False  # Disable uvicorn's built-in access logging to show our custom logs
    )