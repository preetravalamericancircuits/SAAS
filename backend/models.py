from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from database import Base

# Association table for many-to-many relationship between roles and permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), index=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), index=True),
    Index('ix_role_permissions_composite', 'role_id', 'permission_id')
)

class PersonRole(enum.Enum):
    SUPER_USER = "SuperUser"
    OPERATOR = "Operator"
    USER = "User"
    ITRA = "ITRA"

class Person(Base):
    __tablename__ = "person"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(PersonRole), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    is_active = Column(Boolean, default=True, index=True)
    
    __table_args__ = (
        Index('ix_person_active_role', 'is_active', 'role'),
        Index('ix_person_username_active', 'username', 'is_active'),
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship with Role
    role_id = Column(Integer, ForeignKey("roles.id"), index=True)
    role = relationship("Role", back_populates="users")
    
    __table_args__ = (
        Index('ix_users_active_role', 'is_active', 'role_id'),
        Index('ix_users_username_active', 'username', 'is_active'),
        Index('ix_users_email_active', 'email', 'is_active'),
        Index('ix_users_created_active', 'created_at', 'is_active'),
    )

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions") 