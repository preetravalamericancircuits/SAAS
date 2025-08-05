#!/bin/bash

# Staging Environment Deployment Script

set -e

echo "🚀 Starting SAAS Staging Deployment..."

# Load staging environment variables
if [ -f .env.staging ]; then
    export $(cat .env.staging | grep -v '^#' | xargs)
    echo "✅ Loaded staging environment variables"
else
    echo "❌ .env.staging file not found"
    exit 1
fi

# Create staging secrets volume
echo "🔐 Setting up staging secrets..."
docker volume create staging_secrets 2>/dev/null || true

# Build and start staging services
echo "🏗️ Building and starting staging services..."
docker-compose -f docker-compose.staging.yml down --remove-orphans
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.staging.yml ps

# Initialize database
echo "🗄️ Initializing staging database..."
docker-compose -f docker-compose.staging.yml exec -T backend-staging python init_db.py

# Run database migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.staging.yml exec -T postgres-staging psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/init.sql || true

# Test API endpoints
echo "🧪 Testing staging API endpoints..."
sleep 10

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint failed"
fi

# Test API info endpoint
if curl -f http://localhost:8080/api/ > /dev/null 2>&1; then
    echo "✅ API info endpoint is working"
else
    echo "❌ API info endpoint failed"
fi

echo "🎉 Staging deployment completed!"
echo ""
echo "📋 Staging Environment Info:"
echo "  Frontend: http://localhost:3001"
echo "  Backend API: http://localhost:8001"
echo "  Nginx Proxy: http://localhost:8080"
echo "  Database: localhost:5433"
echo "  Redis: localhost:6380"
echo ""
echo "🔗 API Endpoints:"
echo "  Health: http://localhost:8080/health"
echo "  API Info: http://localhost:8080/api/"
echo "  Auth: http://localhost:8080/api/v1/auth/"
echo "  Users: http://localhost:8080/api/v1/users/"
echo ""
echo "📊 View logs:"
echo "  docker-compose -f docker-compose.staging.yml logs -f"