@echo off
REM Rate Limiting Test Script for Windows

set BASE_URL=http://localhost:8080
set ENDPOINT=/api/v1/auth/login

echo 🔒 Testing Rate Limits for Authentication Endpoints
echo ==================================================

echo.
echo Testing Login Rate Limiting (3 requests/minute):
echo -----------------------------------------------

for /L %%i in (1,1,5) do (
    echo Request %%i:
    curl -s -w "HTTP_STATUS:%%{http_code}" -X POST "%BASE_URL%%ENDPOINT%" -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -d "{\"username\":\"test\",\"password\":\"test\"}" | findstr "HTTP_STATUS"
    timeout /t 1 /nobreak >nul
)

echo.
echo Testing Register Rate Limiting (5 requests/minute):
echo -------------------------------------------------

set REGISTER_ENDPOINT=/api/v1/auth/register

for /L %%i in (1,1,7) do (
    echo Request %%i:
    curl -s -w "HTTP_STATUS:%%{http_code}" -X POST "%BASE_URL%%REGISTER_ENDPOINT%" -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -d "{\"username\":\"test%%i\",\"email\":\"test%%i@example.com\",\"password\":\"test123\",\"confirm_password\":\"test123\"}" | findstr "HTTP_STATUS"
    timeout /t 1 /nobreak >nul
)

echo.
echo 🔒 Rate Limiting Test Complete
echo ==============================
pause