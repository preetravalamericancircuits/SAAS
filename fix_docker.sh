#!/bin/bash
echo "Fixing Docker Desktop visibility and initializing database..."

# Check Docker context
echo "Checking Docker context..."
docker context ls

# Clean up Docker system
echo "Cleaning Docker system..."
docker system prune -af

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down

# Rebuild and start containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for containers to be ready
echo "Waiting for containers to start..."
sleep 30

# Check container status
echo "Checking container status..."
docker ps -a

# Initialize database
echo "Initializing database..."
docker exec -it saas_backend python init_db.py

# Seed users
echo "Seeding users..."
docker exec -it saas_backend python seed_users.py

echo "Docker fix complete! Check Docker Desktop now."