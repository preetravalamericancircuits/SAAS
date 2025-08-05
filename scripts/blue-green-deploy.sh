#!/bin/bash
# Blue-Green Deployment Script with Rollback Support
# Usage: ./blue-green-deploy.sh [blue|green] [rollback]

set -e

# Configuration
BACKEND_IMAGE="saas-backend"
NGINX_CONFIG="/etc/nginx/sites-available/saas"
NGINX_RELOAD_CMD="nginx -s reload"
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_INTERVAL=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Health check function
health_check() {
    local service=$1
    local port=$2
    local endpoint="http://localhost:${port}/health"
    
    log "Checking health of $service on port $port..."
    
    for i in $(seq 1 $HEALTH_CHECK_TIMEOUT); do
        if curl -f -s "$endpoint" > /dev/null; then
            log "$service is healthy"
            return 0
        fi
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    error "$service failed health check"
    return 1
}

# Switch traffic function
switch_traffic() {
    local target=$1
    
    log "Switching traffic to $target deployment..."
    
    # Update nginx configuration
    sudo sed -i "s/backend_active backend-.*/backend_active backend-$target;/" "$NGINX_CONFIG"
    
    # Reload nginx
    sudo $NGINX_RELOAD_CMD
    
    log "Traffic switched to $target deployment"
}

# Deploy function
deploy() {
    local target=$1
    
    log "Starting blue-green deployment to $target..."
    
    # Build new image
    log "Building new Docker image..."
    docker build -t "${BACKEND_IMAGE}:${target}" -f backend/Dockerfile .
    
    # Stop existing container
    log "Stopping existing $target container..."
    docker stop "backend-${target}" || true
    docker rm "backend-${target}" || true
    
    # Start new container
    log "Starting new $target container..."
    docker run -d \
        --name "backend-${target}" \
        --network saas-network \
        -p "$([ $target = 'blue' ] && echo '8001' || echo '8002')":8000 \
        "${BACKEND_IMAGE}:${target}"
    
    # Health check
    local port=$([ $target = 'blue' ] && echo '8001' || echo '8002')
    if health_check "backend-${target}" "$port"; then
        switch_traffic "$target"
        log "Deployment to $target completed successfully"
    else
        error "Deployment to $target failed - rolling back"
        docker stop "backend-${target}" || true
        exit 1
    fi
}

# Rollback function
rollback() {
    local current=$(grep -o 'backend-[blue|green]' "$NGINX_CONFIG" | head -1 | cut -d'-' -f2)
    local rollback=$([ "$current" = "blue" ] && echo "green" || echo "blue")
    
    log "Rolling back from $current to $rollback..."
    
    switch_traffic "$rollback"
    
    # Stop failed deployment
    docker stop "backend-${current}" || true
    
    log "Rollback completed successfully"
}

# Main execution
case "$1" in
    "blue")
        deploy "blue"
        ;;
    "green")
        deploy "green"
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [blue|green|rollback]"
        exit 1
        ;;
esac
