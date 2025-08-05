from fastapi import APIRouter, Depends
from models import User
from schemas import UserResponse
from auth import get_current_user, get_user_permissions

router = APIRouter()

@router.get("/", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.name if current_user.role else None,
        permissions=get_user_permissions(current_user),
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )