# Docker & Compose Setup Documentation

## 🐳 Overview

This document provides comprehensive instructions for setting up and running the SAAS application using Docker and Docker Compose. The setup includes:

- **PostgreSQL Database** with volume mounts and initialization scripts
- **FastAPI Backend** with JWT authentication and RBAC
- **Next.js Frontend** with modern UI
- **Nginx Reverse Proxy** for routing and load balancing
- **Redis** (optional) for caching and sessions

## 📁 File Structure

```
SAAS website/
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml      # Development Docker Compose
├── .env                        # Environment variables (create from env.sample)
├── env.sample                  # Environment variables template
├── DOCKER_SETUP.md            # This documentation
├── backend/
│   ├── Dockerfile             # Production backend image
│   ├── Dockerfile.dev         # Development backend image
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── Dockerfile             # Production frontend image
│   ├── Dockerfile.dev         # Development frontend image
│   └── package.json           # Node.js dependencies
├── nginx/
│   ├── nginx.conf             # Production nginx configuration
│   ├── nginx.dev.conf         # Development nginx configuration
│   └── ssl/                   # SSL certificates (create for production)
└── db/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_seed_data.sql
        ├── 003_create_person_table.sql
        └── 004_complete_schema.sql
```

## 🚀 Quick Start

### 1. Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- Git

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd SAAS-website

# Copy environment variables
cp env.sample .env

# Edit environment variables (optional)
nano .env
```

### 3. Production Deployment

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 4. Development Setup

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check development services
docker-compose -f docker-compose.dev.yml ps

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Key variables include:

#### Database Configuration
```env
POSTGRES_DB=aci_db
POSTGRES_USER=aci_user
POSTGRES_PASSWORD=aci_password
POSTGRES_PORT=5432
DATABASE_URL=postgresql://aci_user:aci_password@postgres:5432/aci_db
```

#### Security Configuration
```env
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Service Ports
```env
BACKEND_PORT=8000
FRONTEND_PORT=3000
NGINX_PORT=80
NGINX_SSL_PORT=443
REDIS_PORT=6379
```

### Production vs Development

| Feature | Production | Development |
|---------|------------|-------------|
| Hot Reload | ❌ | ✅ |
| Debug Mode | ❌ | ✅ |
| Multi-stage Build | ✅ | ❌ |
| Volume Mounts | Limited | Full |
| Health Checks | ✅ | ❌ |
| Security | Strict | Relaxed |

## 🗄️ Database Setup

### Initialization

The PostgreSQL container automatically initializes with:

1. **Database Schema**: All tables, indexes, and constraints
2. **Roles & Permissions**: Complete RBAC system
3. **Default Users**: Admin and test users
4. **Person Table**: Legacy person management

### Default Credentials

#### Admin User (users table)
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`
- **Role**: SuperUser

#### Person Users (person table)
- **preet**: SuperUser role
- **kanav**: Operator role
- **khash**: User role
- **cathy**: ITRA role
- **pratiksha**: User role
- **Password**: `password123` (for all)

### Database Migrations

Migrations are automatically applied in order:

1. `001_initial_schema.sql` - Basic schema
2. `002_seed_data.sql` - Initial data
3. `003_create_person_table.sql` - Person table
4. `004_complete_schema.sql` - Complete setup

## 🔐 Security Features

### Production Security

- **Non-root containers**: All services run as non-root users
- **Health checks**: Automatic service monitoring
- **Rate limiting**: Nginx rate limiting for API protection
- **Security headers**: XSS, CSRF protection
- **SSL ready**: HTTPS configuration ready
- **Network isolation**: Custom Docker network

### Development Security

- **Relaxed settings**: Easier debugging
- **Hot reload**: Code changes without restart
- **Debug mode**: Detailed error messages
- **Volume mounts**: Direct file access

## 📊 Service Architecture

### Production Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
├── Frontend (Port 3000)
├── Backend (Port 8000)
└── Redis (Port 6379)
    ↓
PostgreSQL (Port 5432)
```

### Development Architecture

```
Local Machine
    ↓
Nginx (Port 80)
    ↓
├── Frontend (Port 3000) - Hot Reload
├── Backend (Port 8000) - Hot Reload
└── Redis (Port 6379)
    ↓
PostgreSQL (Port 5432)
```

## 🛠️ Management Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Access service shell
docker-compose exec backend bash
docker-compose exec postgres psql -U aci_user -d aci_db
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild development images
docker-compose -f docker-compose.dev.yml build --no-cache

# View development logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U aci_user -d aci_db

# Backup database
docker-compose exec postgres pg_dump -U aci_user aci_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U aci_user -d aci_db < backup.sql

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect saas_postgres_data

# Backup volume
docker run --rm -v saas_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v saas_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🔍 Monitoring & Debugging

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose exec backend curl -f http://localhost:8000/api/health
docker-compose exec frontend curl -f http://localhost:3000
```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# View logs with timestamps
docker-compose logs -f -t
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :80
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Change ports in .env file
BACKEND_PORT=8001
FRONTEND_PORT=3001
NGINX_PORT=8080
```

#### 2. Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U aci_user

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### 3. Build Issues

```bash
# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend

# Check build logs
docker-compose build backend
```

#### 4. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
```

### Debug Mode

Enable debug mode for development:

```env
# In .env file
DEBUG=true
ENVIRONMENT=development
NODE_ENV=development
```

## 🔄 Updates & Maintenance

### Updating Services

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U aci_user aci_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Volume backup
docker run --rm -v saas_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/volume_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Security Updates

```bash
# Update base images
docker-compose pull

# Scan for vulnerabilities
docker scan saas_backend
docker scan saas_frontend

# Update dependencies
docker-compose exec backend pip install --upgrade -r requirements.txt
docker-compose exec frontend npm update
```

## 📚 Additional Resources

### Documentation

- [Docker Compose Reference](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### API Documentation

Once the application is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Support

For issues and questions:

1. Check the troubleshooting section
2. Review service logs
3. Verify environment variables
4. Check Docker and Docker Compose versions
5. Ensure sufficient system resources

---

**Docker Setup Status**: ✅ **COMPLETE**  
**Production Ready**: ✅ **YES**  
**Development Ready**: ✅ **YES**  
**Documentation**: ✅ **COMPREHENSIVE** 