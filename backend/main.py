from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os
import json
import logging
from input_sanitizer import InputSanitizer
from cors_security import get_cors_config, SecureCORSMiddleware
from logging_config import setup_logging
from middleware.logging_middleware import LoggingMiddleware
from middleware.security_middleware import SecurityMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.jwt_middleware import JWTValidationMiddleware
from middleware.sentry_middleware import SentryContextMiddleware
from rate_limiter import check_auth_rate_limit, check_login_rate_limit, rate_limiter
from security_monitor import security_monitor
from csrf_protection import init_csrf_protection, require_csrf_protection, csrf_protection
from slowapi_limiter import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sentry_config import init_sentry, capture_api_error
from telemetry import init_telemetry, record_request, record_auth_attempt, record_active_user
import sentry_sdk
import time

from database import get_db, engine
from models import Base, User, Role, Permission, Person, PersonRole
from schemas import (
    UserCreate, UserResponse, LoginRequest, LoginResponse, PersonCreate, PersonResponse, PersonUpdate,
    RegisterRequest, RegisterResponse, UserUpdate, UserRoleUpdate, UserPromoteRequest, UserPromoteResponse,
    RoleCreate, RoleResponse, RoleUpdate, PermissionCreate, PermissionResponse, PermissionUpdate,
    MessageResponse, UserCreateWithAutoPassword, UserCreateResponse, PersonCreateWithAutoPassword, PersonCreateResponse
)
from password_utils import generate_and_hash_password, generate_strong_password
from password_security import password_security_manager
from password_audit_endpoint import router as password_audit_router
from auth import (
    create_access_token, create_refresh_token, verify_token, get_current_user, verify_password, get_password_hash,
    requires_role, requires_permission, requires_any_role, is_admin, get_user_permissions
)
from config import settings

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize Sentry
init_sentry()

# Initialize OpenTelemetry
init_telemetry()

# Initialize CSRF protection
init_csrf_protection(settings.secret_key)

