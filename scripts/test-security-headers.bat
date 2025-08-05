@echo off
REM Security Headers Testing Script for Windows

echo 🔒 Testing Security Headers...
echo ================================

set BASE_URL=http://localhost:8080

echo.
echo Testing: %BASE_URL%/
echo ----------------------------------------
curl -s -I "%BASE_URL%/" | findstr /i "x-frame-options x-content-type-options x-xss-protection content-security-policy"

echo.
echo Testing: %BASE_URL%/api/
echo ----------------------------------------
curl -s -I "%BASE_URL%/api/" | findstr /i "x-frame-options x-content-type-options x-xss-protection content-security-policy"

echo.
echo Testing: %BASE_URL%/api/v1/auth/login
echo ----------------------------------------
curl -s -I "%BASE_URL%/api/v1/auth/login" | findstr /i "x-frame-options x-content-type-options cache-control"

echo.
echo Testing: %BASE_URL%/health
echo ----------------------------------------
curl -s -I "%BASE_URL%/health" | findstr /i "x-frame-options x-content-type-options x-xss-protection"

echo.
echo 🔒 Security Headers Test Complete
echo ================================
pause