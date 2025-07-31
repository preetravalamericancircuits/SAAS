# SAAS Website with FastAPI Backend & Next.js Frontend

A comprehensive SaaS application with a modern FastAPI backend featuring JWT authentication with HTTP-only cookies, role-based access control, and a complete Next.js frontend with TypeScript.

## 🚀 Project Overview

This project consists of a full-stack SaaS application with:

- **FastAPI Backend**: Modern Python API with JWT authentication using HTTP-only cookies and RBAC
- **Next.js Frontend**: Complete React-based frontend with TypeScript and Tailwind CSS
- **PostgreSQL Database**: Dockerized database with SQLAlchemy ORM
- **Docker Support**: Complete containerization with Nginx reverse proxy
- **Security Features**: HTTP-only cookies, role-based access control, rate limiting

## ✨ Features

### Backend (FastAPI)
- 🔐 **Cookie-Based JWT Authentication** with HTTP-only cookies for enhanced security
- 🛡️ **Role-Based Access Control (RBAC)** with granular permissions
- 👥 **User Management** with complete CRUD operations
- 🔑 **Admin Routes** for user promotion and role management
- 📊 **Database Integration** with PostgreSQL and SQLAlchemy ORM
- ✅ **Input Validation** with Pydantic schemas
- 🚀 **Auto-generated API Documentation** (Swagger/ReDoc)
- 🍪 **Dual Authentication**: Cookie-first with header fallback for API clients

### Frontend (Next.js)
- 🎨 **Modern UI** with TypeScript, Tailwind CSS, and responsive design
- 🔐 **Cookie-Based Authentication Context** for state management
- 👥 **Role-Based Navigation** that dynamically changes per user role
- 🛡️ **Protected Routes** with proper guards and error handling
- 📱 **Responsive Design** for all devices
- ⚡ **Fast Performance** with Next.js optimizations
- 🔒 **Secure Files Page** for ITRA and SuperUser roles

## 🏗️ Architecture

```
SAAS Website/
├── backend/                 # FastAPI Backend
│   ├── main.py             # FastAPI application
│   ├── auth.py             # Cookie-based authentication & RBAC
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # Database connection
│   ├── config.py           # Configuration
│   ├── init_db.py          # Database initialization
│   ├── seed_users.py       # User seeding script
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js Frontend
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Dashboard component
│   │   ├── LoginForm.tsx   # Login form
│   │   ├── Navigation.tsx  # Role-based navigation
│   │   ├── UserManagement.tsx # User management interface
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Cookie-based authentication context
│   ├── pages/              # Next.js pages
│   │   ├── _app.tsx        # App wrapper
│   │   ├── index.tsx       # Home page
│   │   ├── login.tsx       # Login page
│   │   ├── dashboard.tsx   # Main dashboard
│   │   └── secure-files.tsx # ITRA-only secure files
│   └── styles/             # CSS styles
├── db/                     # Database migrations
├── config/                 # Docker and Nginx configuration
└── docker-compose.yml      # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.8+
- Node.js 16+

### 1. Clone and Setup
```bash
git clone <repository-url>
cd SAAS-website
```

### 2. Environment Setup
```bash
# Copy environment template
cp config/env.sample .env

# Edit environment variables as needed
```

### 3. Start with Docker (Recommended)
```bash
# Start the complete application stack
docker-compose up -d

