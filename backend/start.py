#!/usr/bin/env python3
"""
Startup script for the FastAPI backend.
This script initializes the database and starts the server.
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_database_connection():
    """Check if the database is accessible"""
    print("🔍 Checking database connection...")
    try:
        from database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting FastAPI Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ Error: main.py not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Check database connection
    if not check_database_connection():
        print("❌ Cannot connect to database. Please ensure PostgreSQL is running.")
        print("💡 If using Docker, run: docker-compose up -d postgres")
        sys.exit(1)
    
    # Initialize database
    if not run_command("python init_db.py", "Initializing database"):
        print("❌ Database initialization failed")
        sys.exit(1)
    
    print("\n🎉 Database initialized successfully!")
    print("\n📋 Default admin credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("   Email: admin@example.com")
    
    print("\n🌐 Starting FastAPI server...")
    print("📖 API Documentation will be available at:")
    print("   - Swagger UI: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print("\n" + "=" * 50)
    
    # Start the server
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 