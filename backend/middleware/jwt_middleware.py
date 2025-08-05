import logging
from datetime import datetime
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from jose import JWTError, jwt
from config import settings

logger = logging.getLogger(__name__)

class JWTValidationMiddleware(BaseHTTPMiddleware):
    """Middleware to validate JWT tokens on each request"""
    
    # Routes that don't require authentication
    EXEMPT_PATHS = {
        "/health",
        "/api/",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/csrf/token",
        "/docs",
        "/redoc",
        "/openapi.json"
    }
    
    # Routes that require authentication
    PROTECTED_PATHS = {
        "/api/v1/auth/logout",
        "/api/v1/auth/refresh",
        "/api/v1/me/",
        "/api/v1/users/",
        "/api/v1/secure-files"
    }
    
    async def dispatch(self, request: Request, call_next: Callable):
        path = request.url.path
        method = request.method
        
        # Skip validation for exempt paths and GET requests to public endpoints
        if self._is_exempt_path(path) or (method == "GET" and not self._requires_auth(path)):
            return await call_next(request)
        
        # Validate JWT for protected paths
        if self._requires_auth(path) or method in ["POST", "PUT", "DELETE", "PATCH"]:
            try:
                self._validate_jwt_token(request)
            except HTTPException as e:
                logger.warning(f"JWT validation failed for {method} {path}", extra={
                    "ip_address": request.client.host if request.client else "unknown",
                    "user_agent": request.headers.get("user-agent", ""),
                    "error": str(e.detail)
                })
                raise e
        
        return await call_next(request)
    
    def _is_exempt_path(self, path: str) -> bool:
        """Check if path is exempt from JWT validation"""
        return any(path.startswith(exempt) for exempt in self.EXEMPT_PATHS)
    
    def _requires_auth(self, path: str) -> bool:
        """Check if path requires authentication"""
        return any(path.startswith(protected) for protected in self.PROTECTED_PATHS)
    
    def _validate_jwt_token(self, request: Request):
        """Validate JWT token from cookie or header"""
        token = self._extract_token(request)
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token required"
            )
        
        try:
            # Decode and validate JWT with all claims
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
                options={
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_signature": True
                }
            )
            
            # Validate required claims
            username = payload.get("sub")
            token_type = payload.get("type")
            exp = payload.get("exp")
            iat = payload.get("iat")
            nbf = payload.get("nbf")
            jti = payload.get("jti")
            
            if not all([username, token_type, exp, iat, nbf, jti]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token claims"
                )
            
            # Validate token type
            if token_type != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            # Additional expiration validation
            current_time = datetime.utcnow().timestamp()
            if current_time >= exp:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            # Validate not-before claim
            if current_time < nbf:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token not yet valid"
                )
            
            # Store validated claims in request state
            request.state.jwt_payload = payload
            request.state.username = username
            
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}"
            )
    
    def _extract_token(self, request: Request) -> str:
        """Extract JWT token from cookie or Authorization header"""
        # Try cookie first (preferred for web app)
        token = request.cookies.get("access_token")
        if token:
            return token
        
        # Fallback to Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ")[1]
        
        return None