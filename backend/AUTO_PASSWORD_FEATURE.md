# 🔐 Auto-Generated Password Feature

## Overview
This feature provides secure, unique password generation for every user created in the system. Instead of requiring manual password input, the system automatically generates cryptographically secure passwords.

## Key Features
- **Cryptographically Secure**: Uses `secrets.token_urlsafe()` for maximum security
- **Unique Per User**: Each user gets a completely unique password
- **One-Time Display**: Generated passwords are shown only once for security
- **Audit Logging**: All password generations are logged for security auditing
- **Dual Endpoints**: Supports both manual and auto-generated password creation

## API Endpoints

### User Creation with Auto-Generated Password
```http
POST /api/users/auto-password
Content-Type: application/json
Cookie: access_token=<jwt_token>

{
    "username": "newuser",
    "email": "newuser@example.com",
    "role_id": 1
}
```

**Response:**
```json
{
    "message": "User newuser created successfully with auto-generated password",
    "user": {
        "id": 123,
        "username": "newuser",
        "email": "newuser@example.com",
        "role": "User",
        "permissions": ["user:read"],
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z"
    },
    "generated_password": "AbC123XyZ789"
}
```

### Person Creation with Auto-Generated Password
```http
POST /api/persons/auto-password
Content-Type: application/json
Cookie: access_token=<jwt_token>

{
    "username": "newperson",
    "email": "newperson@example.com",
    "role": "User"
}
```

## Security Features

### Password Generation
- Uses `secrets.token_urlsafe(12)` for cryptographically secure random passwords
- 12-character length provides excellent security while remaining manageable
- URL-safe characters ensure compatibility across systems

### Security Audit Trail
Every password generation is logged with:
- Username and email of created user
- Role assigned
- Username of admin who created the account
- Timestamp (automatic via logging)

Example log entry:
```
[SECURITY AUDIT] User created with auto-generated password. Username: newuser, Email: newuser@example.com, Created by: admin
```

### One-Time Password Display
- Generated passwords are returned only once in the API response
- Passwords are immediately hashed and stored securely in the database
- No plain-text password storage anywhere in the system

## Usage Examples

### Python/Requests
```python
import requests

# Login as admin
login_response = requests.post("http://localhost:8000/api/auth/login", json={
    "username": "admin",
    "password": "admin_password"
})
cookies = login_response.cookies

# Create user with auto-generated password
user_data = {
    "username": "newuser",
    "email": "newuser@example.com",
    "role_id": 1
}

response = requests.post(
    "http://localhost:8000/api/users/auto-password",
    json=user_data,
    cookies=cookies
)

result = response.json()
print(f"Generated password: {result['generated_password']}")
# Save this password - it won't be shown again!
```

### cURL
```bash
# Login and save cookies
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin_password"}' \
     -c cookies.txt

# Create user with auto-generated password
curl -X POST "http://localhost:8000/api/users/auto-password" \
     -H "Content-Type: application/json" \
     -d '{"username":"newuser","email":"newuser@example.com","role_id":1}' \
     -b cookies.txt
```

## Best Practices

### For Administrators
1. **Save Generated Passwords Immediately**: The password is shown only once
2. **Secure Password Delivery**: Use secure channels to deliver passwords to users
3. **Force Password Change**: Consider requiring users to change auto-generated passwords on first login
4. **Monitor Audit Logs**: Regularly review password generation logs

### For Integration
1. **Handle Response Properly**: Extract and store the `generated_password` field immediately
2. **Error Handling**: Check for duplicate usernames/emails before creation
3. **Permissions**: Ensure the creating user has `user:create` permission

## Testing

Run the included test script:
```bash
cd backend
python test_auto_password.py
```

This will:
1. Login as admin
2. Create a user with auto-generated password
3. Create a person with auto-generated password
4. Test login with the generated passwords
5. Verify the complete workflow

## Migration from Manual Passwords

Existing endpoints remain unchanged:
- `POST /api/users` - Still requires manual password
- `POST /api/persons` - Still requires manual password

New endpoints are additive:
- `POST /api/users/auto-password` - Auto-generates password
- `POST /api/persons/auto-password` - Auto-generates password

## Dependencies

Added to `requirements.txt`:
```
faker==22.0.0
```

The `faker` package provides additional utilities for generating test data, though the core password generation uses Python's built-in `secrets` module.

## Security Considerations

1. **Transport Security**: Always use HTTPS in production
2. **Password Delivery**: Use secure channels to deliver generated passwords
3. **Audit Trail**: Monitor the security audit logs regularly
4. **Access Control**: Only users with `user:create` permission can generate passwords
5. **Password Rotation**: Consider implementing password expiration policies

## Future Enhancements

- Email delivery of generated passwords
- Password complexity configuration
- Temporary password expiration
- Integration with external password managers
- Bulk user creation with auto-generated passwords