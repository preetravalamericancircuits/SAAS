# Authentication Flow End-to-End Testing

This document describes how to test the complete authentication flow across Docker containers, ensuring that login, protected route access, and logout functionality work correctly.

## Overview

The authentication system uses HTTP-only cookies for secure token storage and includes the following key components:

1. **Login**: Sets the `access_token` cookie
2. **Protected Routes**: Use cookie to authorize user
3. **Logout**: Clears the cookie
4. **Cross-Container Communication**: Works across Docker containers

## Test Components

### 1. Python Test Script (`test_auth_flow.py`)

A comprehensive Python script that tests all aspects of the authentication flow:

- Health check verification
- User registration
- Login with cookie setting
- Protected route access
- Cross-container communication
- Token validation
- Logout with cookie clearing
- Unauthorized access rejection

### 2. Shell Script (`test_auth_docker.sh`)

A bash script for Unix/Linux/macOS systems that:

- Checks Docker prerequisites
- Sets up environment
- Starts Docker containers
- Waits for services to be ready
- Runs authentication tests
- Tests frontend authentication
- Provides cleanup options

### 3. Batch Script (`test_auth_docker.bat`)

A Windows batch file that provides the same functionality as the shell script for Windows users.

## Prerequisites

Before running the tests, ensure you have:

1. **Docker** installed and running
2. **Docker Compose** installed
3. **Python 3** with `requests` library
4. **curl** (usually pre-installed on most systems)

## Quick Start

### Option 1: Full Test Cycle (Recommended)

#### On Unix/Linux/macOS:
```bash
chmod +x test_auth_docker.sh
./test_auth_docker.sh
```

#### On Windows:
```cmd
test_auth_docker.bat
```

### Option 2: Step-by-Step Testing

#### 1. Start Containers Only
```bash
# Unix/Linux/macOS
./test_auth_docker.sh --start-only

# Windows
test_auth_docker.bat --start-only
```

#### 2. Run Tests Only (if containers are already running)
```bash
# Unix/Linux/macOS
./test_auth_docker.sh --test-only

# Windows
test_auth_docker.bat --test-only
```

#### 3. Run Tests with Cleanup
```bash
# Unix/Linux/macOS
./test_auth_docker.sh --cleanup

# Windows
test_auth_docker.bat --cleanup
```

### Option 3: Manual Testing

#### 1. Start the Docker environment:
```bash
cd config
docker-compose up -d
```

#### 2. Wait for services to be ready:
```bash
# Wait for database
docker-compose exec postgres pg_isready -U aci_user -d aci_db

# Wait for backend
curl -f http://localhost:8000/api/health

# Wait for frontend
curl -f http://localhost:3000
```

#### 3. Run the Python test script:
```bash
python3 test_auth_flow.py --url http://localhost:8000
```

## Test Details

### What Each Test Verifies

#### 1. Health Check
- Verifies the API is running and accessible
- Tests the `/api/health` endpoint

#### 2. User Registration
- Tests user registration via `/api/auth/register`
- Handles both new user creation and existing user scenarios

#### 3. Login Process
- Tests login via `/api/auth/login`
- Verifies access token is returned in response
- **Critical**: Checks that HTTP-only cookie is set
- Validates user data is returned

#### 4. Protected Route Access
- Tests access to `/api/auth/me` (user info)
- Tests access to `/api/users` (admin endpoint)
- Verifies cookie-based authentication works

#### 5. Cross-Container Communication
- Tests authentication with Docker-specific headers
- Simulates requests from different containers
- Verifies authentication works across container boundaries

#### 6. Token Validation
- Tests rejection of invalid tokens
- Simulates expired or malformed tokens
- Ensures security is maintained

#### 7. Logout Process
- Tests logout via `/api/auth/logout`
- **Critical**: Verifies cookie is cleared
- Tests that protected routes become inaccessible after logout

