#!/bin/bash

# Health Check Script for All Services

echo "🏥 SAAS Application Health Check"
echo "==============================="

BASE_URL="http://localhost"

# Service endpoints
declare -A SERVICES=(
    ["Backend API"]="$BASE_URL:8000/health"
    ["Frontend"]="$BASE_URL:3000/api/health"
    ["Prometheus"]="$BASE_URL:9090/-/healthy"
    ["Grafana"]="$BASE_URL:3001/api/health"
    ["Node Exporter"]="$BASE_URL:9100/metrics"
)

# Check each service
for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"
    echo ""
    echo "Checking $service..."
    echo "URL: $url"
    
    if curl -f -s --max-time 10 "$url" > /dev/null; then
        echo "✅ $service: HEALTHY"
    else
        echo "❌ $service: UNHEALTHY"
    fi
done

echo ""
echo "🐳 Docker Container Health Status:"
echo "=================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🏥 Health Check Complete"