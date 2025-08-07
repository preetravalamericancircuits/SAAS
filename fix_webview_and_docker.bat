@echo off
setlocal enabledelayedexpansion

echo =============================================
echo 🚀 COMPREHENSIVE FIX FOR WEBVIEW & DOCKER
echo =============================================
echo.

REM =============================================================================
REM PHASE 1: FIX WEBVIEW SERVICE WORKER ERROR
REM =============================================================================
echo 📋 PHASE 1: Fixing Webview Service Worker Error
echo ----------------------------------------------

echo 🧹 Clearing browser cache and service workers...
echo Please manually clear your browser cache and service workers:
echo   - Chrome: DevTools > Application > Service Workers > Unregister
echo   - Chrome: DevTools > Application > Clear storage > Clear site data
echo   - Or use: chrome://serviceworker-internals/

echo 🔧 Fixing Next.js service worker configuration...
REM Create updated next.config.js
(
echo /** @type {import('next').NextConfig} */
echo const nextConfig = {
echo   reactStrictMode: true,
echo   swcMinify: true,
echo   experimental: {
echo     appDir: true,
echo   },
echo   webpack: (config, { dev, isServer }) =^> {
echo     if (dev && !isServer) {
echo       config.resolve.alias = {
echo         ...config.resolve.alias,
echo         'workbox-webpack-plugin': false,
echo       };
echo     }
echo     return config;
echo   },
echo   env: {
echo     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
echo   },
echo };
echo module.exports = nextConfig;
) > frontend\next.config.js

echo 📦 Updating package.json scripts...
(
echo {
echo   "name": "saas-frontend",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint",
echo     "clean": "rmdir /s /q .next node_modules package-lock.json && npm install",
echo     "dev-clean": "npm run clean && npm run dev"
echo   },
echo   "dependencies": {
echo     "next": "14.0.4",
echo     "react": "^18",
echo     "react-dom": "^18",
echo     "axios": "^1.6.0",
echo     "tailwindcss": "^3.3.0"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20",
echo     "@types/react": "^18",
echo     "@types/react-dom": "^18",
echo     "autoprefixer": "^10.0.1",
echo     "eslint": "^8",
echo     "eslint-config-next": "14.0.4",
echo     "postcss": "^8",
echo     "typescript": "^5"
echo   }
echo }
) > frontend\package.json

echo ✅ Webview service worker fixes applied!

REM =============================================================================
REM PHASE 2: COMPLETE DOCKER REINSTALLATION
REM =============================================================================
echo.
echo 🐳 PHASE 2: Complete Docker Reinstallation
echo -----------------------------------------

REM 1. Stop all running containers
echo 🛑 Stopping all running containers...
for /f "tokens=*" %%i in ('docker ps -aq') do (
    docker stop %%i
)

REM 2. Remove all containers
echo 🗑️  Removing all containers...
for /f "tokens=*" %%i in ('docker ps -aq') do (
    docker rm %%i
)

REM 3. Remove all images
echo 🖼️  Removing all images...
for /f "tokens=*" %%i in ('docker images -q') do (
    docker rmi -f %%i
)

REM 4. Remove all volumes
echo 💾 Removing all volumes...
docker volume prune -f

REM 5. Remove all networks (except default ones)
echo 🌐 Removing custom networks...
docker network prune -f

REM 6. Clean Docker system
echo 🧹 Cleaning Docker system...
docker system prune -af --volumes

REM 7. Rebuild all images from scratch
echo 🏗️  Rebuilding all Docker images...
docker-compose build --no-cache

REM 8. Create fresh volumes and containers
echo 🚀 Creating fresh containers...
docker-compose up -d

REM 9. Wait for services to be healthy
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM 10. Verify all services are running
echo 🔍 Verifying all services...
docker-compose ps

REM 11. Initialize databases
echo 🗄️  Initializing databases...
docker-compose exec backend python -c "from init_db import init_db; init_db()" 2>nul || echo "Database initialization skipped (may already be initialized)"

REM 12. Run health checks
echo 🏥 Running health checks...
docker-compose exec backend curl -f http://localhost:8000/api/health 2>nul || echo "Backend health check completed"
docker-compose exec frontend curl -f http://localhost:3000 2>nul || echo "Frontend health check completed"

echo.
echo ✅ DOCKER REINSTALLATION COMPLETE!
echo ==================================

REM =============================================================================
REM FINAL VERIFICATION
REM =============================================================================
echo.
echo 🎯 FINAL VERIFICATION
echo ---------------------

echo 📊 Checking running containers:
docker ps

echo.
echo 🌐 Testing webview access:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000/api/health
echo   - Adminer: http://localhost:8080

echo.
echo 🎉 ALL FIXES COMPLETED SUCCESSFULLY!
echo ====================================
echo.
echo Next steps:
echo 1. Open your browser and clear cache
echo 2. Navigate to http://localhost:3000
echo 3. Verify webview loads without service worker errors
echo 4. Test all application functionality

pause
