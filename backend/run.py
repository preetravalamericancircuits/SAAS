#!/usr/bin/env python3
"""
Simple run script that bypasses dependency issues
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Try to import required modules
    import uvicorn
    from main import app
    
    print("🚀 Starting SAAS Backend (Simple Mode)...")
    print("📍 Database: SQLite (saas_app.db)")
    print("🌐 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print()
    
    # Start the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
    
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("💡 Try: pip install fastapi uvicorn sqlalchemy python-jose passlib python-multipart")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)