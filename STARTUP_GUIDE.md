# 🚀 SAAS Application Startup Guide

## Quick Start (Windows)

### Option 1: Automated Startup (Recommended)
```bash
# Start Backend
cd backend
start.bat

# Start Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Option 2: Manual Startup
```bash
# 1. Install Backend Dependencies
cd backend
pip install -r requirements.txt

# 2. Initialize Database
python init_db.py

# 3. Start Backend
python start.py

# 4. Start Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## 🔧 Fixed Issues

### ✅ Database Connection Fixed
- **Problem**: PostgreSQL connection error (`could not translate host name "postgres"`)
- **Solution**: Changed to SQLite for local development
- **File**: `backend/config.py` - Updated database URL to `sqlite:///./saas_app.db`

### ✅ Database Initialization
- **Added**: `init_db.py` - Automatic database setup with default users
- **Added**: `start.py` - Smart startup script that initializes DB if needed
- **Added**: `start.bat` - Windows batch file for easy startup

## 👤 Default Users

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| preet | password123 | SuperUser | Full access |
| admin | admin123 | Admin | Administrative |
| operator1 | password123 | Operator | System operations |
| user1 | password123 | User | Standard user |
| itra1 | password123 | ITRA | Secure files access |
| manager1 | password123 | Manager | Management access |
| guest1 | password123 | Guest | Read-only access |

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 🧪 Testing

### Backend Testing
```bash
# Test backend functionality
python test-backend.py
```

### Manual Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Login works with default users
- [ ] Navigation sidebar shows correct items
- [ ] All pages load without errors
- [ ] API endpoints return data

## 📁 Database Files

- **SQLite Database**: `backend/saas_app.db` (created automatically)
- **Database Schema**: Defined in `backend/models.py`
- **Initialization**: `backend/init_db.py`

## 🔍 Troubleshooting

### Backend Won't Start
1. Check Python version: `python --version` (requires 3.8+)
2. Install dependencies: `pip install -r requirements.txt`
3. Initialize database: `python init_db.py`
4. Check for port conflicts (port 8000)

### Frontend Won't Start
1. Check Node.js version: `node --version` (requires 16+)
2. Install dependencies: `npm install`
3. Check for port conflicts (port 3000)

### Database Issues
1. Delete `saas_app.db` file
2. Run `python init_db.py` to recreate
3. Restart backend

### Login Issues
1. Verify database is initialized
2. Use correct default credentials
3. Check browser console for errors

## 📦 Dependencies

### Backend
- FastAPI - Web framework
- SQLAlchemy - Database ORM
- SQLite - Database (local development)
- Uvicorn - ASGI server
- Pydantic - Data validation
- Passlib - Password hashing
- Python-JOSE - JWT tokens

### Frontend
- Next.js - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Lucide React - Icons
- SWR - Data fetching
- Framer Motion - Animations

## 🚀 Production Deployment

For production deployment:
1. Update `backend/config.py` to use PostgreSQL
2. Set proper environment variables
3. Use Docker Compose: `docker-compose up -d`
4. Configure reverse proxy (Nginx)

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Ensure all dependencies are installed
4. Try restarting both backend and frontend

---

**Status**: ✅ **READY TO RUN**

The application has been fixed and is ready for development!