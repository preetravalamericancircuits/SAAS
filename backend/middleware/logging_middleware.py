import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        if forwarded_for := request.headers.get("x-forwarded-for"):
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Start timing
        start_time = time.time()
        
        # Log request
        logger.info("Request started", extra={
            "request_id": request_id,
            "method": request.method,
            "endpoint": str(request.url.path),
            "query_params": str(request.query_params),
            "ip_address": client_ip,
            "user_agent": request.headers.get("user-agent", ""),
        })
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = (time.time() - start_time) * 1000
            
            # Log response
            logger.info("Request completed", extra={
                "request_id": request_id,
                "method": request.method,
                "endpoint": str(request.url.path),
                "status_code": response.status_code,
                "duration": round(duration, 2),
                "ip_address": client_ip,
            })
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration = (time.time() - start_time) * 1000
            
            # Log error
            logger.error("Request failed", extra={
                "request_id": request_id,
                "method": request.method,
                "endpoint": str(request.url.path),
                "duration": round(duration, 2),
                "ip_address": client_ip,
                "error": str(e),
            }, exc_info=True)
            
            raise