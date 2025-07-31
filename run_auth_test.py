#!/usr/bin/env python3
"""
Simple Authentication Flow Test Runner
Quick test script to verify authentication functionality
"""

import sys
import os
import subprocess
import time

def run_command(command, description):
    """Run a command and return success status"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            return True
        else:
            print(f"❌ {description} - Failed")
            print(f"   Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} - Exception: {str(e)}")
        return False

def check_service(url, service_name, timeout=30):
    """Check if a service is running"""
    print(f"🔍 Checking {service_name} at {url}...")
    
    import requests
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name} is running")
                return True
        except:
            pass
        time.sleep(2)
    
    print(f"❌ {service_name} is not responding")
    return False

def main():
    print("🔐 Quick Authentication Flow Test")
    print("=" * 40)
    print()
    
    # Check if we're in the right directory
    if not os.path.exists("test_auth_flow.py"):
        print("❌ test_auth_flow.py not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Check if Docker is running
    if not run_command("docker info", "Checking Docker"):
        print("❌ Docker is not running. Please start Docker and try again.")
        sys.exit(1)
    
    # Check if docker-compose is available
    if not run_command("docker-compose --version", "Checking docker-compose"):
        print("❌ docker-compose is not available. Please install it and try again.")
        sys.exit(1)
    
    # Check if Python requests is available
    try:
        import requests
        print("✅ Python requests library is available")
    except ImportError:
        print("📦 Installing Python requests library...")
        if not run_command("pip install requests", "Installing requests"):
            print("❌ Failed to install requests library")
            sys.exit(1)
    
    # Check if environment file exists
    env_file = "config/.env"
    if not os.path.exists(env_file):
        print("📝 Creating environment file...")
        if not run_command("copy config\\env.sample config\\.env", "Creating .env file"):
            print("❌ Failed to create environment file")
            sys.exit(1)
    
    # Start Docker containers
    print("\n🚀 Starting Docker containers...")
    if not run_command("cd config && docker-compose up -d", "Starting containers"):
        print("❌ Failed to start containers")
        sys.exit(1)
    
    # Wait for services
    print("\n⏳ Waiting for services to be ready...")
    time.sleep(10)  # Give containers time to start
    
    # Check backend
    if not check_service("http://localhost:8000/api/health", "Backend API"):
        print("❌ Backend is not responding. Check container logs:")
        run_command("cd config && docker-compose logs backend", "Showing backend logs")
        sys.exit(1)
    
    # Check frontend (optional)
    if check_service("http://localhost:3000", "Frontend", timeout=15):
        print("✅ Frontend is accessible")
    else:
        print("⚠️  Frontend is not accessible (continuing with API tests only)")
    
    # Run authentication tests
    print("\n🧪 Running authentication flow tests...")
    if run_command("python test_auth_flow.py --url http://localhost:8000 --wait 2", "Running auth tests"):
        print("\n🎉 All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Check the output above.")
        sys.exit(1)
    
    # Ask if user wants to stop containers
    print("\n" + "=" * 40)
    response = input("Do you want to stop the Docker containers? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        print("🛑 Stopping containers...")
        run_command("cd config && docker-compose down", "Stopping containers")
        print("✅ Containers stopped")
    else:
        print("ℹ️  Containers are still running. You can stop them manually with:")
        print("   cd config && docker-compose down")

if __name__ == "__main__":
    main() 