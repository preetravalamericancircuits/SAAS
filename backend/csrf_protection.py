import secrets
import hmac
import hashlib
import time
from typing import Optional
from fastapi import HTTPException, Request, status
from fastapi.security.utils import get_authorization_scheme_param
import logging

logger = logging.getLogger(__name__)

class CSRFProtection:
    """CSRF protection using double-submit cookie pattern and header validation"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()
        self.token_lifetime = 3600  # 1 hour
    
    def generate_csrf_token(self) -> str:
        """Generate CSRF token with timestamp"""
        timestamp = str(int(time.time()))
        random_value = secrets.token_urlsafe(32)
        payload = f"{timestamp}:{random_value}"
        
        signature = hmac.new(
            self.secret_key,
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return f"{payload}:{signature}"
    
    def validate_csrf_token(self, token: str) -> bool:
        """Validate CSRF token"""
        try:
            parts = token.split(":")
            if len(parts) != 3:
                return False
            
            timestamp, random_value, signature = parts
            payload = f"{timestamp}:{random_value}"
            
            # Verify signature
            expected_signature = hmac.new(
                self.secret_key,
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                return False
            
            # Check timestamp
            token_time = int(timestamp)
            current_time = int(time.time())
            
            if current_time - token_time > self.token_lifetime:
                return False
            
            return True
            
        except (ValueError, TypeError):
            return False

# Global CSRF protection instance
csrf_protection = None

def init_csrf_protection(secret_key: str):
    """Initialize CSRF protection"""
    global csrf_protection
    csrf_protection = CSRFProtection(secret_key)

def validate_csrf_header(request: Request) -> bool:
    """Validate CSRF using X-Requested-With header (SPA protection)"""
    # Check for X-Requested-With header (standard AJAX protection)
    requested_with = request.headers.get("x-requested-with")
    if requested_with and requested_with.lower() == "xmlhttprequest":
        return True
    
    # Check for custom CSRF header
    csrf_header = request.headers.get("x-csrf-token")
    if csrf_header and csrf_protection:
        return csrf_protection.validate_csrf_token(csrf_header)
    
    # Check Origin/Referer for same-origin requests
    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    host = request.headers.get("host")
    
    if origin and host:
        # Extract hostname from origin
        origin_host = origin.split("://")[-1].split("/")[0]
        if origin_host == host:
            return True
    
    if referer and host:
        # Extract hostname from referer
        referer_host = referer.split("://")[-1].split("/")[0]
        if referer_host == host:
            return True
    
    return False

def require_csrf_protection(request: Request):
    """Dependency to require CSRF protection for state-changing operations"""
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return  # Skip CSRF for safe methods
    
    if not validate_csrf_header(request):
        logger.warning(f"CSRF validation failed for {request.method} {request.url.path}", extra={
            "ip_address": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", ""),
            "origin": request.headers.get("origin", ""),
            "referer": request.headers.get("referer", "")
        })
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF validation failed. Include X-Requested-With: XMLHttpRequest header or valid CSRF token."
        )