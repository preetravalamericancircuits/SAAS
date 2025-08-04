from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import re

class SecureCORSMiddleware:
    """Enhanced CORS middleware with additional security checks"""
    
    def __init__(self, allowed_origins: List[str], environment: str = "development"):
        self.allowed_origins = allowed_origins
        self.environment = environment
        self.origin_patterns = self._compile_origin_patterns()
    
    def _compile_origin_patterns(self) -> List[re.Pattern]:
        """Compile regex patterns for origin validation"""
        patterns = []
        for origin in self.allowed_origins:
            # Convert wildcard patterns to regex
            pattern = origin.replace("*", ".*").replace(".", r"\.")
            patterns.append(re.compile(f"^{pattern}$"))
        return patterns
    
    def validate_origin(self, origin: str) -> bool:
        """Validate origin against allowed patterns"""
        if not origin:
            return False
        
        # Exact match first
        if origin in self.allowed_origins:
            return True
        
        # Pattern matching for wildcards
        for pattern in self.origin_patterns:
            if pattern.match(origin):
                return True
        
        return False
    
    def validate_request_headers(self, request: Request) -> bool:
        """Validate request headers for security"""
        origin = request.headers.get("origin")
        
        # Block requests with suspicious headers in production
        if self.environment == "production":
            user_agent = request.headers.get("user-agent", "")
            if not user_agent or len(user_agent) < 10:
                return False
            
            # Block requests with suspicious referer
            referer = request.headers.get("referer")
            if referer and not self.validate_origin(referer.split("/")[2]):
                return False
        
        return True

def get_cors_config(environment: str, allowed_origins: List[str]) -> dict:
    """Get CORS configuration based on environment"""
    base_config = {
        "allow_credentials": True,
        "max_age": 86400,  # 24 hours
    }
    
    if environment == "production":
        return {
            **base_config,
            "allow_origins": [origin for origin in allowed_origins if "localhost" not in origin],
            "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": [
                "Content-Type",
                "Authorization", 
                "Accept",
                "Origin",
                "X-Requested-With",
                "Cache-Control"
            ],
            "expose_headers": ["Content-Length", "Content-Type"],
        }
    else:
        return {
            **base_config,
            "allow_origins": allowed_origins,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }