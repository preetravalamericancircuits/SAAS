from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from input_sanitizer import (
    username_validator, email_validator, password_validator, 
    role_name_validator, sanitize_string_validator
)

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
        return username_validator(cls, v)
    
    @validator('email')
    def email_must_be_valid(cls, v):
        return email_validator(cls, v)

class PersonCreate(PersonBase):
    password: str

    @validator('password')
    def password_must_be_strong(cls, v):
        return password_validator(cls, v)

class PersonCreateWithAutoPassword(BaseModel):
    username: str
    email: str
    role: PersonRole

    @validator('username')
    def username_must_be_valid(cls, v):
        return username_validator(cls, v)
    
    @validator('email')
    def email_must_be_valid(cls, v):
        return email_validator(cls, v)

class PersonResponse(PersonBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

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
            return username_validator(cls, v)
        return v
    
    @validator('email')
    def email_must_be_valid(cls, v):
        if v is not None:
            return email_validator(cls, v)
        return v

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

    @validator('username')
    def username_must_be_valid(cls, v):
        return username_validator(cls, v)
    
    @validator('email')
    def email_must_be_valid(cls, v):
        return email_validator(cls, v)

class UserCreate(UserBase):
    password: str
    role_id: Optional[int] = None

    @validator('password')
    def password_must_be_strong(cls, v):
        return password_validator(cls, v)

class UserCreateWithAutoPassword(BaseModel):
    username: str
    email: str
    role_id: Optional[int] = None

    @validator('username')
    def username_must_be_valid(cls, v):
        return username_validator(cls, v)
    
    @validator('email')
    def email_must_be_valid(cls, v):
        return email_validator(cls, v)

class UserResponse(UserBase):
    id: int
    role: Optional[str] = None
    permissions: List[str] = []
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

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
            return username_validator(cls, v)
        return v
    
    @validator('email')
    def email_must_be_valid(cls, v):
        if v is not None:
            return email_validator(cls, v)
        return v

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
        return username_validator(cls, v)
    
    @validator('email')
    def email_must_be_valid(cls, v):
        return email_validator(cls, v)

    @validator('password')
    def password_must_be_strong(cls, v):
        return password_validator(cls, v)

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
        return role_name_validator(cls, v)
    
    @validator('description')
    def description_must_be_valid(cls, v):
        if v is not None:
            return sanitize_string_validator(500)(cls, v)
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
            return role_name_validator(cls, v)
        return v
    
    @validator('description')
    def description_must_be_valid(cls, v):
        if v is not None:
            return sanitize_string_validator(500)(cls, v)
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
        return sanitize_string_validator(100)(cls, v)
    
    @validator('description')
    def description_must_be_valid(cls, v):
        if v is not None:
            return sanitize_string_validator(500)(cls, v)
        return v

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    @validator('name')
    def name_must_be_valid(cls, v):
        if v is not None:
            return sanitize_string_validator(100)(cls, v)
        return v
    
    @validator('description')
    def description_must_be_valid(cls, v):
        if v is not None:
            return sanitize_string_validator(500)(cls, v)
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