app = FastAPI(
    title="ACI API",
    description="Internal SaaS Application API with Role-Based Access Control",
    version="1.0.0"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Metrics middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Record metrics
    record_request(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code,
        duration=duration
    )
    
    return response

# Global exception handler for Sentry
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with Sentry integration"""
    # Capture exception in Sentry with context
    user_id = getattr(request.state, 'user_id', None)
    capture_api_error(
        exc, 
        endpoint=request.url.path, 
        method=request.method, 
        user_id=user_id
    )
    
    logger.error(f"Unhandled exception: {exc}", extra={
        "endpoint": request.url.path,
        "method": request.method,
        "user_id": user_id
    }, exc_info=True)
    
    # Return generic error response
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error"
    )

# Create database tables (if they don't exist)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Could not create database tables: {e}")
    logger.warning("Please run 'python init_db.py' to initialize the database")

app = FastAPI(
    title="ACI API",
    description="Internal SaaS Application API with Role-Based Access Control",
    version="1.0.0"
)

# Include API routers
from api.v1.router import v1_router
from api.versioning import version_router
app.include_router(v1_router, prefix="/api")
app.include_router(version_router, prefix="/api", tags=["API Info"])

# Include health check router
app.include_router(health_router)

# Include password audit router
app.include_router(password_audit_router)

# Add security and logging middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SentryContextMiddleware)
app.add_middleware(JWTValidationMiddleware)
app.add_middleware(SecurityMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(BusinessFlowMiddleware)

# Input sanitization middleware
@app.middleware("http")
async def sanitize_request_middleware(request: Request, call_next):
    """Middleware to sanitize all incoming request data"""
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.body()
            if body:
                data = json.loads(body)
                sanitized_data = InputSanitizer.sanitize_dict(data)
                # Replace request body with sanitized data
                request._body = json.dumps(sanitized_data).encode()
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass  # Skip sanitization for non-JSON data
    
    response = await call_next(request)
    return response

# Security middleware for CORS validation
secure_cors = SecureCORSMiddleware(settings.cors_origins, settings.environment)

@app.middleware("http")
async def cors_security_middleware(request: Request, call_next):
    """Enhanced CORS security middleware"""
    origin = request.headers.get("origin")
    
    # Validate origin and headers for production
    if settings.environment == "production" and origin:
        if not secure_cors.validate_origin(origin) or not secure_cors.validate_request_headers(request):
            raise HTTPException(status_code=403, detail="Origin not allowed")
    
    response = await call_next(request)
    return response

# CORS middleware with secure configuration
cors_config = get_cors_config(settings.environment, settings.cors_origins)
app.add_middleware(CORSMiddleware, **cors_config)

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "ACI API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/health")
async def health_check_simple():
    """Simple health check"""
    return {"status": "ok"}

@app.get("/health/detailed")
async def health_check_detailed(db: Session = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "saas-backend",
        "version": settings.app_version,
        "environment": settings.environment,
        "checks": {}
    }
    
    # Database health check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = {"status": "healthy", "response_time_ms": 0}
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
    
    # Sentry health check
    try:
        if hasattr(settings, 'sentry_dsn') and settings.sentry_dsn:
            health_status["checks"]["sentry"] = {"status": "configured"}
        else:
            health_status["checks"]["sentry"] = {"status": "not_configured"}
    except Exception:
        health_status["checks"]["sentry"] = {"status": "error"}
    
    return health_status

@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    from fastapi.responses import Response
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Authentication endpoints
# Legacy auth endpoints (deprecated - use /api/v1/auth instead)
@app.post("/api/auth/register", response_model=RegisterResponse, deprecated=True)
async def register_legacy(register_data: RegisterRequest, request: Request, db: Session = Depends(get_db), _csrf: None = Depends(require_csrf_protection)):
    """Legacy register endpoint - use /api/v1/auth/register instead"""
    from api.v1.auth import register
    return await register(register_data, request, db, None)

@app.post("/api/auth/login", response_model=LoginResponse, deprecated=True)
async def login_legacy(login_data: LoginRequest, response: Response, request: Request, db: Session = Depends(get_db), _csrf: None = Depends(require_csrf_protection)):
    """Legacy login endpoint - use /api/v1/auth/login instead"""
    from api.v1.auth import login
    return await login(login_data, response, request, db, None)

@app.get("/api/auth/me", response_model=UserResponse, deprecated=True)
async def get_current_user_info_legacy(current_user: User = Depends(get_current_user)):
    """Legacy user info endpoint - use /api/v1/auth/me instead"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.name if current_user.role else None,
        permissions=get_user_permissions(current_user),
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@app.post("/api/auth/logout", deprecated=True)
async def logout_legacy(response: Response, request: Request, _csrf: None = Depends(require_csrf_protection)):
    """Legacy logout endpoint - use /api/v1/auth/logout instead"""
    from api.v1.auth import logout
    return await logout(response)

@app.post("/api/auth/refresh", response_model=LoginResponse, deprecated=True)
async def refresh_token_legacy(request: Request, response: Response, db: Session = Depends(get_db), _csrf: None = Depends(require_csrf_protection)):
    """Legacy refresh endpoint - use /api/v1/auth/refresh instead"""
    from api.v1.auth import refresh_token
    return await refresh_token(request, response, db, None)

# Secure Files endpoint (ITRA only)
@app.get("/api/secure-files", response_model=dict)
async def get_secure_files(current_user: User = Depends(requires_any_role(["ITRA", "SuperUser"]))):
    """Get secure files (ITRA and SuperUser only)"""
    logger.info("Secure files accessed", extra={
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role.name if current_user.role else None
    })
    
    # Mock secure files data
    secure_files = [
        {
            "id": 1,
            "name": "confidential_report_2024.pdf",
            "size": "2.5 MB",
            "uploaded_at": "2024-01-15T10:30:00Z",
            "uploaded_by": "cathy@aci.local"
        },
        {
            "id": 2,
            "name": "internal_audit_results.xlsx",
            "size": "1.8 MB",
            "uploaded_at": "2024-01-14T14:20:00Z",
            "uploaded_by": "preet@aci.local"
        },
        {
            "id": 3,
            "name": "security_assessment.docx",
            "size": "3.2 MB",
            "uploaded_at": "2024-01-13T09:15:00Z",
            "uploaded_by": "cathy@aci.local"
        }
    ]
    
    return {
        "files": secure_files,
        "total_count": len(secure_files),
        "access_granted_by": current_user.username,
        "role": current_user.role.name if current_user.role else None
    }

# User management endpoints (Admin only)
@app.get("/api/users", response_model=List[UserResponse])
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

@app.get("/api/users/{user_id}", response_model=UserResponse)
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

@app.post("/api/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:create"))
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

