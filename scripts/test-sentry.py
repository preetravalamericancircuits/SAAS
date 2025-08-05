#!/usr/bin/env python3

import requests
import json
import sys

def test_sentry_integration():
    """Test Sentry integration by triggering errors"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Sentry Integration")
    print("============================")
    
    # Test 1: Invalid login (should capture failed auth)
    print("\n1. Testing failed authentication capture...")
    try:
        response = requests.post(f"{base_url}/api/v1/auth/login", 
            json={"username": "invalid", "password": "invalid"},
            headers={"X-Requested-With": "XMLHttpRequest"})
        print(f"   Status: {response.status_code}")
        print("   ✅ Failed auth should be captured in Sentry")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Invalid endpoint (should capture 404)
    print("\n2. Testing 404 error capture...")
    try:
        response = requests.get(f"{base_url}/api/v1/nonexistent")
        print(f"   Status: {response.status_code}")
        print("   ✅ 404 error should be captured in Sentry")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Rate limit exceeded
    print("\n3. Testing rate limit capture...")
    for i in range(6):
        try:
            response = requests.post(f"{base_url}/api/v1/auth/login",
                json={"username": "test", "password": "test"},
                headers={"X-Requested-With": "XMLHttpRequest"})
            if response.status_code == 429:
                print(f"   Rate limited on attempt {i+1}")
                print("   ✅ Rate limit should be captured in Sentry")
                break
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n🔍 Sentry Integration Test Complete")
    print("Check your Sentry dashboard for captured events")

if __name__ == "__main__":
    test_sentry_integration()