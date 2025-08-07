"""
Enhanced monitoring middleware for business metrics
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import logging
from monitoring.business_metrics import business_metrics

logger = logging.getLogger(__name__)

class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to collect business metrics"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Extract endpoint info
        endpoint = request.url.path
        method = request.method
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Record metrics
        business_metrics.record_api_request(
            endpoint=endpoint,
            method=method,
            status_code=response.status_code,
            duration=duration
        )
        
        return response

class BusinessFlowMiddleware(BaseHTTPMiddleware):
    """Middleware to track business flows"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Define business flows to track
        business_flows = {
            "/api/v1/auth/register": "user_registration",
            "/api/v1/auth/login": "user_login",
            "/api/v1/users": "user_management",
            "/api/persons": "person_management",
            "/api/secure-files": "secure_file_access"
        }
        
        start_time = time.time()
        flow_name = None
        
        # Check if this is a business flow endpoint
        for path, flow in business_flows.items():
            if request.url.path.startswith(path):
                flow_name = flow
                break
        
        # Process request
        response = await call_next(request)
        
        # Record business flow completion if applicable
        if flow_name and 200 <= response.status_code < 300:
            duration = time.time() - start_time
            business_metrics.record_business_flow_completion(flow_name)
        
        return response