@app.post("/api/users/auto-password", response_model=UserCreateResponse)
async def create_user_with_auto_password(
    user_data: UserCreateWithAutoPassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:create"))
):
    """Create a new user with auto-generated secure password (requires user:create permission)"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
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
    
    # Generate secure password with audit logging
    password_data = password_security_manager.create_user_password(
        username=user_data.username,
        email=user_data.email,
        created_by=current_user.username,
        length=12
    )
    
    # Create new user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=password_data['hashed_password'],
        role_id=user_data.role_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserCreateResponse(
        message=f"User {user_data.username} created successfully with auto-generated password",
        user=UserResponse(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            role=db_user.role.name if db_user.role else None,
            permissions=get_user_permissions(db_user),
            is_active=db_user.is_active,
            created_at=db_user.created_at
        ),
        generated_password=password_data['plain_password']  # Only returned once for security
    )

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:update"))
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

@app.delete("/api/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("user:delete"))
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

# Admin-only user promotion endpoint
@app.post("/api/admin/promote-user", response_model=UserPromoteResponse)
async def promote_user(
    promote_data: UserPromoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)
):
    """Promote user to a different role (Admin only)"""
    user = db.query(User).filter(User.id == promote_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    role = db.query(Role).filter(Role.id == promote_data.role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    user.role_id = promote_data.role_id
    db.commit()
    db.refresh(user)
    
    return UserPromoteResponse(
        message=f"User {user.username} promoted to {role.name} role",
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

# Role management endpoints (Admin only)
@app.get("/api/roles", response_model=List[RoleResponse])
async def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("role:read"))
):
    """Get all roles (requires role:read permission)"""
    roles = db.query(Role).all()
    return [
        RoleResponse(
            id=role.id,
            name=role.name,
            description=role.description,
            permissions=[perm.name for perm in role.permissions],
            created_at=role.created_at
        )
        for role in roles
    ]

@app.post("/api/roles", response_model=RoleResponse)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("role:create"))
):
    """Create a new role (requires role:create permission)"""
    # Check if role already exists
    existing_role = db.query(Role).filter(Role.name == role_data.name).first()
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists"
        )
    
    # Create new role
    db_role = Role(
        name=role_data.name,
        description=role_data.description
    )
    
    # Add permissions if provided
    if role_data.permission_ids:
        permissions = db.query(Permission).filter(Permission.id.in_(role_data.permission_ids)).all()
        db_role.permissions = permissions
    
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    
    return RoleResponse(
        id=db_role.id,
        name=db_role.name,
        description=db_role.description,
        permissions=[perm.name for perm in db_role.permissions],
        created_at=db_role.created_at
    )

# Permission management endpoints (Admin only)
@app.get("/api/permissions", response_model=List[PermissionResponse])
async def get_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("permission:read"))
):
    """Get all permissions (requires permission:read permission)"""
    permissions = db.query(Permission).all()
    return [
        PermissionResponse(
            id=perm.id,
            name=perm.name,
            description=perm.description,
            created_at=perm.created_at
        )
        for perm in permissions
    ]

@app.post("/api/permissions", response_model=PermissionResponse)
async def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("permission:create"))
):
    """Create a new permission (requires permission:create permission)"""
    # Check if permission already exists
    existing_permission = db.query(Permission).filter(Permission.name == permission_data.name).first()
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission already exists"
        )
    
    # Create new permission
    db_permission = Permission(
        name=permission_data.name,
        description=permission_data.description
    )
    
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    
    return PermissionResponse(
        id=db_permission.id,
        name=db_permission.name,
        description=db_permission.description,
        created_at=db_permission.created_at
    )

# Person endpoints (keeping existing functionality)
@app.post("/api/persons", response_model=PersonResponse)
async def create_person(
    person_data: PersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:create"))
):
    """Create a new person with manual password (requires person:create permission)"""
    # Check if person already exists
    existing_person = db.query(Person).filter(Person.username == person_data.username).first()
    if existing_person:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new person
    hashed_password = get_password_hash(person_data.password)
    db_person = Person(
        username=person_data.username,
        email=person_data.email,
        hashed_password=hashed_password,
        role=person_data.role
    )
    
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    
    return PersonResponse(
        id=str(db_person.id),
        username=db_person.username,
        email=db_person.email,
        role=db_person.role.value,
        is_active=db_person.is_active,
        created_at=db_person.created_at
    )

@app.post("/api/persons/auto-password", response_model=PersonCreateResponse)
async def create_person_with_auto_password(
    person_data: PersonCreateWithAutoPassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:create"))
):
    """Create a new person with auto-generated secure password (requires person:create permission)"""
    # Check if person already exists
    existing_person = db.query(Person).filter(Person.username == person_data.username).first()
    if existing_person:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = db.query(Person).filter(Person.email == person_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate secure password with audit logging
    password_data = password_security_manager.create_user_password(
        username=person_data.username,
        email=person_data.email,
        created_by=current_user.username,
        length=12
    )
    
    # Create new person
    db_person = Person(
        username=person_data.username,
        email=person_data.email,
        hashed_password=password_data['hashed_password'],
        role=person_data.role
    )
    
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    
    return PersonCreateResponse(
        message=f"Person {person_data.username} created successfully with auto-generated password",
        person=PersonResponse(
            id=str(db_person.id),
            username=db_person.username,
            email=db_person.email,
            role=db_person.role.value,
            is_active=db_person.is_active,
            created_at=db_person.created_at
        ),
        generated_password=password_data['plain_password']  # Only returned once for security
    )

@app.get("/api/persons", response_model=List[PersonResponse])
async def get_persons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:read"))
):
    """Get all persons (requires person:read permission)"""
    persons = db.query(Person).offset(skip).limit(limit).all()
    return [
        PersonResponse(
            id=str(person.id),
            username=person.username,
            email=person.email,
            role=person.role.value,
            is_active=person.is_active,
            created_at=person.created_at
        )
        for person in persons
    ]

@app.get("/api/persons/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:read"))
):
    """Get specific person (requires person:read permission)"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if person is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    return PersonResponse(
        id=str(person.id),
        username=person.username,
        email=person.email,
        role=person.role.value,
        is_active=person.is_active,
        created_at=person.created_at
    )

