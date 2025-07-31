#!/usr/bin/env python3
"""
Seed Initial Users Script
Creates initial users with hashed passwords for the SAAS application.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Role, Person, PersonRole
from auth import get_password_hash
from config import settings

def create_roles(db: Session):
    """Create default roles if they don't exist"""
    roles_data = [
        {"name": "SuperUser", "description": "Full system access with all permissions"},
        {"name": "Admin", "description": "Administrative access with user and role management"},
        {"name": "Manager", "description": "Manager access with limited user management"},
        {"name": "User", "description": "Standard user access"},
        {"name": "Operator", "description": "Operator access for system operations"},
        {"name": "ITRA", "description": "Internal Technical Review Authority access"},
        {"name": "Guest", "description": "Limited read-only access"}
    ]
    
    for role_data in roles_data:
        existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not existing_role:
            role = Role(**role_data)
            db.add(role)
            print(f"Created role: {role_data['name']}")
    
    db.commit()

def create_users(db: Session):
    """Create initial users in the users table"""
    users_data = [
        {
            "username": "preet",
            "email": "preet@aci.local",
            "password": "password123",
            "role_name": "SuperUser",
            "is_active": True
        },
        {
            "username": "operator1",
            "email": "operator1@aci.local",
            "password": "password123",
            "role_name": "Operator",
            "is_active": True
        },
        {
            "username": "user1",
            "email": "user1@aci.local",
            "password": "password123",
            "role_name": "User",
            "is_active": True
        },
        {
            "username": "itra1",
            "email": "itra1@aci.local",
            "password": "password123",
            "role_name": "ITRA",
            "is_active": True
        },
        {
            "username": "admin",
            "email": "admin@example.com",
            "password": "admin123",
            "role_name": "SuperUser",
            "is_active": True
        }
    ]
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if existing_user:
            print(f"User {user_data['username']} already exists, skipping...")
            continue
        
        # Get role
        role = db.query(Role).filter(Role.name == user_data["role_name"]).first()
        if not role:
            print(f"Role {user_data['role_name']} not found, skipping user {user_data['username']}")
            continue
        
        # Create user
        hashed_password = get_password_hash(user_data["password"])
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            role_id=role.id,
            is_active=user_data["is_active"]
        )
        
        db.add(user)
        print(f"Created user: {user_data['username']} with role: {user_data['role_name']}")
    
    db.commit()

def create_persons(db: Session):
    """Create initial users in the person table"""
    persons_data = [
        {
            "username": "preet",
            "email": "preet@aci.local",
            "password": "password123",
            "role": PersonRole.SUPER_USER,
            "is_active": True
        },
        {
            "username": "kanav",
            "email": "kanav@aci.local",
            "password": "password123",
            "role": PersonRole.OPERATOR,
            "is_active": True
        },
        {
            "username": "khash",
            "email": "khash@aci.local",
            "password": "password123",
            "role": PersonRole.USER,
            "is_active": True
        },
        {
            "username": "cathy",
            "email": "cathy@aci.local",
            "password": "password123",
            "role": PersonRole.ITRA,
            "is_active": True
        },
        {
            "username": "pratiksha",
            "email": "pratiksha@aci.local",
            "password": "password123",
            "role": PersonRole.USER,
            "is_active": True
        }
    ]
    
    for person_data in persons_data:
        # Check if person already exists
        existing_person = db.query(Person).filter(Person.username == person_data["username"]).first()
        if existing_person:
            print(f"Person {person_data['username']} already exists, skipping...")
            continue
        
        # Create person
        hashed_password = get_password_hash(person_data["password"])
        person = Person(
            username=person_data["username"],
            email=person_data["email"],
            hashed_password=hashed_password,
            role=person_data["role"],
            is_active=person_data["is_active"]
        )
        
        db.add(person)
        print(f"Created person: {person_data['username']} with role: {person_data['role'].value}")
    
    db.commit()

def main():
    """Main function to seed all initial data"""
    print("Starting user seeding process...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create roles
        print("\nCreating roles...")
        create_roles(db)
        
        # Create users in users table
        print("\nCreating users in users table...")
        create_users(db)
        
        # Create persons in person table
        print("\nCreating persons in person table...")
        create_persons(db)
        
        print("\n✅ User seeding completed successfully!")
        print("\nDefault credentials:")
        print("SuperUser: preet / password123")
        print("Operator: operator1 / password123")
        print("User: user1 / password123")
        print("ITRA: itra1 / password123")
        print("Admin: admin / admin123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main() 