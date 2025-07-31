#!/usr/bin/env python3
"""
Database initialization script for ACI SaaS Application
Creates initial roles, permissions, and admin user
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Role, Permission
from auth import get_password_hash
from config import settings

def init_db():
    """Initialize the database with default roles and permissions"""
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Create default permissions
        permissions = [
            # User management permissions
            {"name": "user:read", "description": "Read user information"},
            {"name": "user:create", "description": "Create new users"},
            {"name": "user:update", "description": "Update user information"},
            {"name": "user:delete", "description": "Delete users"},
            
            # Role management permissions
            {"name": "role:read", "description": "Read role information"},
            {"name": "role:create", "description": "Create new roles"},
            {"name": "role:update", "description": "Update role information"},
            {"name": "role:delete", "description": "Delete roles"},
            
            # Permission management permissions
            {"name": "permission:read", "description": "Read permission information"},
            {"name": "permission:create", "description": "Create new permissions"},
            {"name": "permission:update", "description": "Update permission information"},
            {"name": "permission:delete", "description": "Delete permissions"},
            
            # Person management permissions
            {"name": "person:read", "description": "Read person information"},
            {"name": "person:create", "description": "Create new persons"},
            {"name": "person:update", "description": "Update person information"},
            {"name": "person:delete", "description": "Delete persons"},
            
            # System permissions
            {"name": "system:admin", "description": "Full system administration access"},
            {"name": "system:read", "description": "Read system information"},
        ]
        
        # Add permissions to database
        for perm_data in permissions:
            existing_perm = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
            if not existing_perm:
                perm = Permission(**perm_data)
                db.add(perm)
                print(f"Created permission: {perm_data['name']}")
        
        db.commit()
        
        # Create default roles
        roles = [
            {
                "name": "SuperUser",
                "description": "Full system access with all permissions",
                "permissions": [
                    "user:read", "user:create", "user:update", "user:delete",
                    "role:read", "role:create", "role:update", "role:delete",
                    "permission:read", "permission:create", "permission:update", "permission:delete",
                    "person:read", "person:create", "person:update", "person:delete",
                    "system:admin", "system:read"
                ]
            },
            {
                "name": "Admin",
                "description": "Administrative access with user and role management",
                "permissions": [
                    "user:read", "user:create", "user:update", "user:delete",
                    "role:read", "role:create", "role:update",
                    "permission:read",
                    "person:read", "person:create", "person:update", "person:delete",
                    "system:read"
                ]
            },
            {
                "name": "Manager",
                "description": "Manager access with limited user management",
                "permissions": [
                    "user:read", "user:create", "user:update",
                    "person:read", "person:create", "person:update",
                    "system:read"
                ]
            },
            {
                "name": "User",
                "description": "Standard user access",
                "permissions": [
                    "user:read",
                    "person:read",
                    "system:read"
                ]
            },
            {
                "name": "Guest",
                "description": "Limited read-only access",
                "permissions": [
                    "system:read"
                ]
            }
        ]
        
        # Add roles to database
        for role_data in roles:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                # Get permissions for this role
                role_permissions = db.query(Permission).filter(
                    Permission.name.in_(role_data["permissions"])
                ).all()
                
                role = Role(
                    name=role_data["name"],
                    description=role_data["description"],
                    permissions=role_permissions
                )
                db.add(role)
                print(f"Created role: {role_data['name']} with {len(role_permissions)} permissions")
        
        db.commit()
        
        # Create default admin user if it doesn't exist
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            # Get SuperUser role
            superuser_role = db.query(Role).filter(Role.name == "SuperUser").first()
            
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                role_id=superuser_role.id if superuser_role else None
            )
            db.add(admin_user)
            print("Created default admin user: admin/admin123")
        
        db.commit()
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Error during database initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 