@app.put("/api/persons/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: str,
    person_data: PersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:update"))
):
    """Update person (requires person:update permission)"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if person is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    # Update fields if provided
    if person_data.username is not None:
        person.username = person_data.username
    if person_data.email is not None:
        person.email = person_data.email
    if person_data.role is not None:
        person.role = person_data.role
    if person_data.is_active is not None:
        person.is_active = person_data.is_active
    
    db.commit()
    db.refresh(person)
    
    return PersonResponse(
        id=str(person.id),
        username=person.username,
        email=person.email,
        role=person.role.value,
        is_active=person.is_active,
        created_at=person.created_at
    )

@app.delete("/api/persons/{person_id}")
async def delete_person(
    person_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("person:delete"))
):
    """Delete person (requires person:delete permission)"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if person is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found"
        )
    
    db.delete(person)
    db.commit()
    
    return {"message": "Person deleted successfully"}

# Tasks endpoints
@app.get("/api/tasks")
async def get_tasks(current_user: User = Depends(requires_any_role(["SuperUser", "Admin"]))):
    """Get all tasks (Admin only)"""
    return [
        {"id": 1, "title": "System Maintenance", "status": "In Progress", "priority": "High", "assigned_to": "admin", "due_date": "2024-01-20"},
        {"id": 2, "title": "User Training", "status": "Completed", "priority": "Medium", "assigned_to": "manager", "due_date": "2024-01-15"},
        {"id": 3, "title": "Security Audit", "status": "Pending", "priority": "High", "assigned_to": "itra", "due_date": "2024-01-25"}
    ]

# Websites endpoints
@app.get("/api/websites")
async def get_websites(current_user: User = Depends(get_current_user)):
    """Get website monitoring data"""
    return [
        {"id": 1, "name": "Main Website", "url": "https://example.com", "status": "Online", "response_time": "120ms", "uptime": "99.9%"},
        {"id": 2, "name": "API Server", "url": "https://api.example.com", "status": "Online", "response_time": "85ms", "uptime": "99.8%"},
        {"id": 3, "name": "CDN", "url": "https://cdn.example.com", "status": "Online", "response_time": "45ms", "uptime": "100%"}
    ]

# Analytics endpoints
@app.get("/api/analytics")
async def get_analytics(current_user: User = Depends(requires_any_role(["SuperUser", "Admin", "Manager"]))):
    """Get analytics data"""
    return {
        "page_views": 45231,
        "unique_visitors": 12450,
        "bounce_rate": 42.1,
        "conversion_rate": 3.24,
        "top_pages": [
            {"/dashboard": 12450},
            {"/analytics": 8230},
            {"/users": 5670},
            {"/reports": 4120}
        ],
        "traffic_sources": {
            "direct": 45.2,
            "search": 32.1,
            "social": 12.7,
            "referral": 10.0
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 