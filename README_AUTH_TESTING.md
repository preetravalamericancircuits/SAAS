# Authentication Flow Testing

This document provides quick instructions for testing the authentication flow end-to-end across Docker containers.

## 🚀 Quick Start

### Option 1: Simple Test Runner (Recommended)
```bash
python run_auth_test.py
```

### Option 2: Full Test Script
```bash
# Unix/Linux/macOS
./test_auth_docker.sh

# Windows
test_auth_docker.bat
```

### Option 3: Manual Testing
```bash
# 1. Start containers
cd config
docker-compose up -d

# 2. Wait for services (or use the script)
python test_auth_flow.py --url http://localhost:8000
```

## 📋 What Gets Tested

The authentication flow tests verify:

✅ **Login Process**
- User registration
- Login with username/password
- HTTP-only cookie setting
- Access token generation

✅ **Protected Route Access**
- Cookie-based authentication
- Access to `/api/auth/me`
- Role-based access control
- Permission-based restrictions

✅ **Cross-Container Communication**
- Authentication across Docker containers
- Header-based requests
- Network communication

✅ **Logout Process**
- Cookie clearing
- Session termination
- Route protection after logout

✅ **Security Features**
- Invalid token rejection
- Unauthorized access blocking
- Token validation

## 🔧 Prerequisites

- Docker Desktop running
- Docker Compose installed
- Python 3 with `requests` library
- Ports 5432, 8000, 3000 available

## 📊 Expected Results

When tests pass, you'll see:
```
🔐 Authentication Flow End-to-End Test
======================================
✅ PASS Health Check
✅ PASS User Registration
✅ PASS Login - Token in Response
✅ PASS Login - Cookie Setting
✅ PASS Login - User Data
✅ PASS Protected Route - /api/auth/me
✅ PASS Protected Route - /api/users
✅ PASS Cross-Container Communication
✅ PASS Token Validation
✅ PASS Logout - Request
✅ PASS Logout - Cookie Clearing
✅ PASS Logout - Route Protection
✅ PASS Unauthorized Access
======================================
📊 Test Summary: 12/12 tests passed
🎉 All tests passed! Authentication flow is working correctly.
```

## 🛠️ Troubleshooting

### Common Issues

1. **Docker not running**
   ```
   [ERROR] Docker is not running. Please start Docker and try again.
   ```
   **Fix**: Start Docker Desktop

2. **Services not starting**
   ```
   [ERROR] PostgreSQL failed to start within 60 seconds
   ```
   **Fix**: Check Docker resources, ensure ports are free

3. **Authentication failures**
   ```
   ❌ FAIL Login - Cookie Setting
   ```
   **Fix**: Check CORS settings in `backend/config.py`

4. **Frontend not accessible**
   ```
   [WARNING] Frontend is not accessible
   ```
   **Fix**: Check Next.js build, verify port 3000

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend

# Manual health check
curl http://localhost:8000/api/health
```

## 🔒 Security Features Tested

- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only in production
- **SameSite Policy**: Prevents CSRF attacks
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt encryption
- **Role-Based Access**: Permission enforcement

## 📁 Files Created

- `test_auth_flow.py` - Main test script
- `test_auth_docker.sh` - Unix/Linux/macOS runner
- `test_auth_docker.bat` - Windows runner
- `run_auth_test.py` - Simple test runner
- `docs/AUTHENTICATION_TESTING.md` - Detailed documentation

## 🎯 Test Scenarios

### 1. Happy Path
- Register user → Login → Access protected routes → Logout

### 2. Security Tests
- Invalid credentials → Rejection
- Invalid tokens → 401 responses
- Unauthorized access → Permission denied

### 3. Cross-Container
- Docker network communication
- Header-based requests
- Container-to-container auth

### 4. Frontend Integration
- Login page accessibility
- Dashboard protection
- Redirect behavior

## 📈 Performance Notes

- Tests include 0.5s delays between requests
- 60-second timeouts for service startup
- Health checks ensure readiness
- Configurable for different environments

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Test Authentication Flow
  run: |
    python run_auth_test.py
```

## 📞 Support

For issues:
1. Check troubleshooting section
2. Review container logs
3. Verify environment configuration
4. Ensure all prerequisites are met

---

**Quick Reference**: Run `python run_auth_test.py` for the easiest testing experience! 