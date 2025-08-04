#!/bin/bash

# SAAS Website Startup Script - Updated Version
# This script starts the complete SAAS application with all new features

set -e

echo "🚀 Starting SAAS Website with Enhanced Features..."

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
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p config/nginx/ssl
mkdir -p db/migrations

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually"
fi

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U aci_user -d aci_db > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is not ready yet"
fi

# Check Backend
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    print_success "Backend API is ready"
else
    print_warning "Backend API is not ready yet"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend is not ready yet"
fi

# Display service URLs
echo ""
print_success "🎉 SAAS Website is starting up!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend:     http://localhost"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo ""
echo "🔧 Management Tools:"
echo "   Adminer:      http://localhost:8080"
echo "   Portainer:    http://localhost:9000"
echo "   Grafana:      http://localhost:3001"
echo "   Mailhog:      http://localhost:8025"
echo ""
echo "🧪 Testing:"
echo "   QA Dashboard: http://localhost/qa-test"
echo ""
echo "📊 New Features Available:"
echo "   ✅ Framer Motion Animations"
echo "   ✅ Sonner Toast Notifications"
echo "   ✅ Zod Form Validation"
echo "   ✅ Skeleton Loading States"
echo "   ✅ Mobile Responsive Design"
echo "   ✅ Role-Based Access Control"
echo "   ✅ User Management"
echo "   ✅ Task Management"
echo "   ✅ Website Viewer"
echo ""
echo "👤 Default Users:"
echo "   SuperUser: preet / password123"
echo "   Admin:     admin / admin123"
echo "   User:      user1 / password123"
echo "   ITRA:      itra1 / password123"
echo ""

# Show logs
print_status "Showing service logs (Ctrl+C to exit)..."
docker-compose logs -f --tail=50