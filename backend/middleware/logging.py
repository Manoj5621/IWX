from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and responses"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Get client information
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "unknown")
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else ""

        # Log incoming request
        logger.info(f"🔄 REQUEST START: {method} {path}{query_params} - IP: {client_ip} - User-Agent: {user_agent}")

        # Log request headers (optional, for debugging)
        if logger.isEnabledFor(logging.DEBUG):
            headers = dict(request.headers)
            # Remove sensitive headers
            sensitive_headers = ['authorization', 'cookie', 'x-api-key']
            for header in sensitive_headers:
                if header in headers:
                    headers[header] = '[REDACTED]'
            logger.debug(f"Request headers: {headers}")

        try:
            # Process the request
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Determine status emoji
            status_code = response.status_code
            if status_code < 400:
                status_emoji = "✅"
            elif status_code < 500:
                status_emoji = "⚠️"
            else:
                status_emoji = "❌"

            # Log response
            logger.info(f"{status_emoji} REQUEST END: {method} {path} - Status: {status_code} - Time: {process_time:.3f}s - IP: {client_ip}")

            # Log response headers (optional, for debugging)
            if logger.isEnabledFor(logging.DEBUG):
                response_headers = dict(response.headers)
                logger.debug(f"Response headers: {response_headers}")

            return response

        except Exception as e:
            # Log exceptions
            process_time = time.time() - start_time
            logger.error(f"❌ REQUEST ERROR: {method} {path} - Error: {str(e)} - Time: {process_time:.3f}s - IP: {client_ip}")
            raise

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        # Check forwarded headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # Check real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fall back to client host
        return request.client.host if request.client else "unknown"