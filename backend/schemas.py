from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Person schemas
class PersonRole(str, Enum):
    SUPER_USER = "SuperUser"
    OPERATOR = "Operator"
    USER = "User"
    ITRA = "ITRA"

class PersonBase(BaseModel):
    username: str
    email: str
    role: PersonRole

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        return v

class PersonCreate(PersonBase):
    password: str

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class PersonCreateWithAutoPassword(BaseModel):
    username: str
    email: str
    role: PersonRole

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        return v

class PersonCreateResponse(BaseModel):
    message: str
    person: PersonResponse
    generated_password: str  # Only shown once for security

class PersonUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[PersonRole] = None
    is_active: Optional[bool] = None

    @validator('username')
    def username_must_be_valid(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError('Username must be at least 3 characters long')
            if len(v) > 50:
                raise ValueError('Username must be less than 50 characters')
        return v

class PersonResponse(PersonBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        return v

class UserCreate(UserBase):
    password: str
    role_id: Optional[int] = None

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserCreateWithAutoPassword(BaseModel):
    username: str
    email: str
    role_id: Optional[int] = None

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        return v

class UserCreateResponse(BaseModel):
    message: str
    user: UserResponse
    generated_password: str  # Only shown once for security

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

    @validator('username')
    def username_must_be_valid(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError('Username must be at least 3 characters long')
            if len(v) > 50:
                raise ValueError('Username must be less than 50 characters')
        return v

class UserResponse(UserBase):
    id: int
    role: Optional[str] = None
    permissions: List[str] = []
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    confirm_password: str

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        return v

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

    @validator('confirm_password')
    def passwords_must_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

# Role schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

    @validator('name')
    def name_must_be_valid(cls, v):
        if len(v) < 2:
            raise ValueError('Role name must be at least 2 characters long')
        if len(v) > 50:
            raise ValueError('Role name must be less than 50 characters')
        return v

class RoleCreate(RoleBase):
    permission_ids: Optional[List[int]] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None

    @validator('name')
    def name_must_be_valid(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('Role name must be at least 2 characters long')
            if len(v) > 50:
                raise ValueError('Role name must be less than 50 characters')
        return v

class RoleResponse(RoleBase):
    id: int
    permissions: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Permission schemas
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None

    @validator('name')
    def name_must_be_valid(cls, v):
        if len(v) < 2:
            raise ValueError('Permission name must be at least 2 characters long')
        if len(v) > 100:
            raise ValueError('Permission name must be less than 100 characters')
        return v

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    @validator('name')
    def name_must_be_valid(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('Permission name must be at least 2 characters long')
            if len(v) > 100:
                raise ValueError('Permission name must be less than 100 characters')
        return v

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# User management schemas
class UserRoleUpdate(BaseModel):
    role_id: int

class UserPromoteRequest(BaseModel):
    user_id: int
    role_id: int

class UserPromoteResponse(BaseModel):
    message: str
    user: UserResponse

# Token schemas
class TokenData(BaseModel):
    username: Optional[str] = None
    permissions: List[str] = []

# Response schemas
class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str 