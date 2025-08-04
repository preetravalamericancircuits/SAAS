@echo off
echo Fixing Docker Desktop visibility and initializing database...

REM Check Docker context
echo Checking Docker context...
docker context ls

REM Clean up Docker system
echo Cleaning Docker system...
docker system prune -af

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose down

REM Rebuild and start containers
echo Building and starting containers...
docker-compose up -d --build

REM Wait for containers to be ready
echo Waiting for containers to start...
timeout /t 30

REM Check container status
echo Checking container status...
docker ps -a

REM Initialize database
echo Initializing database...
docker exec -it saas_backend python init_db.py

REM Seed users
echo Seeding users...
docker exec -it saas_backend python seed_users.py

echo Docker fix complete! Check Docker Desktop now.
pause