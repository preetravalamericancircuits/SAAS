# FastAPI Backend with Role-Based Access Control

A comprehensive FastAPI backend with JWT authentication, role-based access control, and PostgreSQL database integration.

## Features

- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Fine-grained permissions system with dependency injection
- **User Management**: Complete CRUD operations for user management
- **Role Management**: Create and manage roles with specific permissions
- **Permission System**: Granular permission-based access control
- **Admin Routes**: Special admin-only endpoints for user promotion and system management
- **PostgreSQL Integration**: Dockerized PostgreSQL database with SQLAlchemy ORM
- **Input Validation**: Comprehensive Pydantic validation with custom validators
- **Error Handling**: Proper HTTP status codes and error messages

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.8+

### Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp ../env.sample .env
   # Edit .env with your configuration
   ```

4. **Initialize the database:**
   ```bash
   python init_db.py
   ```

5. **Run the application:**
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user information

### User Management (Requires permissions)

- `GET /api/users` - Get all users (requires `user:read`)
- `GET /api/users/{user_id}` - Get specific user (requires `user:read`)
- `POST /api/users` - Create new user (requires `user:create`)
- `PUT /api/users/{user_id}` - Update user (requires `user:update`)
- `DELETE /api/users/{user_id}` - Delete user (requires `user:delete`)

### Admin Routes

- `POST /api/admin/promote-user` - Promote user to different role (Admin only)

### Role Management (Requires permissions)

- `GET /api/roles` - Get all roles (requires `role:read`)
- `POST /api/roles` - Create new role (requires `role:create`)

### Permission Management (Requires permissions)

- `GET /api/permissions` - Get all permissions (requires `permission:read`)
- `POST /api/permissions` - Create new permission (requires `permission:create`)

### Person Management (Requires permissions)

- `GET /api/persons` - Get all persons (requires `person:read`)
- `GET /api/persons/{person_id}` - Get specific person (requires `person:read`)
- `POST /api/persons` - Create new person (requires `person:create`)
- `PUT /api/persons/{person_id}` - Update person (requires `person:update`)
- `DELETE /api/persons/{person_id}` - Delete person (requires `person:delete`)

## Role-Based Access Control

### Available Roles

1. **SuperUser**: Full system access with all permissions
2. **Admin**: Administrative access with user and role management
3. **Manager**: Manager access with limited user management
4. **User**: Standard user access
5. **Guest**: Limited read-only access

### Permission System

The system uses a granular permission system with the following permissions:

#### User Management
- `user:read` - Read user information
- `user:create` - Create new users
- `user:update` - Update user information
- `user:delete` - Delete users

#### Role Management
- `role:read` - Read role information
- `role:create` - Create new roles
- `role:update` - Update role information
- `role:delete` - Delete roles

#### Permission Management
- `permission:read` - Read permission information
- `permission:create` - Create new permissions
- `permission:update` - Update permission information
- `permission:delete` - Delete permissions

#### Person Management
- `person:read` - Read person information
- `person:create` - Create new persons
- `person:update` - Update person information
- `person:delete` - Delete persons

#### System
- `system:admin` - Full system administration access
- `system:read` - Read system information

## Usage Examples

### Authentication

```python
import requests

# Register a new user
register_data = {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "confirm_password": "securepassword123"
}
response = requests.post("http://localhost:8000/api/auth/register", json=register_data)

# Login
login_data = {
    "username": "john_doe",
    "password": "securepassword123"
}
response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
token = response.json()["access_token"]

# Use token for authenticated requests
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/auth/me", headers=headers)
```

### Role-Based Access Control

The system provides several dependency functions for role-based access:

```python
# Require specific role
@requires_role("Admin")

# Require specific permission
@requires_permission("user:create")

# Require any of multiple roles
@requires_any_role(["Admin", "Manager"])

# Require admin access
@is_admin
```

### Admin Operations

```python
# Promote a user to admin role
promote_data = {
    "user_id": 2,
    "role_id": 1  # Admin role ID
}
response = requests.post(
    "http://localhost:8000/api/admin/promote-user",
    json=promote_data,
    headers={"Authorization": f"Bearer {admin_token}"}
)
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `hashed_password`: Bcrypt hashed password
- `is_active`: Account status
- `role_id`: Foreign key to roles table
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Roles Table
- `id`: Primary key
- `name`: Role name
- `description`: Role description
- `created_at`: Role creation timestamp

### Permissions Table
- `id`: Primary key
- `name`: Permission name
- `description`: Permission description
- `created_at`: Permission creation timestamp

### Role-Permission Association
Many-to-many relationship between roles and permissions through `role_permissions` table.

## Default Users

After running `init_db.py`, the following default user is created:

- **Username**: admin
- **Password**: admin123
- **Email**: admin@example.com
- **Role**: SuperUser

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://aci_user:aci_password@postgres:5432/aci_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://frontend:3000"]
```

## Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Fine-grained permission system
- **Input Validation**: Comprehensive Pydantic validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS Protection**: Configurable CORS middleware

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error (Pydantic validation)
- `500`: Internal Server Error

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Formatting

```bash
# Install formatting tools
pip install black isort

# Format code
black .
isort .
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker Support

The backend is designed to work with Docker Compose. The database URL is configured to connect to the PostgreSQL service in the Docker network.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 