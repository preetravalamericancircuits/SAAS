#!/usr/bin/env python3
"""
Startup script for SAAS backend
Initializes database and starts the FastAPI server
"""

import os
import sys
from pathlib import Path

def check_database():
    """Check if database exists, create if not"""
    db_file = Path("saas_app.db")
    if not db_file.exists():
        print("🔧 Database not found, initializing...")
        try:
            from init_db import main as init_database
            init_database()
        except Exception as e:
            print(f"❌ Failed to initialize database: {e}")
            sys.exit(1)
    else:
        print("✅ Database found")

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting SAAS Backend Server...")
    try:
        import uvicorn
        from main import app
        
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🚀 SAAS Backend Startup\n")
    
    # Check and initialize database
    check_database()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()