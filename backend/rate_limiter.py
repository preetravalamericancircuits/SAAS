import time
import logging
from typing import Dict, Optional
from collections import defaultdict, deque
from fastapi import HTTPException, Request
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RateLimiter:
    """In-memory rate limiter with sliding window"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.blocked_ips: Dict[str, float] = {}
        self.failed_attempts: Dict[str, deque] = defaultdict(deque)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        if forwarded_for := request.headers.get("x-forwarded-for"):
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self, requests: deque, window_seconds: int):
        """Remove requests older than window"""
        current_time = time.time()
        while requests and requests[0] < current_time - window_seconds:
            requests.popleft()
    
    def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int) -> bool:
        """Check if request is within rate limit"""
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Check if IP is temporarily blocked
        if client_ip in self.blocked_ips:
            if current_time < self.blocked_ips[client_ip]:
                logger.warning(f"Blocked IP attempted request: {client_ip}")
                return False
            else:
                del self.blocked_ips[client_ip]
        
        # Clean old requests
        requests = self.requests[client_ip]
        self._cleanup_old_requests(requests, window_seconds)
        
        # Check rate limit
        if len(requests) >= max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return False
        
        # Add current request
        requests.append(current_time)
        return True
    
    def record_failed_login(self, request: Request, username: str):
        """Record failed login attempt"""
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Clean old attempts (last 15 minutes)
        attempts = self.failed_attempts[f"{client_ip}:{username}"]
        self._cleanup_old_requests(attempts, 900)  # 15 minutes
        
        # Add current attempt
        attempts.append(current_time)
        
        # Block if too many attempts
        if len(attempts) >= 5:  # 5 failed attempts
            block_duration = min(300 * (len(attempts) - 4), 3600)  # Max 1 hour
            self.blocked_ips[client_ip] = current_time + block_duration
            
            logger.error(f"IP blocked for brute force: {client_ip}, username: {username}, duration: {block_duration}s")
    
    def clear_failed_attempts(self, request: Request, username: str):
        """Clear failed attempts on successful login"""
        client_ip = self._get_client_ip(request)
        key = f"{client_ip}:{username}"
        if key in self.failed_attempts:
            del self.failed_attempts[key]

# Global rate limiter instance
rate_limiter = RateLimiter()

def check_auth_rate_limit(request: Request):
    """Rate limit for auth endpoints: 10 requests per minute"""
    if not rate_limiter.check_rate_limit(request, 10, 60):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": "60"}
        )

def check_login_rate_limit(request: Request):
    """Stricter rate limit for login: 5 requests per minute"""
    if not rate_limiter.check_rate_limit(request, 5, 60):
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later.",
            headers={"Retry-After": "60"}
        )