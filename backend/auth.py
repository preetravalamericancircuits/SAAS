from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from functools import wraps
from database import get_db
from models import User, Role, Permission
from config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handling
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    Extract JWT token from HTTP-only cookie (access_token) and validate user.
    This is the primary authentication method for the web application.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from HTTP-only cookie
    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception
    
    try:
        # Validate JWT using secret key from environment variables
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Extract user from database using username from token
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_user_from_header(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract JWT token from Authorization header and validate user.
    This is the fallback authentication method for API clients.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from header",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        username = verify_token(credentials.credentials)
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_user_fallback(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    Fallback authentication function that tries cookie first, then header.
    This provides backward compatibility while supporting cookie-based auth.
    """
    # Try to get token from cookie first (preferred for web app)
    token = request.cookies.get("access_token")
    
    if token:
        # Use cookie-based authentication
        try:
            username = verify_token(token)
            if username:
                user = db.query(User).filter(User.username == username).first()
                if user:
                    return user
        except JWTError:
            pass
    
    # Fallback to header-based authentication (for API clients)
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            username = verify_token(token)
            if username:
                user = db.query(User).filter(User.username == username).first()
                if user:
                    return user
    except (JWTError, IndexError):
        pass
    
    # If neither method works, raise authentication error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def requires_role(required_role: str):
    """
    Dependency that checks if the current user has the required role.
    Usage: @requires_role("admin")
    """
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if not current_user.role or current_user.role.name != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        return current_user
    return role_checker

def requires_permission(required_permission: str):
    """
    Dependency that checks if the current user has the required permission.
    Usage: @requires_permission("user:read")
    """
    def permission_checker(current_user: User = Depends(get_current_active_user)):
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned"
            )
        
        user_permissions = [perm.name for perm in current_user.role.permissions]
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required permission: {required_permission}"
            )
        return current_user
    return permission_checker

def requires_any_role(required_roles: List[str]):
    """
    Dependency that checks if the current user has any of the required roles.
    Usage: @requires_any_role(["admin", "moderator"])
    """
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if not current_user.role or current_user.role.name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return role_checker

def is_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that checks if the current user is an admin.
    """
    if not current_user.role or current_user.role.name.lower() not in ["admin", "superuser"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def get_user_permissions(user: User) -> List[str]:
    """
    Get all permissions for a user based on their role.
    """
    if not user.role:
        return []
    return [perm.name for perm in user.role.permissions]

def has_permission(user: User, permission: str) -> bool:
    """
    Check if a user has a specific permission.
    """
    if not user.role:
        return False
    return permission in [perm.name for perm in user.role.permissions] 