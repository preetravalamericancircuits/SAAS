import time
import logging
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for additional protection"""
    
    def __init__(self, app):
        super().__init__(app)
        self.suspicious_requests = defaultdict(deque)
        self.blocked_ips = set()
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        if forwarded_for := request.headers.get("x-forwarded-for"):
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_suspicious_request(self, request: Request) -> bool:
        """Detect suspicious request patterns"""
        user_agent = request.headers.get("user-agent", "").lower()
        
        # Block requests without user agent
        if not user_agent:
            return True
        
        # Block common bot patterns
        suspicious_patterns = [
            "bot", "crawler", "spider", "scraper", 
            "curl", "wget", "python-requests"
        ]
        
        if any(pattern in user_agent for pattern in suspicious_patterns):
            return True
        
        # Check for SQL injection in query params
        query_string = str(request.query_params).lower()
        sql_patterns = ["union", "select", "drop", "insert", "delete", "--", "/*"]
        
        if any(pattern in query_string for pattern in sql_patterns):
            return True
        
        return False
    
    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Check if IP is blocked
        if client_ip in self.blocked_ips:
            logger.error(f"Blocked IP attempted access: {client_ip}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check for suspicious patterns
        if self._is_suspicious_request(request):
            # Track suspicious requests
            requests = self.suspicious_requests[client_ip]
            
            # Clean old requests (last 5 minutes)
            while requests and requests[0] < current_time - 300:
                requests.popleft()
            
            requests.append(current_time)
            
            # Block IP if too many suspicious requests
            if len(requests) >= 5:
                self.blocked_ips.add(client_ip)
                logger.error(f"IP blocked for suspicious activity: {client_ip}")
                raise HTTPException(status_code=403, detail="Access denied")
            
            logger.warning(f"Suspicious request from {client_ip}: {request.url}")
        
        response = await call_next(request)
        return response