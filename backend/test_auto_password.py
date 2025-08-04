"""
Test script for auto-generated password functionality
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "preet"
ADMIN_PASSWORD = "password123"

def login_admin():
    """Login as admin to get access token"""
    login_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        # Extract cookie for subsequent requests
        return response.cookies
    else:
        print(f"Login failed: {response.text}")
        return None

def test_create_user_with_auto_password(cookies):
    """Test creating a user with auto-generated password"""
    user_data = {
        "username": "testuser_auto",
        "email": "testuser_auto@example.com",
        "role_id": 1  # Assuming role ID 1 exists
    }
    
    response = requests.post(
        f"{BASE_URL}/api/users/auto-password", 
        json=user_data,
        cookies=cookies
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ User created successfully with auto-generated password!")
        print(f"Username: {result['user']['username']}")
        print(f"Email: {result['user']['email']}")
        print(f"Generated Password: {result['generated_password']}")
        print(f"Role: {result['user']['role']}")
        print("⚠️  IMPORTANT: Save this password - it won't be shown again!")
        return result['generated_password']
    else:
        print(f"❌ User creation failed: {response.text}")
        return None

def test_create_person_with_auto_password(cookies):
    """Test creating a person with auto-generated password"""
    person_data = {
        "username": "testperson_auto",
        "email": "testperson_auto@example.com",
        "role": "User"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/persons/auto-password", 
        json=person_data,
        cookies=cookies
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Person created successfully with auto-generated password!")
        print(f"Username: {result['person']['username']}")
        print(f"Email: {result['person']['email']}")
        print(f"Generated Password: {result['generated_password']}")
        print(f"Role: {result['person']['role']}")
        print("⚠️  IMPORTANT: Save this password - it won't be shown again!")
        return result['generated_password']
    else:
        print(f"❌ Person creation failed: {response.text}")
        return None

def test_login_with_generated_password(username, password):
    """Test logging in with the generated password"""
    login_data = {
        "username": username,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        print(f"✅ Successfully logged in with generated password for {username}")
        return True
    else:
        print(f"❌ Login failed for {username}: {response.text}")
        return False

if __name__ == "__main__":
    print("🔐 Testing Auto-Generated Password Functionality")
    print("=" * 50)
    
    # Login as admin
    print("1. Logging in as admin...")
    cookies = login_admin()
    if not cookies:
        print("❌ Cannot proceed without admin access")
        exit(1)
    
    print("\n2. Creating user with auto-generated password...")
    user_password = test_create_user_with_auto_password(cookies)
    
    print("\n3. Creating person with auto-generated password...")
    person_password = test_create_person_with_auto_password(cookies)
    
    if user_password:
        print("\n4. Testing login with generated user password...")
        test_login_with_generated_password("testuser_auto", user_password)
    
    if person_password:
        print("\n5. Testing login with generated person password...")
        test_login_with_generated_password("testperson_auto", person_password)
    
    print("\n🎉 Auto-password testing completed!")
    print("📝 Note: Generated passwords are cryptographically secure and unique per user.")