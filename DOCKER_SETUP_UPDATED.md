# 🐳 Docker Setup - Updated SAAS Website

This document provides comprehensive instructions for running the enhanced SAAS website with all new features using Docker.

## 🆕 New Features Included

- **Framer Motion Animations**: Smooth page transitions and interactive elements
- **Sonner Toast Notifications**: Beautiful success/error notifications
- **Zod Form Validation**: Type-safe form validation with real-time feedback
- **Skeleton Loading States**: Animated loading placeholders
- **Mobile Responsive Design**: Full mobile and tablet support
- **Enhanced RBAC**: Role-based access control with UI integration
- **User Management**: Complete CRUD operations for users
- **Task Management**: Task creation and management system
- **Website Viewer**: Embedded website viewing with localStorage

## 📋 Prerequisites

- Docker Desktop 4.0+ (Windows/Mac) or Docker Engine 20.10+ (Linux)
- Docker Compose 2.0+
- 8GB+ RAM recommended
- 10GB+ free disk space

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd SAAS
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

### 3. Start Application
```bash
# Linux/Mac
./scripts/start-updated.sh

# Windows
scripts\start-updated.bat

# Or manually
docker-compose up -d --build
```

## 🔧 Environment Variables

### Core Configuration
```env
# Database
POSTGRES_DB=aci_db
POSTGRES_USER=aci_user
POSTGRES_PASSWORD=aci_password

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_TELEMETRY_DISABLED=1

# Features
ENABLE_ANIMATIONS=true
ENABLE_TOAST_NOTIFICATIONS=true
ENABLE_FORM_VALIDATION=true
```

## 📱 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Swagger documentation |
| **QA Dashboard** | http://localhost/qa-test | Testing interface |

## 🔧 Management Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| **Adminer** | http://localhost:8080 | postgres/aci_user/aci_password |
| **Portainer** | http://localhost:9000 | admin/admin123 |
| **Grafana** | http://localhost:3001 | admin/admin123 |
| **Mailhog** | http://localhost:8025 | No auth required |

## 👤 Default Users

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| preet | password123 | SuperUser | Full system access |
| admin | admin123 | Admin | User/Task management |
| user1 | password123 | User | Dashboard/Websites only |
| itra1 | password123 | ITRA | Secure files access |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  Next.js Frontend│────│  FastAPI Backend│
│   Port 80/443   │    │    Port 3000     │    │    Port 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │    │   PostgreSQL    │
                       │   Port 6379     │    │    Port 5432    │
                       └─────────────────┘    └─────────────────┘
```

## 🔍 Service Health Checks

All services include health checks:

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Check service health
curl http://localhost:8000/api/health
curl http://localhost:3000
```

## 📊 New Frontend Features

### 1. Animations (Framer Motion)
- Sidebar slide-in animations
- Card hover effects
- Modal transitions
- Staggered list animations

### 2. Toast Notifications (Sonner)
- Success/error feedback
- Form submission status
- CRUD operation confirmations
- Network error handling

### 3. Form Validation (Zod)
- Type-safe validation schemas
- Real-time error feedback
- Password confirmation
- Email format validation

### 4. Loading States
- Skeleton components
- Table loading placeholders
- Card loading animations
- Async operation feedback

### 5. Mobile Responsiveness
- Hamburger navigation menu
- Card layouts for mobile tables
- Touch-friendly interactions
- Responsive breakpoints

## 🛠️ Development Mode

For development with hot reload:

```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or use environment variable
ENVIRONMENT=development docker-compose up -d
```

## 🚀 Production Deployment

For production deployment:

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or set production environment
ENVIRONMENT=production NODE_ENV=production docker-compose up -d
```

## 🔒 Security Features

### Frontend Security
- HTTP-only cookie authentication
- CSRF protection
- XSS prevention
- Content Security Policy headers

### Backend Security
- JWT token authentication
- Role-based access control
- Rate limiting
- Input validation

### Infrastructure Security
- Nginx reverse proxy
- SSL/TLS termination
- Security headers
- Network isolation

## 📝 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   ```

2. **Memory Issues**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   ```

3. **Permission Issues (Linux)**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod +x scripts/*.sh
   ```

4. **Database Connection Issues**
   ```bash
   # Reset database
   docker-compose down -v
   docker-compose up -d postgres
   ```

### Service Restart

```bash
# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build frontend
```

## 📈 Monitoring

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 frontend
```

### Metrics
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Container stats**: `docker stats`

## 🧪 Testing

### QA Dashboard
Access the comprehensive testing dashboard at:
http://localhost/qa-test

Features:
- Automated functionality tests
- Responsive design verification
- RBAC permission checks
- Form validation testing
- Animation performance checks

### Manual Testing Checklist

#### ✅ Authentication & RBAC
- [ ] Login with different user roles
- [ ] Verify navigation items per role
- [ ] Test protected route access
- [ ] Confirm logout functionality

#### ✅ User Interface
- [ ] Test mobile responsiveness
- [ ] Verify animations work smoothly
- [ ] Check toast notifications
- [ ] Test form validation

#### ✅ CRUD Operations
- [ ] Create/edit/delete users
- [ ] Create/edit/delete tasks
- [ ] Test data persistence
- [ ] Verify real-time updates

#### ✅ Website Viewer
- [ ] Add website URLs
- [ ] Test iframe loading
- [ ] Verify localStorage saving
- [ ] Test mobile website viewing

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Update dependencies
docker-compose exec frontend npm update
docker-compose exec backend pip install -r requirements.txt --upgrade
```

### Database Migrations
```bash
# Run database migrations
docker-compose exec backend python init_db.py

# Seed test data
docker-compose exec backend python seed_users.py
```

### Backup and Restore
```bash
# Backup database
docker-compose exec postgres pg_dump -U aci_user aci_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U aci_user aci_db < backup.sql
```

## 📞 Support

For issues and questions:
1. Check the logs: `docker-compose logs`
2. Verify service health: `docker-compose ps`
3. Test individual components
4. Review environment variables
5. Check the QA dashboard for automated tests

## 🎯 Performance Optimization

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization
- Static asset caching
- Gzip compression via Nginx

### Backend Optimization
- FastAPI async operations
- Database connection pooling
- Redis caching (optional)
- API response compression

### Infrastructure Optimization
- Nginx reverse proxy
- Load balancing ready
- Health check monitoring
- Resource limit configuration

---

**Built with ❤️ using Docker, FastAPI, Next.js, and modern web technologies**