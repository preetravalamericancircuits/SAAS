@echo off
REM Health Check Script for All Services

echo 🏥 SAAS Application Health Check
echo ===============================

set BASE_URL=http://localhost

echo.
echo Checking Backend API...
curl -f -s --max-time 10 "%BASE_URL%:8000/health" >nul
if %errorlevel%==0 (
    echo ✅ Backend API: HEALTHY
) else (
    echo ❌ Backend API: UNHEALTHY
)

echo.
echo Checking Frontend...
curl -f -s --max-time 10 "%BASE_URL%:3000/api/health" >nul
if %errorlevel%==0 (
    echo ✅ Frontend: HEALTHY
) else (
    echo ❌ Frontend: UNHEALTHY
)

echo.
echo Checking Prometheus...
curl -f -s --max-time 10 "%BASE_URL%:9090/-/healthy" >nul
if %errorlevel%==0 (
    echo ✅ Prometheus: HEALTHY
) else (
    echo ❌ Prometheus: UNHEALTHY
)

echo.
echo Checking Grafana...
curl -f -s --max-time 10 "%BASE_URL%:3001/api/health" >nul
if %errorlevel%==0 (
    echo ✅ Grafana: HEALTHY
) else (
    echo ❌ Grafana: UNHEALTHY
)

echo.
echo 🐳 Docker Container Health Status:
echo ==================================
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🏥 Health Check Complete
pause