import sentry_sdk
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from auth import verify_token

class SentryContextMiddleware(BaseHTTPMiddleware):
    """Middleware to set Sentry context for each request"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Set request context in Sentry
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("endpoint", request.url.path)
            scope.set_tag("method", request.method)
            scope.set_context("request", {
                "url": str(request.url),
                "method": request.method,
                "headers": dict(request.headers),
                "query_params": dict(request.query_params)
            })
            
            # Try to get user context from JWT token
            try:
                token = request.cookies.get("access_token")
                if not token:
                    auth_header = request.headers.get("Authorization")
                    if auth_header and auth_header.startswith("Bearer "):
                        token = auth_header.split(" ")[1]
                
                if token:
                    username = verify_token(token, "access")
                    if username:
                        scope.set_user({"username": username})
                        request.state.user_id = username
            except Exception:
                pass  # Ignore token parsing errors
            
            response = await call_next(request)
            
            # Set response context
            scope.set_context("response", {
                "status_code": response.status_code,
                "headers": dict(response.headers)
            })
            
            return response