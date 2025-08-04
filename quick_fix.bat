@echo off
echo Quick Docker fix for visibility...

REM Restart Docker Desktop service
net stop com.docker.service
net start com.docker.service

REM Wait a moment
timeout /t 10

REM Check containers
docker ps -a

REM If no containers, start them
docker-compose up -d

echo Done! Check Docker Desktop.