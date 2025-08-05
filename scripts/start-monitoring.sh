#!/bin/bash

# Start monitoring stack with OpenTelemetry

echo "🚀 Starting SAAS Application with Monitoring Stack"
echo "================================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables"
else
    echo "❌ .env file not found"
    exit 1
fi

# Start the monitoring stack
echo "🔧 Starting monitoring services..."
docker-compose -f docker-compose.monitoring.yml down --remove-orphans
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.monitoring.yml ps

echo ""
echo "✅ Monitoring stack started successfully!"
echo ""
echo "📊 Access Points:"
echo "  Application:  http://localhost:3000"
echo "  Backend API:  http://localhost:8000"
echo "  Prometheus:   http://localhost:9090"
echo "  Grafana:      http://localhost:3001 (admin/admin123)"
echo "  Metrics:      http://localhost:8000/metrics"
echo ""
echo "📈 Grafana Dashboard:"
echo "  - Login with admin/admin123"
echo "  - Navigate to Dashboards > SAAS Application Metrics"
echo ""
echo "📋 View logs:"
echo "  docker-compose -f docker-compose.monitoring.yml logs -f"