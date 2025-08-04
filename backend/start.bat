@echo off
echo 🚀 Starting SAAS Backend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required packages are installed
python -c "import fastapi, sqlalchemy, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing required packages...
    pip install -r requirements-minimal.txt
)

REM Start the application
python run.py

pause