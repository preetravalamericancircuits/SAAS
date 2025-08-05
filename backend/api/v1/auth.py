from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
import logging
from database import get_db
from models import User, Role
from schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserResponse
from auth import create_access_token, create_refresh_token, verify_token, verify_password, get_password_hash, get_user_permissions
from rate_limiter import check_auth_rate_limit, check_login_rate_limit, rate_limiter
from security_monitor import security_monitor
from csrf_protection import require_csrf_protection, csrf_protection
from slowapi_limiter import limiter
from sentry_config import capture_auth_error
from telemetry import record_auth_attempt, record_active_user
from config import settings
import sentry_sdk

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=RegisterResponse)
@limiter.limit("5/minute")
async def register(request: Request, register_data: RegisterRequest, db: Session = Depends(get_db), _: None = Depends(check_auth_rate_limit), _csrf: None = Depends(require_csrf_protection)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == register_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = db.query(User).filter(User.email == register_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with default role (if available)
    hashed_password = get_password_hash(register_data.password)
    db_user = User(
        username=register_data.username,
        email=register_data.email,
        hashed_password=hashed_password,
        is_active=True
    )
    
    # Assign default role (User role)
    default_role = db.query(Role).filter(Role.name == "User").first()
    if default_role:
        db_user.role_id = default_role.id
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return RegisterResponse(
        message="User registered successfully",
        user=UserResponse(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            role=db_user.role.name if db_user.role else None,
            permissions=get_user_permissions(db_user),
            is_active=db_user.is_active,
            created_at=db_user.created_at
        )
    )

@router.post("/login", response_model=LoginResponse)
@limiter.limit("3/minute")
async def login(request: Request, login_data: LoginRequest, response: Response, db: Session = Depends(get_db), _: None = Depends(check_login_rate_limit), _csrf: None = Depends(require_csrf_protection)):
    """Login user and return JWT token with HTTP-only cookie"""
    logger.info("Login attempt", extra={
        "username": login_data.username,
        "request_id": getattr(request.state, 'request_id', None),
        "ip_address": request.client.host if request.client else "unknown"
    })
    
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record failed attempt for brute force protection
        client_ip = request.client.host if request.client else "unknown"
        rate_limiter.record_failed_login(request, login_data.username)
        security_monitor.log_failed_login(client_ip, login_data.username)
        
        # Record failed auth attempt in metrics
        record_auth_attempt(login_data.username, False)
        
        # Capture failed login in Sentry
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("event_type", "failed_login")
            scope.set_context("login_attempt", {
                "username": login_data.username,
                "ip_address": client_ip
            })
            sentry_sdk.capture_message("Failed login attempt", level="warning")
        
        logger.warning("Failed login attempt", extra={
            "username": login_data.username,
            "request_id": getattr(request.state, 'request_id', None),
            "ip_address": client_ip
        })
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )
    
    # Clear failed attempts on successful login
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.clear_failed_attempts(request, login_data.username)
    security_monitor.log_successful_login(client_ip, login_data.username)
    
    # Record successful auth attempt in metrics
    record_auth_attempt(login_data.username, True)
    record_active_user("login")
    
    # Set user context in Sentry
    sentry_sdk.set_user({
        "id": user.id,
        "username": user.username,
        "role": user.role.name if user.role else None
    })
    
    logger.info("Successful login", extra={
        "user_id": user.id,
        "username": user.username,
        "role": user.role.name if user.role else None,
        "request_id": getattr(request.state, 'request_id', None)
    })
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.name if user.role else None,
            permissions=get_user_permissions(user),
            is_active=user.is_active,
            created_at=user.created_at
        )
    )

@router.post("/logout")
@limiter.limit("10/minute")
async def logout(request: Request, response: Response, _csrf: None = Depends(require_csrf_protection)):
    """Logout user (clear cookies)"""
    # Record user logout in metrics
    record_active_user("logout")
    
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=LoginResponse)
@limiter.limit("10/minute")
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db), _: None = Depends(check_auth_rate_limit), _csrf: None = Depends(require_csrf_protection)):
    """Refresh access token using refresh token"""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    username = verify_token(refresh_token, "refresh")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.username})
    new_refresh_token = create_refresh_token(data={"sub": user.username})
    
    # Set new HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )
    
    return LoginResponse(
        access_token=new_access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role.name if user.role else None,
            permissions=get_user_permissions(user),
            is_active=user.is_active,
            created_at=user.created_at
        )
    )