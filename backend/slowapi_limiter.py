from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from starlette.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

def get_client_id(request: Request) -> str:
    """Get client identifier for rate limiting"""
    # Try to get real IP from headers (behind proxy)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Fallback to direct client IP
    return get_remote_address(request)

# Create limiter instance
limiter = Limiter(
    key_func=get_client_id,
    default_limits=["100/minute", "1000/hour"]
)

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler"""
    client_id = get_client_id(request)
    
    logger.warning(f"Rate limit exceeded", extra={
        "client_ip": client_id,
        "endpoint": request.url.path,
        "method": request.method,
        "limit": str(exc.detail),
        "user_agent": request.headers.get("user-agent", "")
    })
    
    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": f"Too many requests. {exc.detail}",
            "retry_after": getattr(exc, 'retry_after', 60)
        }
    )
    
    # Add rate limit headers
    response.headers["Retry-After"] = str(getattr(exc, 'retry_after', 60))
    response.headers["X-RateLimit-Limit"] = str(getattr(exc, 'limit', 'unknown'))
    response.headers["X-RateLimit-Remaining"] = "0"
    
    return response