#!/usr/bin/env python3
"""
Database initialization script for SAAS application
Creates tables and seeds initial data
"""

from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, User, Role, Permission, role_permissions
from auth import get_password_hash

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def create_permissions(db: Session):
    """Create default permissions"""
    permissions_data = [
        ("user:read", "Read user information"),
        ("user:create", "Create new users"),
        ("user:update", "Update user information"),
        ("user:delete", "Delete users"),
        ("role:read", "Read role information"),
        ("role:create", "Create new roles"),
        ("role:update", "Update role information"),
        ("role:delete", "Delete roles"),
        ("permission:read", "Read permission information"),
        ("permission:create", "Create new permissions"),
        ("permission:update", "Update permission information"),
        ("permission:delete", "Delete permissions"),
        ("system:admin", "System administration"),
        ("system:read", "System read access"),
        ("secure_files:read", "Read secure files"),
        ("secure_files:write", "Write secure files"),
        ("person:read", "Read person information"),
        ("person:create", "Create new persons"),
        ("person:update", "Update person information"),
        ("person:delete", "Delete persons")
    ]
    
    print("Creating permissions...")
    for name, description in permissions_data:
        if not db.query(Permission).filter(Permission.name == name).first():
            permission = Permission(name=name, description=description)
            db.add(permission)
    
    db.commit()
    print("✅ Permissions created successfully")

def create_roles(db: Session):
    """Create default roles with permissions"""
    roles_data = [
        ("SuperUser", "Super User with full access", [
            "user:read", "user:create", "user:update", "user:delete",
            "role:read", "role:create", "role:update", "role:delete",
            "permission:read", "permission:create", "permission:update", "permission:delete",
            "system:admin", "system:read", "secure_files:read", "secure_files:write",
            "person:read", "person:create", "person:update", "person:delete"
        ]),
        ("Admin", "Administrator with management access", [
            "user:read", "user:create", "user:update", "user:delete",
            "role:read", "system:read", "person:read", "person:create", "person:update"
        ]),
        ("Manager", "Manager with limited admin access", [
            "user:read", "system:read", "person:read"
        ]),
        ("User", "Standard user access", [
            "system:read"
        ]),
        ("Operator", "System operator access", [
            "system:read", "person:read"
        ]),
        ("ITRA", "Internal Technical Review Authority", [
            "system:read", "secure_files:read", "secure_files:write"
        ]),
        ("Guest", "Guest access", [
            "system:read"
        ])
    ]
    
    print("Creating roles...")
    for role_name, description, permission_names in roles_data:
        if not db.query(Role).filter(Role.name == role_name).first():
            role = Role(name=role_name, description=description)
            db.add(role)
            db.flush()  # Get the role ID
            
            # Add permissions to role
            for perm_name in permission_names:
                permission = db.query(Permission).filter(Permission.name == perm_name).first()
                if permission:
                    db.execute(role_permissions.insert().values(role_id=role.id, permission_id=permission.id))
    
    db.commit()
    print("✅ Roles created successfully")

def create_users(db: Session):
    """Create default users"""
    users_data = [
        ("preet", "preet@aci.local", "password123", "SuperUser"),
        ("admin", "admin@aci.local", "admin123", "Admin"),
        ("operator1", "operator1@aci.local", "password123", "Operator"),
        ("user1", "user1@aci.local", "password123", "User"),
        ("itra1", "itra1@aci.local", "password123", "ITRA"),
        ("manager1", "manager1@aci.local", "password123", "Manager"),
        ("guest1", "guest1@aci.local", "password123", "Guest")
    ]
    
    print("Creating users...")
    for username, email, password, role_name in users_data:
        if not db.query(User).filter(User.username == username).first():
            role = db.query(Role).filter(Role.name == role_name).first()
            if role:
                user = User(
                    username=username,
                    email=email,
                    hashed_password=get_password_hash(password),
                    role_id=role.id,
                    is_active=True
                )
                db.add(user)
    
    db.commit()
    print("✅ Users created successfully")

def main():
    """Main initialization function"""
    print("🚀 Initializing SAAS Database...\n")
    
    # Create tables
    create_tables()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create permissions
        create_permissions(db)
        
        # Create roles
        create_roles(db)
        
        # Create users
        create_users(db)
        
        print("\n✅ Database initialization completed successfully!")
        print("\n👤 Default Users Created:")
        print("  • preet / password123 (SuperUser)")
        print("  • admin / admin123 (Admin)")
        print("  • operator1 / password123 (Operator)")
        print("  • user1 / password123 (User)")
        print("  • itra1 / password123 (ITRA)")
        print("  • manager1 / password123 (Manager)")
        print("  • guest1 / password123 (Guest)")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()