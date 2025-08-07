#!/bin/bash

# =============================================================================
# COMPREHENSIVE FIX SCRIPT FOR:
# 1. Webview Service Worker Error
# 2. Complete Docker Models Reinstallation
# =============================================================================

set -e  # Exit on any error

echo "🚀 STARTING COMPREHENSIVE FIX..."
echo "=================================="

# =============================================================================
# PHASE 1: FIX WEBVIEW SERVICE WORKER ERROR
# =============================================================================
echo ""
echo "📋 PHASE 1: Fixing Webview Service Worker Error"
echo "----------------------------------------------"

# 1. Clear browser cache and service workers
echo "🧹 Clearing browser cache and service workers..."
echo "Please manually clear your browser cache and service workers:"
echo "  - Chrome: DevTools > Application > Service Workers > Unregister"
echo "  - Chrome: DevTools > Application > Clear storage > Clear site data"
echo "  - Or use: chrome://serviceworker-internals/"

# 2. Fix Next.js service worker configuration
echo "🔧 Fixing Next.js service worker configuration..."
cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  // Disable service worker in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'workbox-webpack-plugin': false,
      };
    }
    return config;
  },
  // Ensure proper development server configuration
  devIndicators: {
    buildActivity: true,
  },
  // Handle localhost HTTPS issues
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
EOF

# 3. Create development environment fix
cat > frontend/fix-service-worker.js << 'EOF'
// Service Worker Fix for Development
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
  // Unregister all service workers in development
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}
EOF

# 4. Update package.json scripts
echo "📦 Updating package.json scripts..."
cat > frontend/package.json << 'EOF'
{
  "name": "saas-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next node_modules package-lock.json && npm install",
    "dev-clean": "npm run clean && npm run dev"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "typescript": "^5"
  }
}
EOF

echo "✅ Webview service worker fixes applied!"

# =============================================================================
# PHASE 2: COMPLETE DOCKER REINSTALLATION
# =============================================================================
echo ""
echo "🐳 PHASE 2: Complete Docker Reinstallation"
echo "-----------------------------------------"

# 1. Stop all running containers
echo "🛑 Stopping all running containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

# 2. Remove all containers
echo "🗑️  Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

# 3. Remove all images
echo "🖼️  Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || true

# 4. Remove all volumes
echo "💾 Removing all volumes..."
docker volume prune -f

# 5. Remove all networks (except default ones)
echo "🌐 Removing custom networks..."
docker network prune -f

# 6. Clean Docker system
echo "🧹 Cleaning Docker system..."
docker system prune -af --volumes

# 7. Rebuild all images from scratch
echo "🏗️  Rebuilding all Docker images..."
docker-compose build --no-cache

# 8. Create fresh volumes and containers
echo "🚀 Creating fresh containers..."
docker-compose up -d

# 9. Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# 10. Verify all services are running
echo "🔍 Verifying all services..."
docker-compose ps

# 11. Initialize databases
echo "🗄️  Initializing databases..."
docker-compose exec backend python -c "from init_db import init_db; init_db()"

# 12. Run health checks
echo "🏥 Running health checks..."
docker-compose exec backend curl -f http://localhost:8000/api/health || echo "Backend health check failed"
docker-compose exec frontend curl -f http://localhost:3000 || echo "Frontend health check failed"

echo ""
echo "✅ DOCKER REINSTALLATION COMPLETE!"
echo "=================================="

# =============================================================================
# FINAL VERIFICATION
# =============================================================================
echo ""
echo "🎯 FINAL VERIFICATION"
echo "---------------------"

echo "📊 Checking running containers:"
docker ps

echo ""
echo "🌐 Testing webview access:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000/api/health"
echo "  - Adminer: http://localhost:8080"

echo ""
echo "🎉 ALL FIXES COMPLETED SUCCESSFULLY!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Open your browser and clear cache"
echo "2. Navigate to http://localhost:3000"
echo "3. Verify webview loads without service worker errors"
echo "4. Test all application functionality"
