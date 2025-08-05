from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import logging
from database import get_db
from models import User, Role
from schemas import UserResponse, UserCreate, UserUpdate, UserCreateWithAutoPassword, UserCreateResponse
from auth import requires_permission, get_password_hash, get_user_permissions
from csrf_protection import require_csrf_protection
from password_security import password_security_manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:read"))
):
    """Get all users (requires user:read permission)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.name if user.role else None,
            permissions=get_user_permissions(user),
            is_active=user.is_active,
            created_at=user.created_at
        )
        for user in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:read"))
):
    """Get specific user by ID (requires user:read permission)"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role.name if user.role else None,
        permissions=get_user_permissions(user),
        is_active=user.is_active,
        created_at=user.created_at
    )

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:create")),
    _csrf: None = Depends(require_csrf_protection)
):
    """Create a new user with manual password (requires user:create permission)"""
    logger.info("User creation attempt", extra={
        "created_by": current_user.username,
        "new_username": user_data.username,
        "user_id": current_user.id
    })
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        logger.warning("User creation failed - username exists", extra={
            "created_by": current_user.username,
            "attempted_username": user_data.username
        })
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role_id=user_data.role_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info("User created successfully", extra={
        "created_by": current_user.username,
        "new_user_id": db_user.id,
        "new_username": db_user.username,
        "role_id": db_user.role_id
    })
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        role=db_user.role.name if db_user.role else None,
        permissions=get_user_permissions(db_user),
        is_active=db_user.is_active,
        created_at=db_user.created_at
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:update")),
    _csrf: None = Depends(require_csrf_protection)
):
    """Update user (requires user:update permission)"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields if provided
    if user_data.username is not None:
        # Check if username is already taken
        existing_user = db.query(User).filter(User.username == user_data.username, User.id != user_id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user.username = user_data.username
    
    if user_data.email is not None:
        # Check if email is already taken
        existing_email = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        user.email = user_data.email
    
    if user_data.role_id is not None:
        # Verify role exists
        role = db.query(Role).filter(Role.id == user_data.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role not found"
            )
        user.role_id = user_data.role_id
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role.name if user.role else None,
        permissions=get_user_permissions(user),
        is_active=user.is_active,
        created_at=user.created_at
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:delete")),
    _csrf: None = Depends(require_csrf_protection)
):
    """Delete user (requires user:delete permission)"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.warning("User deletion failed - user not found", extra={
            "deleted_by": current_user.username,
            "target_user_id": user_id
        })
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    logger.warning("User deleted", extra={
        "deleted_by": current_user.username,
        "deleted_user_id": user.id,
        "deleted_username": user.username,
        "deleted_user_role": user.role.name if user.role else None
    })
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}