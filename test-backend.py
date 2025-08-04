#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing SAAS Backend...\n")
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Login
    print("\n2. Testing login...")
    try:
        login_data = {
            "username": "preet",
            "password": "password123"
        }
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ Login successful")
            # Get cookies for authenticated requests
            cookies = response.cookies
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return False
    
    # Test 3: Get current user
    print("\n3. Testing authenticated endpoint...")
    try:
        response = requests.get(f"{base_url}/api/auth/me", cookies=cookies)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Authenticated as: {user_data['username']} ({user_data['role']})")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
    
    # Test 4: Test new API endpoints
    print("\n4. Testing new API endpoints...")
    
    endpoints = [
        "/api/tasks",
        "/api/websites", 
        "/api/analytics"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", cookies=cookies)
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
            else:
                print(f"❌ {endpoint} - {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint} - {e}")
    
    print("\n✅ Backend testing completed!")
    return True

if __name__ == "__main__":
    print("⏳ Waiting for backend to start...")
    time.sleep(2)
    test_backend()