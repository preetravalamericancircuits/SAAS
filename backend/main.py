from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os

from database import get_db, engine
from models import Base, User, Role, Permission, Person, PersonRole
from schemas import (
    UserCreate, UserResponse, LoginRequest, LoginResponse, PersonCreate, PersonResponse, PersonUpdate,
    RegisterRequest, RegisterResponse, UserUpdate, UserRoleUpdate, UserPromoteRequest, UserPromoteResponse,
    RoleCreate, RoleResponse, RoleUpdate, PermissionCreate, PermissionResponse, PermissionUpdate,
    MessageResponse
)
from auth import (
    create_access_token, get_current_user, verify_password, get_password_hash,
    requires_role, requires_permission, requires_any_role, is_admin, get_user_permissions
)
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ACI API",
    description="Internal SaaS Application API with Role-Based Access Control",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "ACI API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/auth/register", response_model=RegisterResponse)
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
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

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login user and return JWT token with HTTP-only cookie"""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
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
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.environment == "production",  # HTTPS only in production
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60
    )
    
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

@app.get("/api/auth/me", response_model=UserResponse)
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

@app.post("/api/auth/logout")
async def logout(response: Response):
    """Logout user (clear cookie)"""
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}

# Secure Files endpoint (ITRA only)
@app.get("/api/secure-files", response_model=dict)
async def get_secure_files(current_user: User = Depends(requires_any_role(["ITRA", "SuperUser"]))):
    """Get secure files (ITRA and SuperUser only)"""
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
    """Create a new user (requires user:create permission)"""
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
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        role=db_user.role.name if db_user.role else None,
        permissions=get_user_permissions(db_user),
        is_active=db_user.is_active,
        created_at=db_user.created_at
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
    """Create a new person (requires person:create permission)"""
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 