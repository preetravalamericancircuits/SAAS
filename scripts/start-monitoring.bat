@echo off
REM Start monitoring stack with OpenTelemetry

echo 🚀 Starting SAAS Application with Monitoring Stack
echo =================================================

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found
    exit /b 1
)

echo ✅ Found environment file

REM Start the monitoring stack
echo 🔧 Starting monitoring services...
docker-compose -f docker-compose.monitoring.yml down --remove-orphans
docker-compose -f docker-compose.monitoring.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose -f docker-compose.monitoring.yml ps

echo.
echo ✅ Monitoring stack started successfully!
echo.
echo 📊 Access Points:
echo   Application:  http://localhost:3000
echo   Backend API:  http://localhost:8000
echo   Prometheus:   http://localhost:9090
echo   Grafana:      http://localhost:3001 (admin/admin123)
echo   Metrics:      http://localhost:8000/metrics
echo.
echo 📈 Grafana Dashboard:
echo   - Login with admin/admin123
echo   - Navigate to Dashboards ^> SAAS Application Metrics
echo.
echo 📋 View logs:
echo   docker-compose -f docker-compose.monitoring.yml logs -f

pause