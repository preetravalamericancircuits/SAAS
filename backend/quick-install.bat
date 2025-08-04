@echo off
echo 🔧 Quick Install - Essential Packages Only
echo.

pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart pydantic-settings python-dotenv

echo.
echo ✅ Installation complete!
echo 🚀 Now run: python run.py
pause