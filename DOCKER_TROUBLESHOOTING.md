# Docker Desktop Visibility Fix

## Quick Fix Commands

### Windows (Run as Administrator)
```batch
# Run the automated fix
fix_docker.bat

# Or manual steps:
docker context ls
docker system prune -af
docker-compose down
docker-compose up -d --build
docker ps -a
```

### Linux/Mac
```bash
# Run the automated fix
chmod +x fix_docker.sh
./fix_docker.sh

# Or manual steps:
docker context ls
docker system prune -af
docker-compose down
docker-compose up -d --build
docker ps -a
```

## Common Issues & Solutions

### 1. Containers Not Showing in Docker Desktop
- **Solution**: Restart Docker Desktop service
- **Windows**: Run `quick_fix.bat` as administrator
- **Check**: Docker Desktop > Settings > Resources > File Sharing

### 2. Database Not Initialized
```bash
# Initialize database
docker exec -it saas_backend python init_db.py

# Seed users
docker exec -it saas_backend python seed_users.py
```

### 3. Container Health Checks
```bash
# Check container status
docker ps -a

# Check logs
docker logs saas_backend
docker logs saas_frontend
docker logs saas_postgres
```

### 4. Network Issues
```bash
# Recreate network
docker network prune
docker-compose up -d
```

## Default Users After Seeding
- **SuperUser**: preet / password123
- **Admin**: admin / admin123  
- **Operator**: operator1 / password123
- **User**: user1 / password123
- **ITRA**: itra1 / password123

## Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (adminer at :8080)