@echo off
setlocal enabledelayedexpansion

REM Authentication Flow Test Script for Docker Environment (Windows)
REM This script tests the complete authentication flow across Docker containers

REM Configuration
set "PROJECT_DIR=%~dp0"
set "CONFIG_DIR=%PROJECT_DIR%config"
set "DOCKER_COMPOSE_FILE=%CONFIG_DIR%\docker-compose.yml"
set "ENV_FILE=%CONFIG_DIR%\.env"
set "TEST_SCRIPT=%PROJECT_DIR%test_auth_flow.py"

REM Colors for output (Windows doesn't support ANSI colors in batch, but we can use echo)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Function to print colored output
:print_status
echo %INFO% %~1
goto :eof

:print_success
echo %SUCCESS% %~1
goto :eof

:print_warning
echo %WARNING% %~1
goto :eof

:print_error
echo %ERROR% %~1
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker is not running. Please start Docker and try again."
    exit /b 1
)
call :print_success "Docker is running"
goto :eof

REM Function to check if docker-compose is available
:check_docker_compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "docker-compose is not installed. Please install it and try again."
    exit /b 1
)
call :print_success "docker-compose is available"
goto :eof

REM Function to setup environment file
:setup_env
if not exist "%ENV_FILE%" (
    call :print_status "Creating environment file from sample..."
    copy "%CONFIG_DIR%\env.sample" "%ENV_FILE%" >nul
    call :print_success "Environment file created"
) else (
    call :print_status "Environment file already exists"
)
goto :eof

REM Function to start Docker containers
:start_containers
call :print_status "Starting Docker containers..."
cd /d "%CONFIG_DIR%"

REM Stop any existing containers
docker-compose down --remove-orphans

REM Start containers
docker-compose up -d

call :print_success "Docker containers started"
goto :eof

REM Function to wait for services to be ready
:wait_for_services
call :print_status "Waiting for services to be ready..."

REM Wait for database
call :print_status "Waiting for PostgreSQL..."
set timeout=60
:wait_db_loop
docker-compose exec -T postgres pg_isready -U aci_user -d aci_db >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "PostgreSQL is ready"
    goto :wait_backend
)
timeout /t 2 /nobreak >nul
set /a timeout-=2
if %timeout% leq 0 (
    call :print_error "PostgreSQL failed to start within 60 seconds"
    exit /b 1
)
goto :wait_db_loop

:wait_backend
REM Wait for backend
call :print_status "Waiting for backend API..."
set timeout=60
:wait_backend_loop
curl -f http://localhost:8000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Backend API is ready"
    goto :wait_frontend
)
timeout /t 2 /nobreak >nul
set /a timeout-=2
if %timeout% leq 0 (
    call :print_error "Backend API failed to start within 60 seconds"
    exit /b 1
)
goto :wait_backend_loop

:wait_frontend
REM Wait for frontend
call :print_status "Waiting for frontend..."
set timeout=60
:wait_frontend_loop
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Frontend is ready"
    goto :eof
)
timeout /t 2 /nobreak >nul
set /a timeout-=2
if %timeout% leq 0 (
    call :print_warning "Frontend failed to start within 60 seconds (continuing anyway)"
    goto :eof
)
goto :wait_frontend_loop

REM Function to run authentication tests
:run_auth_tests
call :print_status "Running authentication flow tests..."

REM Check if test script exists
if not exist "%TEST_SCRIPT%" (
    call :print_error "Test script not found: %TEST_SCRIPT%"
    exit /b 1
)

REM Install required Python packages if needed
python -c "import requests" 2>nul
if %errorlevel% neq 0 (
    call :print_status "Installing required Python packages..."
    pip install requests
)

REM Run tests
cd /d "%PROJECT_DIR%"
python "%TEST_SCRIPT%" --url "http://localhost:8000" --wait 2

if %errorlevel% equ 0 (
    call :print_success "All authentication tests passed!"
) else (
    call :print_error "Some authentication tests failed"
    exit /b 1
)
goto :eof

REM Function to test frontend authentication
:test_frontend_auth
call :print_status "Testing frontend authentication flow..."

REM Test if frontend is accessible
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Frontend is accessible"
    
    REM Test login page
    curl -s http://localhost:3000/login | findstr /i "login" >nul
    if %errorlevel% equ 0 (
        call :print_success "Login page is accessible"
    ) else (
        call :print_warning "Login page might not be working correctly"
    )
    
    REM Test dashboard (should redirect to login if not authenticated)
    curl -s http://localhost:3000/dashboard | findstr /i "login redirect" >nul
    if %errorlevel% equ 0 (
        call :print_success "Dashboard properly redirects unauthenticated users"
    ) else (
        call :print_warning "Dashboard might not be properly protected"
    )
) else (
    call :print_warning "Frontend is not accessible (tests will continue with API only)"
)
goto :eof

REM Function to show container logs
:show_logs
call :print_status "Container logs:"
cd /d "%CONFIG_DIR%"
docker-compose logs --tail=20
goto :eof

REM Function to cleanup
:cleanup
call :print_status "Cleaning up..."
cd /d "%CONFIG_DIR%"
docker-compose down --remove-orphans
call :print_success "Cleanup completed"
goto :eof

REM Function to show help
:show_help
echo Authentication Flow Test Script
echo.
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   --start-only     Only start containers, don't run tests
echo   --test-only      Only run tests, don't start containers
echo   --logs           Show container logs after tests
echo   --cleanup        Stop and remove containers after tests
echo   --help           Show this help message
echo.
echo Examples:
echo   %~nx0                    # Full test cycle
echo   %~nx0 --start-only       # Just start containers
echo   %~nx0 --test-only        # Just run tests (assumes containers are running)
echo   %~nx0 --cleanup          # Run tests and cleanup
goto :eof

REM Parse command line arguments
set START_ONLY=false
set TEST_ONLY=false
set SHOW_LOGS=false
set CLEANUP_AFTER=false

:parse_args
if "%~1"=="" goto :main
if "%~1"=="--start-only" set START_ONLY=true
if "%~1"=="--test-only" set TEST_ONLY=true
if "%~1"=="--logs" set SHOW_LOGS=true
if "%~1"=="--cleanup" set CLEANUP_AFTER=true
if "%~1"=="--help" (
    call :show_help
    exit /b 0
)
shift
goto :parse_args

REM Main execution
:main
echo 🔐 Authentication Flow End-to-End Test
echo ======================================
echo.

REM Check prerequisites
call :check_docker
if %errorlevel% neq 0 exit /b 1

call :check_docker_compose
if %errorlevel% neq 0 exit /b 1

REM Setup environment
call :setup_env

REM Start containers if not test-only mode
if "%TEST_ONLY%"=="false" (
    call :start_containers
    if %errorlevel% neq 0 exit /b 1
    
    call :wait_for_services
    if %errorlevel% neq 0 exit /b 1
)

REM Run tests if not start-only mode
if "%START_ONLY%"=="false" (
    call :run_auth_tests
    if %errorlevel% neq 0 exit /b 1
    
    call :test_frontend_auth
)

REM Show logs if requested
if "%SHOW_LOGS%"=="true" (
    call :show_logs
)

REM Cleanup if requested
if "%CLEANUP_AFTER%"=="true" (
    call :cleanup
)

call :print_success "Authentication flow test completed!"
exit /b 0 