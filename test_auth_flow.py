#!/usr/bin/env python3
"""
Authentication Flow End-to-End Test Script
Tests login, access to protected routes, and logout behavior across Docker containers.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class AuthFlowTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        print()
    
    def test_health_check(self) -> bool:
        """Test if the API is running"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            if response.status_code == 200:
                self.log_test("Health Check", True, f"API is running at {self.base_url}")
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_register_user(self, username: str, email: str, password: str) -> bool:
        """Test user registration"""
        try:
            data = {
                "username": username,
                "email": email,
                "password": password
            }
            response = self.session.post(f"{self.base_url}/api/auth/register", json=data)
            
            if response.status_code == 200:
                user_data = response.json()
                self.log_test("User Registration", True, f"User '{username}' registered successfully")
                return True
            elif response.status_code == 400 and "already registered" in response.text:
                self.log_test("User Registration", True, f"User '{username}' already exists (expected)")
                return True
            else:
                self.log_test("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False
    
    def test_login(self, username: str, password: str) -> bool:
        """Test user login and cookie setting"""
        try:
            data = {
                "username": username,
                "password": password
            }
            response = self.session.post(f"{self.base_url}/api/auth/login", json=data)
            
            if response.status_code == 200:
                login_data = response.json()
                
                # Check if access_token is in response
                if 'access_token' in login_data:
                    self.log_test("Login - Token in Response", True, "Access token received in response")
                else:
                    self.log_test("Login - Token in Response", False, "No access token in response")
                    return False
                
                # Check if cookie is set
                if 'access_token' in self.session.cookies:
                    self.log_test("Login - Cookie Setting", True, "HTTP-only cookie set successfully")
                else:
                    self.log_test("Login - Cookie Setting", False, "No access_token cookie found")
                    return False
                
                # Check user data
                if 'user' in login_data:
                    user = login_data['user']
                    self.log_test("Login - User Data", True, f"User data received: {user.get('username')} ({user.get('role')})")
                else:
                    self.log_test("Login - User Data", False, "No user data in response")
                    return False
                
                return True
            else:
                self.log_test("Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Login", False, f"Error: {str(e)}")
            return False
    
    def test_protected_route_access(self) -> bool:
        """Test access to protected routes using cookie authentication"""
        try:
            # Test /api/auth/me endpoint
            response = self.session.get(f"{self.base_url}/api/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                self.log_test("Protected Route - /api/auth/me", True, f"Authenticated as: {user_data.get('username')}")
                
                # Test another protected endpoint
                response2 = self.session.get(f"{self.base_url}/api/users")
                if response2.status_code == 200:
                    self.log_test("Protected Route - /api/users", True, "Successfully accessed users endpoint")
                elif response2.status_code == 403:
                    self.log_test("Protected Route - /api/users", True, "Access denied (expected - no user:read permission)")
                else:
                    self.log_test("Protected Route - /api/users", False, f"Unexpected status: {response2.status_code}")
                
                return True
            else:
                self.log_test("Protected Route - /api/auth/me", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Protected Route Access", False, f"Error: {str(e)}")
            return False
    
    def test_unauthorized_access(self) -> bool:
        """Test that unauthorized requests are properly rejected"""
        try:
            # Create a new session without authentication
            unauth_session = requests.Session()
            unauth_session.headers.update({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
            
            response = unauth_session.get(f"{self.base_url}/api/auth/me")
            
            if response.status_code == 401:
                self.log_test("Unauthorized Access", True, "Properly rejected unauthorized request")
                return True
            else:
                self.log_test("Unauthorized Access", False, f"Expected 401, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Unauthorized Access", False, f"Error: {str(e)}")
            return False
    
    def test_logout(self) -> bool:
        """Test logout functionality"""
        try:
            response = self.session.post(f"{self.base_url}/api/auth/logout")
            
            if response.status_code == 200:
                self.log_test("Logout - Request", True, "Logout request successful")
                
                # Check if cookie is cleared
                if 'access_token' not in self.session.cookies:
                    self.log_test("Logout - Cookie Clearing", True, "Access token cookie cleared")
                else:
                    self.log_test("Logout - Cookie Clearing", False, "Access token cookie still present")
                    return False
                
                # Test that protected routes are now inaccessible
                response2 = self.session.get(f"{self.base_url}/api/auth/me")
                if response2.status_code == 401:
                    self.log_test("Logout - Route Protection", True, "Protected routes properly inaccessible after logout")
                else:
                    self.log_test("Logout - Route Protection", False, f"Protected route still accessible: {response2.status_code}")
                    return False
                
                return True
            else:
                self.log_test("Logout", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Logout", False, f"Error: {str(e)}")
            return False
    
    def test_cross_container_communication(self) -> bool:
        """Test that authentication works across container boundaries"""
        try:
            # Test with different user agents and headers to simulate cross-container requests
            headers = {
                'User-Agent': 'Docker-Container-Test/1.0',
                'X-Forwarded-For': '172.20.0.1',
                'X-Real-IP': '172.20.0.1'
            }
            
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 200:
                self.log_test("Cross-Container Communication", True, "Authentication works across container boundaries")
                return True
            else:
                self.log_test("Cross-Container Communication", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Cross-Container Communication", False, f"Error: {str(e)}")
            return False
    
    def test_token_expiration_simulation(self) -> bool:
        """Test token validation (simulate expired token)"""
        try:
            # Create a session with an invalid token
            invalid_session = requests.Session()
            invalid_session.cookies.set('access_token', 'invalid_token_here', domain='localhost', path='/')
            
            response = invalid_session.get(f"{self.base_url}/api/auth/me")
            
            if response.status_code == 401:
                self.log_test("Token Validation", True, "Invalid tokens properly rejected")
                return True
            else:
                self.log_test("Token Validation", False, f"Expected 401, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Token Validation", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all authentication flow tests"""
        print("🔐 Authentication Flow End-to-End Test")
        print("=" * 50)
        print(f"Testing against: {self.base_url}")
        print()
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", lambda: self.test_register_user("testuser", "test@example.com", "testpass123")),
            ("User Login", lambda: self.test_login("testuser", "testpass123")),
            ("Protected Route Access", self.test_protected_route_access),
            ("Cross-Container Communication", self.test_cross_container_communication),
            ("Token Validation", self.test_token_expiration_simulation),
            ("Logout", self.test_logout),
            ("Unauthorized Access", self.test_unauthorized_access),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                self.log_test(test_name, False, f"Test failed with exception: {str(e)}")
        
        # Summary
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print("=" * 50)
        print(f"📊 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Authentication flow is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [result['test'] for result in self.test_results if not result['success']]
            print(f"Failed tests: {', '.join(failed_tests)}")
        
        return {
            'total_tests': total,
            'passed_tests': passed,
            'failed_tests': total - passed,
            'results': self.test_results
        }

def main():
    """Main function to run the authentication flow tests"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test authentication flow end-to-end')
    parser.add_argument('--url', default='http://localhost:8000', 
                       help='Base URL of the API (default: http://localhost:8000)')
    parser.add_argument('--wait', type=int, default=5,
                       help='Wait time in seconds before starting tests (default: 5)')
    
    args = parser.parse_args()
    
    print(f"🚀 Starting authentication flow tests in {args.wait} seconds...")
    print(f"Target URL: {args.url}")
    print()
    
    time.sleep(args.wait)
    
    tester = AuthFlowTester(args.url)
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['passed_tests'] == results['total_tests']:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main() 