#### 8. Unauthorized Access
- Tests that unauthenticated requests are properly rejected
- Verifies 401 status codes for protected endpoints

### Frontend Testing

The scripts also test frontend authentication:

- Verifies frontend is accessible
- Tests login page accessibility
- Checks dashboard protection (redirects unauthenticated users)

## Expected Test Results

When all tests pass, you should see output like:

```
🔐 Authentication Flow End-to-End Test
======================================
Testing against: http://localhost:8000

✅ PASS Health Check
   Details: API is running at http://localhost:8000

✅ PASS User Registration
   Details: User 'testuser' registered successfully

✅ PASS Login - Token in Response
   Details: Access token received in response

✅ PASS Login - Cookie Setting
   Details: HTTP-only cookie set successfully

✅ PASS Login - User Data
   Details: User data received: testuser (User)

✅ PASS Protected Route - /api/auth/me
   Details: Authenticated as: testuser

✅ PASS Protected Route - /api/users
   Details: Access denied (expected - no user:read permission)

✅ PASS Cross-Container Communication
   Details: Authentication works across container boundaries

✅ PASS Token Validation
   Details: Invalid tokens properly rejected

✅ PASS Logout - Request
   Details: Logout request successful

✅ PASS Logout - Cookie Clearing
   Details: Access token cookie cleared

✅ PASS Logout - Route Protection
   Details: Protected routes properly inaccessible after logout

✅ PASS Unauthorized Access
   Details: Properly rejected unauthorized request

======================================
📊 Test Summary: 12/12 tests passed
🎉 All tests passed! Authentication flow is working correctly.
```

## Troubleshooting

### Common Issues

#### 1. Docker Not Running
```
[ERROR] Docker is not running. Please start Docker and try again.
```
**Solution**: Start Docker Desktop or Docker daemon

#### 2. Services Not Starting
```
[ERROR] PostgreSQL failed to start within 60 seconds
```
**Solution**: 
- Check Docker resources (memory, CPU)
- Ensure ports 5432, 8000, 3000 are not in use
- Check Docker logs: `docker-compose logs`

#### 3. Authentication Tests Failing
```
❌ FAIL Login - Cookie Setting
   Details: No access_token cookie found
```
**Solution**:
- Check CORS configuration in `backend/config.py`
- Verify `ALLOWED_ORIGINS` includes the test URL
- Check cookie settings in `backend/main.py`

#### 4. Frontend Not Accessible
```
[WARNING] Frontend is not accessible (tests will continue with API only)
```
**Solution**:
- Check if Next.js is building correctly
- Verify frontend container logs
- Check port 3000 availability

### Debug Mode

To run tests with more verbose output:

```bash
# Run Python script with debug info
python3 test_auth_flow.py --url http://localhost:8000 --wait 5

# Show container logs
./test_auth_docker.sh --logs
```

### Manual Verification

You can manually verify the authentication flow:

1. **Register a user**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

2. **Login and check cookies**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  -c cookies.txt -v
```

3. **Access protected route**:
```bash
curl http://localhost:8000/api/auth/me -b cookies.txt
```

4. **Logout**:
```bash
curl -X POST http://localhost:8000/api/auth/logout -b cookies.txt
```

## Security Considerations

The authentication system implements several security best practices:

1. **HTTP-Only Cookies**: Prevents XSS attacks
2. **Secure Flag**: Enabled in production for HTTPS-only
3. **SameSite Policy**: Prevents CSRF attacks
4. **JWT Tokens**: Stateless authentication with expiration
5. **Password Hashing**: Uses bcrypt for secure password storage

## Performance Notes

- Tests include small delays between requests to avoid overwhelming the system
- Container health checks ensure services are ready before testing
- Timeout values are configurable for different environments

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Test Authentication Flow
  run: |
    chmod +x test_auth_docker.sh
    ./test_auth_docker.sh --cleanup
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Verify environment configuration in `config/.env`
4. Ensure all prerequisites are installed and running 