# Or use the startup script
./scripts/start.sh
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 5. Manual Setup (Alternative)
```bash
# Backend
cd backend
pip install -r requirements.txt
python start.py

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## 📋 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (sets HTTP-only cookie)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout (clears cookie)

#### User Management
- `GET /api/users` - Get all users (requires `user:read`)
- `POST /api/users` - Create user (requires `user:create`)
- `PUT /api/users/{id}` - Update user (requires `user:update`)
- `DELETE /api/users/{id}` - Delete user (requires `user:delete`)

#### Admin Routes
- `POST /api/admin/promote-user` - Promote user to different role

#### Secure Files
- `GET /api/secure-files` - Access secure files (ITRA/SuperUser only)

## 🔐 Authentication & Authorization

### Default Users
| Username | Password | Role | Description |
|----------|----------|------|-------------|
| preet | password123 | SuperUser | Preet Raval (You) |
| operator1 | password123 | Operator | System Operator |
| user1 | password123 | User | Standard User |
| itra1 | password123 | ITRA | Internal Technical Review Authority |
| admin | admin123 | SuperUser | System Administrator |

### Role-Based Access Control

The system implements a comprehensive RBAC system with:

#### Roles
1. **SuperUser** - Full system access and administration
2. **Admin** - Administrative access
3. **Manager** - Manager access
4. **User** - Standard user access
5. **Operator** - System operator access
6. **ITRA** - Internal Technical Review Authority
7. **Guest** - Read-only access

#### Permissions
- **User Management**: `user:read`, `user:create`, `user:update`, `user:delete`
- **Role Management**: `role:read`, `role:create`, `role:update`, `role:delete`
- **Permission Management**: `permission:read`, `permission:create`, `permission:update`, `permission:delete`
- **System**: `system:admin`, `system:read`
- **Secure Files**: `secure_files:read`, `secure_files:write`

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **roles** - User roles and permissions
- **permissions** - Granular system permissions
- **role_permissions** - Many-to-many role-permission mapping
- **person** - Legacy person management (maintained for compatibility)

## 🔒 Security Features

### Cookie-Based Authentication
- **HTTP-Only Cookies**: JWT tokens stored in secure cookies preventing XSS attacks
- **Secure Cookie Settings**: Proper domain, path, and security flags
- **Dual Authentication**: Cookie-first with header fallback for API clients
- **Token Expiration**: Configurable JWT expiry times

### Access Control
- **Role-Based Access**: Granular role and permission system
- **Route Protection**: Frontend and backend route guards
- **API Security**: Rate limiting and input validation
- **CORS Protection**: Configurable cross-origin policies

### Data Protection
- **Password Hashing**: Bcrypt with salt for secure storage
- **Input Validation**: Comprehensive Pydantic and React Hook Form validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **Error Handling**: Proper HTTP status codes without information leakage

## 🧪 Testing

### Full-Stack Testing
```bash
# Test the complete application
# 1. Start the application
docker-compose up -d

# 2. Test authentication flow
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"preet","password":"password123"}' \
     -c cookies.txt

# 3. Test protected endpoints
curl -X GET "http://localhost:8000/api/auth/me" \
     -b cookies.txt
```

### Manual API Testing
```bash
# Register a new user
curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123","confirm_password":"password123"}'

# Login (sets HTTP-only cookie)
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}' \
     -c cookies.txt
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_DB=aci_db
POSTGRES_USER=aci_user
POSTGRES_PASSWORD=aci_password
DATABASE_URL=postgresql://aci_user:aci_password@postgres:5432/aci_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production

# Backend
ALLOWED_ORIGINS=["http://localhost:3000", "http://frontend:3000"]
ENVIRONMENT=production
DEBUG=false

# Docker
NGINX_PORT=80
NGINX_SSL_PORT=443
```

## 🐳 Docker Support

### Full Stack Deployment
```bash
# Production deployment
docker-compose up -d

# Development deployment
docker-compose -f config/docker-compose.dev.yml up -d
```

### Individual Services
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start only backend
docker-compose up -d backend

# Start only frontend
docker-compose up -d frontend
```

### Development with Hot Reload
```bash
# Development environment
docker-compose -f config/docker-compose.dev.yml up -d

# View logs
docker-compose -f config/docker-compose.dev.yml logs -f
```

## 📁 Project Structure

