from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging
from typing import Dict, Any
import re

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for rate limiting, request validation, etc."""

    def __init__(self, app, rate_limit_requests: int = 100, rate_limit_window: int = 60):
        super().__init__(app)
        self.rate_limit_requests = rate_limit_requests
        self.rate_limit_window = rate_limit_window
        self.requests: Dict[str, list] = {}

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = self.get_client_ip(request)

        # Rate limiting
        if not self.check_rate_limit(client_ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"}
            )

        # Request validation
        if not self.validate_request(request):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid request"}
            )

        # Log suspicious activity
        if self.is_suspicious_request(request):
            logger.warning(f"Suspicious request from {client_ip}: {request.method} {request.url}")

        # Add security headers
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log API call details
        try:
            endpoint = request.scope.get('endpoint') if request.scope else None
            if endpoint is not None:
                api_info = getattr(endpoint, '__doc__', None)
                if api_info and isinstance(api_info, str):
                    api_info = api_info.strip()
                else:
                    api_info = 'No description available'
            else:
                api_info = 'No description available'
            logger.info(f"API Call: {request.method} {request.url.path} - Status: {response.status_code} - Info: {api_info}")
        except Exception as e:
            logger.error(f"Error logging API call: {e}")
            # Skip logging if there's an issue
            pass

        # Skip security headers for OPTIONS requests to avoid conflicts
        if request.method == "OPTIONS":
            return response

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["X-Process-Time"] = str(process_time)

        return response

    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fall back to client host
        return request.client.host if request.client else "unknown"

    def check_rate_limit(self, client_ip: str) -> bool:
        """Check if request is within rate limits"""
        current_time = time.time()

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < self.rate_limit_window
        ]

        # Check if under limit
        if len(self.requests[client_ip]) >= self.rate_limit_requests:
            return False

        # Add current request
        self.requests[client_ip].append(current_time)
        return True

    def validate_request(self, request: Request) -> bool:
        """Validate request for common attacks"""
        # Check for SQL injection patterns
        sql_patterns = [
            r"(\b(union|select|insert|update|delete|drop|create|alter)\b)",
            r"(\bor\b\s+\d+\s*=\s*\d+)",
            r"(\bscript\b)",
            r"(<script)",
        ]

        # Check query parameters
        for param in request.query_params.values():
            for pattern in sql_patterns:
                if re.search(pattern, param, re.IGNORECASE):
                    logger.warning(f"SQL injection attempt detected: {param}")
                    return False

        # Check path for suspicious patterns
        path = str(request.url.path)
        if ".." in path or "<" in path or ">" in path:
            logger.warning(f"Path traversal attempt detected: {path}")
            return False

        return True

    def is_suspicious_request(self, request: Request) -> bool:
        """Check for suspicious request patterns"""
        user_agent = request.headers.get("User-Agent", "").lower()

        # Check for common bot patterns
        suspicious_patterns = [
            "bot", "crawler", "spider", "scanner",
            "sqlmap", "nmap", "masscan", "dirbuster"
        ]

        for pattern in suspicious_patterns:
            if pattern in user_agent:
                return True

        # Check for unusual request methods
        if request.method not in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]:
            return True

        return False

class CORSMiddleware(BaseHTTPMiddleware):
    """CORS middleware"""

    def __init__(self, app, allow_origins: list = None, allow_credentials: bool = True,
                 allow_methods: list = None, allow_headers: list = None):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_credentials = allow_credentials
        self.allow_methods = allow_methods or ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        self.allow_headers = allow_headers or ["*"]

    async def dispatch(self, request: Request, call_next):
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = JSONResponse(content={"message": "CORS preflight successful"})
        else:
            response = await call_next(request)

        # Set CORS headers
        origin = request.headers.get("Origin")
        if "*" in self.allow_origins:
            response.headers["Access-Control-Allow-Origin"] = "*"
        elif origin and origin in self.allow_origins:
            response.headers["Access-Control-Allow-Origin"] = origin

        if self.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"

        response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers) if "*" not in self.allow_headers else "*"
        response.headers["Access-Control-Max-Age"] = "86400"

        return response