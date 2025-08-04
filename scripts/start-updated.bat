@echo off
setlocal enabledelayedexpansion

REM SAAS Website Startup Script - Updated Version (Windows)
REM This script starts the complete SAAS application with all new features

echo 🚀 Starting SAAS Website with Enhanced Features...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] docker-compose is not installed. Please install it and try again.
    pause
    exit /b 1
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist logs mkdir logs
if not exist config\nginx\ssl mkdir config\nginx\ssl
if not exist db\migrations mkdir db\migrations

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Please create it manually.
    if exist .env.example (
        copy .env.example .env
        echo [INFO] Created .env from template
    )
)

REM Pull latest images
echo [INFO] Pulling latest Docker images...
docker-compose pull

REM Build and start services
echo [INFO] Building and starting services...
docker-compose up -d --build

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Display service information
echo.
echo [SUCCESS] 🎉 SAAS Website is starting up!
echo.
echo 📱 Application URLs:
echo    Frontend:     http://localhost
echo    Backend API:  http://localhost:8000
echo    API Docs:     http://localhost:8000/docs
echo.
echo 🔧 Management Tools:
echo    Adminer:      http://localhost:8080
echo    Portainer:    http://localhost:9000
echo    Grafana:      http://localhost:3001
echo    Mailhog:      http://localhost:8025
echo.
echo 🧪 Testing:
echo    QA Dashboard: http://localhost/qa-test
echo.
echo 📊 New Features Available:
echo    ✅ Framer Motion Animations
echo    ✅ Sonner Toast Notifications
echo    ✅ Zod Form Validation
echo    ✅ Skeleton Loading States
echo    ✅ Mobile Responsive Design
echo    ✅ Role-Based Access Control
echo    ✅ User Management
echo    ✅ Task Management
echo    ✅ Website Viewer
echo.
echo 👤 Default Users:
echo    SuperUser: preet / password123
echo    Admin:     admin / admin123
echo    User:      user1 / password123
echo    ITRA:      itra1 / password123
echo.

REM Show logs
echo [INFO] Showing service logs (Ctrl+C to exit)...
docker-compose logs -f --tail=50