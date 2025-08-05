from fastapi import APIRouter, HTTPException
from typing import Dict, Any

def create_api_info() -> Dict[str, Any]:
    """API version information"""
    return {
        "api_version": "1.0.0",
        "supported_versions": ["v1"],
        "current_version": "v1",
        "deprecated_versions": [],
        "endpoints": {
            "v1": {
                "auth": "/api/v1/auth",
                "users": "/api/v1/users", 
                "me": "/api/v1/me"
            }
        },
        "legacy_endpoints": {
            "auth": "/api/auth (deprecated - use /api/v1/auth)",
            "users": "/api/users (deprecated - use /api/v1/users)"
        }
    }

# Version info router
version_router = APIRouter()

@version_router.get("/")
async def get_api_info():
    """Get API version information"""
    return create_api_info()

@version_router.get("/health")
async def health_check():
    """API health check"""
    return {"status": "healthy", "version": "v1"}

def validate_api_version(version: str) -> bool:
    """Validate if API version is supported"""
    supported = ["v1"]
    return version in supported