@echo off
REM Staging Environment Deployment Script for Windows

echo 🚀 Starting SAAS Staging Deployment...

REM Check if .env.staging exists
if not exist .env.staging (
    echo ❌ .env.staging file not found
    exit /b 1
)

echo ✅ Found staging environment file

REM Create staging secrets volume
echo 🔐 Setting up staging secrets...
docker volume create staging_secrets 2>nul

REM Build and start staging services
echo 🏗️ Building and starting staging services...
docker-compose -f docker-compose.staging.yml down --remove-orphans
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose -f docker-compose.staging.yml ps

REM Initialize database
echo 🗄️ Initializing staging database...
docker-compose -f docker-compose.staging.yml exec -T backend-staging python init_db.py

REM Test endpoints
echo 🧪 Testing staging endpoints...
timeout /t 10 /nobreak >nul

echo 🎉 Staging deployment completed!
echo.
echo 📋 Staging Environment Info:
echo   Frontend: http://localhost:3001
echo   Backend API: http://localhost:8001
echo   Nginx Proxy: http://localhost:8080
echo   Database: localhost:5433
echo   Redis: localhost:6380
echo.
echo 🔗 API Endpoints:
echo   Health: http://localhost:8080/health
echo   API Info: http://localhost:8080/api/
echo   Auth: http://localhost:8080/api/v1/auth/
echo   Users: http://localhost:8080/api/v1/users/
echo.
echo 📊 View logs:
echo   docker-compose -f docker-compose.staging.yml logs -f

pause