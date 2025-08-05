from fastapi import APIRouter, Depends, Request
from models import User
from auth import get_current_user
from jwt_utils import jwt_manager

router = APIRouter()

@router.get("/info")
async def get_token_info(request: Request, current_user: User = Depends(get_current_user)):
    """Get current token information for debugging"""
    
    # Extract token
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return {"error": "No token found"}
    
    # Get token info
    token_info = jwt_manager.get_token_info(token)
    
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "role": current_user.role.name if current_user.role else None
        },
        "token": token_info
    }