#!/bin/bash

# SAAS Website Startup Script
# This script sets up and starts the complete SAAS application

set -e

echo "🚀 Starting SAAS Website Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env() {
    print_status "Checking environment configuration..."
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.sample ]; then
            cp env.sample .env
            print_success "Created .env file from template"
            print_warning "Please review and update .env file if needed"
        else
            print_error "env.sample file not found. Please create .env file manually."
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    print_success "Stopped existing containers"
}

# Start the application
start_application() {
    print_status "Starting SAAS application..."
    
    # Build and start containers
    docker-compose up -d --build
    
    print_success "Application containers started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U aci_user -d aci_db > /dev/null 2>&1; then
            print_success "Database is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
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
        if curl -f http://localhost > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend failed to start within 60 seconds"
        exit 1
    fi
}

# Seed initial users
seed_users() {
    print_status "Seeding initial users..."
    
    # Wait a bit more for backend to be fully ready
    sleep 5
    
    if docker-compose exec -T backend python seed_users.py; then
        print_success "Users seeded successfully"
    else
        print_warning "User seeding failed or users already exist"
    fi
}

# Show status
show_status() {
    print_status "Checking service status..."
    docker-compose ps
    
    echo ""
    print_success "🎉 SAAS Website is now running!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend:     http://localhost"
    echo "   Backend API:  http://localhost:8000"
    echo "   API Docs:     http://localhost:8000/docs"
    echo ""
    echo "🔑 Default Login Credentials:"
    echo "   SuperUser:    preet / password123"
    echo "   Operator:     operator1 / password123"
    echo "   User:         user1 / password123"
    echo "   ITRA:         itra1 / password123"
    echo "   Admin:        admin / admin123"
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop app:     docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Shell access: docker-compose exec backend bash"
    echo ""
}

# Main execution
main() {
    echo "=========================================="
    echo "    SAAS Website Startup Script"
    echo "=========================================="
    echo ""
    
    check_docker
    check_env
    stop_containers
    start_application
    wait_for_services
    seed_users
    show_status
    
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status "Stopping SAAS application..."
        docker-compose down
        print_success "Application stopped"
        ;;
    "restart")
        print_status "Restarting SAAS application..."
        docker-compose restart
        print_success "Application restarted"
        ;;
    "logs")
        print_status "Showing application logs..."
        docker-compose logs -f
        ;;
    "status")
        print_status "Showing service status..."
        docker-compose ps
        ;;
    "seed")
        print_status "Seeding users only..."
        seed_users
        ;;
    "help"|"-h"|"--help")
        echo "SAAS Website Startup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Start the complete application"
        echo "  stop       Stop the application"
        echo "  restart    Restart the application"
        echo "  logs       Show application logs"
        echo "  status     Show service status"
        echo "  seed       Seed users only"
        echo "  help       Show this help message"
        echo ""
        ;;
    *)
        main
        ;;
esac 