```
SAAS website/
├── backend/                    # FastAPI Backend
│   ├── main.py                # FastAPI application with all endpoints
│   ├── auth.py                # Cookie-based authentication and RBAC
│   ├── models.py              # SQLAlchemy database models
│   ├── schemas.py             # Pydantic schemas for validation
│   ├── database.py            # Database connection and session management
│   ├── config.py              # Configuration settings
│   ├── seed_users.py          # User seeding script
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Production Docker image
│   └── Dockerfile.dev         # Development Docker image
├── frontend/                  # Next.js Frontend
│   ├── pages/                 # Next.js pages
│   │   ├── index.tsx          # Home page with redirect logic
│   │   ├── login.tsx          # Login page
│   │   ├── dashboard.tsx      # Main dashboard
│   │   └── secure-files.tsx   # ITRA-only secure files page
│   ├── components/            # React components
│   │   ├── Navigation.tsx     # Role-based navigation
│   │   ├── LoginForm.tsx      # Login form component
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── UserManagement.tsx # User management interface
│   │   └── ProtectedRoute.tsx # Route protection component
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Cookie-based authentication context
│   ├── package.json           # Node.js dependencies
│   ├── Dockerfile             # Production Docker image
│   └── Dockerfile.dev         # Development Docker image
├── config/                    # Configuration files
│   ├── docker-compose.yml     # Production Docker orchestration
│   ├── docker-compose.dev.yml # Development Docker orchestration
│   ├── env.sample            # Environment variables template
│   └── nginx/                # Nginx configuration
├── db/                       # Database migrations
│   └── migrations/           # SQL migration files
├── docs/                     # Documentation
│   ├── AIController.md       # AI Controller documentation
│   ├── DOCKER_SETUP.md       # Docker setup guide
│   ├── IMPLEMENTATION_SUMMARY.md # Implementation details
│   ├── PERSON_MODEL_DOCUMENTATION.md # Person model documentation
│   └── README.md             # Documentation index
├── scripts/                  # Utility scripts
│   ├── start.sh             # Startup script
│   └── start.bat            # Windows startup script
└── README.md                # This file
```

## 🎯 Role-Based Features

### SuperUser (preet)
- ✅ Full system access and administration
- ✅ User management interface with role assignment
- ✅ Access to secure files and confidential documents
- ✅ System configuration and monitoring

### ITRA (itra1)
- ✅ Access to secure files page
- ✅ Confidential document viewing and management
- ✅ Audit reports and compliance features
- ✅ Specialized navigation menu

### Admin (admin)
- ✅ User management (limited scope)
- ✅ System configuration access
- ✅ Reports and analytics
- ✅ Administrative functions

### User/Operator
- ✅ Basic dashboard access
- ✅ Profile management
- ✅ Standard application features
- ✅ Role-appropriate navigation

## 🚀 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python start.py
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Development
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd backend
python init_db.py
```

## 📚 Documentation

- [AI Controller](./docs/AIController.md) - AI Controller documentation and project status
- [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md) - Detailed feature breakdown
- [Docker Setup](./docs/DOCKER_SETUP.md) - Docker configuration guide
- [Person Model](./docs/PERSON_MODEL_DOCUMENTATION.md) - Person model documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [API Documentation](http://localhost:8000/docs) when running
- Review the [AI Controller Documentation](./docs/AIController.md)
- Open an issue in the repository

## 🎯 Roadmap

- [x] Complete frontend implementation with TypeScript
- [x] Cookie-based authentication system
- [x] Role-based access control with UI integration
- [x] Secure files feature for ITRA users
- [x] Docker infrastructure with Nginx
- [x] Comprehensive security features
- [ ] Add comprehensive testing suite
- [ ] Implement real-time features
- [ ] Add monitoring and logging
- [ ] Deploy to production environment
- [ ] Add CI/CD pipeline
- [ ] Implement advanced analytics
- [ ] Add multi-tenancy support

---

**Built with ❤️ using FastAPI, Next.js, TypeScript, and PostgreSQL** 