#!/bin/bash

# Authentication Flow Test Script for Docker Environment
# This script tests the complete authentication flow across Docker containers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$PROJECT_DIR/config"
DOCKER_COMPOSE_FILE="$CONFIG_DIR/docker-compose.yml"
ENV_FILE="$CONFIG_DIR/.env"
TEST_SCRIPT="$PROJECT_DIR/test_auth_flow.py"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "docker-compose is not installed. Please install it and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to setup environment file
setup_env() {
    if [ ! -f "$ENV_FILE" ]; then
        print_status "Creating environment file from sample..."
        cp "$CONFIG_DIR/env.sample" "$ENV_FILE"
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
}

# Function to start Docker containers
start_containers() {
    print_status "Starting Docker containers..."
    cd "$CONFIG_DIR"
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Start containers
    docker-compose up -d
    
    print_success "Docker containers started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U aci_user -d aci_db > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for backend
    print_status "Waiting for backend API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
            print_success "Backend API is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Frontend failed to start within 60 seconds (continuing anyway)"
    fi
}

# Function to run authentication tests
run_auth_tests() {
    print_status "Running authentication flow tests..."
    
    # Check if test script exists
    if [ ! -f "$TEST_SCRIPT" ]; then
        print_error "Test script not found: $TEST_SCRIPT"
        exit 1
    fi
    
    # Install required Python packages if needed
    if ! python3 -c "import requests" 2>/dev/null; then
        print_status "Installing required Python packages..."
        pip3 install requests
    fi
    
    # Run tests
    cd "$PROJECT_DIR"
    python3 "$TEST_SCRIPT" --url "http://localhost:8000" --wait 2
    
    if [ $? -eq 0 ]; then
        print_success "All authentication tests passed!"
    else
        print_error "Some authentication tests failed"
        return 1
    fi
}

# Function to test frontend authentication
test_frontend_auth() {
    print_status "Testing frontend authentication flow..."
    
    # Test if frontend is accessible
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        
        # Test login page
        if curl -s http://localhost:3000/login | grep -q "login"; then
            print_success "Login page is accessible"
        else
            print_warning "Login page might not be working correctly"
        fi
        
        # Test dashboard (should redirect to login if not authenticated)
        if curl -s http://localhost:3000/dashboard | grep -q "login\|redirect"; then
            print_success "Dashboard properly redirects unauthenticated users"
        else
            print_warning "Dashboard might not be properly protected"
        fi
    else
        print_warning "Frontend is not accessible (tests will continue with API only)"
    fi
}

# Function to show container logs
show_logs() {
    print_status "Container logs:"
    cd "$CONFIG_DIR"
    docker-compose logs --tail=20
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    cd "$CONFIG_DIR"
    docker-compose down --remove-orphans
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Authentication Flow Test Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --start-only     Only start containers, don't run tests"
    echo "  --test-only      Only run tests, don't start containers"
    echo "  --logs           Show container logs after tests"
    echo "  --cleanup        Stop and remove containers after tests"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full test cycle"
    echo "  $0 --start-only       # Just start containers"
    echo "  $0 --test-only        # Just run tests (assumes containers are running)"
    echo "  $0 --cleanup          # Run tests and cleanup"
}

# Parse command line arguments
START_ONLY=false
TEST_ONLY=false
SHOW_LOGS=false
CLEANUP_AFTER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --start-only)
            START_ONLY=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --cleanup)
            CLEANUP_AFTER=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "🔐 Authentication Flow End-to-End Test"
    echo "======================================"
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    setup_env
    
    # Start containers if not test-only mode
    if [ "$TEST_ONLY" = false ]; then
        start_containers
        wait_for_services
    fi
    
    # Run tests if not start-only mode
    if [ "$START_ONLY" = false ]; then
        run_auth_tests
        test_frontend_auth
    fi
    
    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        show_logs
    fi
    
    # Cleanup if requested
    if [ "$CLEANUP_AFTER" = true ]; then
        cleanup
    fi
    
    print_success "Authentication flow test completed!"
}

# Run main function
main "$@" 