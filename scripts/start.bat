@echo off
setlocal enabledelayedexpansion

REM SAAS Website Docker Startup Script for Windows
REM This script provides easy commands to start, stop, and manage the Docker environment

set "SCRIPT_NAME=%~n0"

REM Function to print colored output (Windows compatible)
:print_status
echo [INFO] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:print_header
echo ================================
echo   SAAS Website Docker Setup
echo ================================
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop and try again."
    exit /b 1
)
goto :eof

REM Function to check if .env file exists
:check_env
if not exist ".env" (
    call :print_warning ".env file not found. Creating from template..."
    if exist "env.sample" (
        copy "env.sample" ".env" >nul
        call :print_status ".env file created from env.sample"
        call :print_warning "Please review and update the .env file with your configuration."
    ) else (
        call :print_error "env.sample file not found. Please create a .env file manually."
        exit /b 1
    )
)
goto :eof

REM Function to start production environment
:start_production
call :print_header
call :print_status "Starting production environment..."
call :check_docker
if errorlevel 1 exit /b 1
call :check_env
if errorlevel 1 exit /b 1

call :print_status "Building and starting services..."
docker-compose up -d --build
if errorlevel 1 (
    call :print_error "Failed to start production environment."
    exit /b 1
)

call :print_status "Waiting for services to be ready..."
timeout /t 10 /nobreak >nul

call :print_status "Checking service status..."
docker-compose ps

call :print_status "Production environment started successfully!"
echo.
call :print_status "Access your application:"
echo   Frontend: http://localhost
echo   Backend API: http://localhost:8000
echo   API Documentation: http://localhost:8000/docs
echo   Health Check: http://localhost/health
echo.
call :print_status "Default credentials:"
echo   Username: admin
echo   Password: admin123
goto :eof

REM Function to start development environment
:start_development
call :print_header
call :print_status "Starting development environment..."
call :check_docker
if errorlevel 1 exit /b 1
call :check_env
if errorlevel 1 exit /b 1

call :print_status "Building and starting development services..."
docker-compose -f docker-compose.dev.yml up -d --build
if errorlevel 1 (
    call :print_error "Failed to start development environment."
    exit /b 1
)

call :print_status "Waiting for services to be ready..."
timeout /t 15 /nobreak >nul

call :print_status "Checking development service status..."
docker-compose -f docker-compose.dev.yml ps

call :print_status "Development environment started successfully!"
echo.
call :print_status "Access your application:"
echo   Frontend: http://localhost (with hot reload)
echo   Backend API: http://localhost:8000 (with hot reload)
echo   API Documentation: http://localhost:8000/docs
echo.
call :print_status "Development features enabled:"
echo   ✅ Hot reload for frontend and backend
echo   ✅ Debug mode enabled
echo   ✅ Volume mounts for live code editing
goto :eof

REM Function to stop environment
:stop_environment
call :print_header
call :print_status "Stopping environment..."

if exist "docker-compose.dev.yml" (
    docker-compose -f docker-compose.dev.yml down
)

docker-compose down

call :print_status "Environment stopped successfully!"
goto :eof

REM Function to show logs
:show_logs
call :print_header
call :print_status "Showing logs..."

if "%1"=="dev" (
    docker-compose -f docker-compose.dev.yml logs -f
) else (
    docker-compose logs -f
)
goto :eof

REM Function to show status
:show_status
call :print_header
call :print_status "Service status:"

if "%1"=="dev" (
    docker-compose -f docker-compose.dev.yml ps
) else (
    docker-compose ps
)
goto :eof

REM Function to restart services
:restart_services
call :print_header
call :print_status "Restarting services..."

if "%1"=="dev" (
    docker-compose -f docker-compose.dev.yml restart
) else (
    docker-compose restart
)

call :print_status "Services restarted successfully!"
goto :eof

REM Function to rebuild services
:rebuild_services
call :print_header
call :print_status "Rebuilding services..."

if "%1"=="dev" (
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
) else (
    docker-compose build --no-cache
    docker-compose up -d
)

call :print_status "Services rebuilt and started successfully!"
goto :eof

REM Function to clean up
:cleanup
call :print_header
call :print_status "Cleaning up Docker resources..."

call :print_warning "This will remove all containers, networks, and volumes!"
set /p "confirm=Are you sure? (y/N): "

if /i "!confirm!"=="y" (
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    call :print_status "Cleanup completed successfully!"
) else (
    call :print_status "Cleanup cancelled."
)
goto :eof

REM Function to show help
:show_help
call :print_header
echo Usage: %SCRIPT_NAME% [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start           Start production environment
echo   start:dev       Start development environment
echo   stop            Stop all environments
echo   restart         Restart production services
echo   restart:dev     Restart development services
echo   rebuild         Rebuild production services
echo   rebuild:dev     Rebuild development services
echo   logs            Show production logs
echo   logs:dev        Show development logs
echo   status          Show production service status
echo   status:dev      Show development service status
echo   cleanup         Clean up all Docker resources
echo   help            Show this help message
echo.
echo Examples:
echo   %SCRIPT_NAME% start        # Start production environment
echo   %SCRIPT_NAME% start:dev    # Start development environment
echo   %SCRIPT_NAME% logs         # Show production logs
echo   %SCRIPT_NAME% cleanup      # Clean up all resources
goto :eof

REM Main script logic
if "%1"=="" goto :show_help
if "%1"=="help" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

if "%1"=="start" goto :start_production
if "%1"=="start:dev" goto :start_development
if "%1"=="stop" goto :stop_environment
if "%1"=="restart" goto :restart_services
if "%1"=="restart:dev" goto :restart_services dev
if "%1"=="rebuild" goto :rebuild_services
if "%1"=="rebuild:dev" goto :rebuild_services dev
if "%1"=="logs" goto :show_logs
if "%1"=="logs:dev" goto :show_logs dev
if "%1"=="status" goto :show_status
if "%1"=="status:dev" goto :show_status dev
if "%1"=="cleanup" goto :cleanup

call :print_error "Unknown command: %1"
echo.
goto :show_help 