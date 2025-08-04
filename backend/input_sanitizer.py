import re
import html
from typing import Any, Dict, List, Optional
from pydantic import validator

class InputSanitizer:
    """Comprehensive input sanitization and validation utilities"""
    
    # Regex patterns for validation
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{3,50}$')
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PASSWORD_PATTERN = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$')
    ROLE_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9_\s-]{2,50}$')
    
    # Dangerous patterns to remove
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
    ]
    
    SQL_INJECTION_PATTERNS = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
        r'(--|#|/\*|\*/)',
        r'(\bOR\b.*=.*\bOR\b)',
        r'(\bAND\b.*=.*\bAND\b)',
    ]
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: int = 255) -> str:
        """Sanitize string input by removing dangerous patterns and HTML encoding"""
        if not isinstance(value, str):
            return str(value)
        
        # Trim whitespace
        value = value.strip()
        
        # Limit length
        if len(value) > max_length:
            value = value[:max_length]
        
        # Remove XSS patterns
        for pattern in cls.XSS_PATTERNS:
            value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        # Remove SQL injection patterns
        for pattern in cls.SQL_INJECTION_PATTERNS:
            value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        # HTML encode
        value = html.escape(value)
        
        return value
    
    @classmethod
    def validate_username(cls, username: str) -> str:
        """Validate and sanitize username"""
        username = cls.sanitize_string(username, 50)
        if not cls.USERNAME_PATTERN.match(username):
            raise ValueError("Username must be 3-50 characters, alphanumeric, underscore, or dash only")
        return username
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate and sanitize email"""
        email = cls.sanitize_string(email, 255).lower()
        if not cls.EMAIL_PATTERN.match(email):
            raise ValueError("Invalid email format")
        return email
    
    @classmethod
    def validate_password(cls, password: str) -> str:
        """Validate password strength"""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(password) > 128:
            raise ValueError("Password too long")
        if not re.search(r'[a-z]', password):
            raise ValueError("Password must contain lowercase letter")
        if not re.search(r'[A-Z]', password):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r'\d', password):
            raise ValueError("Password must contain number")
        return password
    
    @classmethod
    def validate_role_name(cls, role_name: str) -> str:
        """Validate and sanitize role name"""
        role_name = cls.sanitize_string(role_name, 50)
        if not cls.ROLE_NAME_PATTERN.match(role_name):
            raise ValueError("Role name must be 2-50 characters, alphanumeric, spaces, underscore, or dash only")
        return role_name
    
    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize dictionary values"""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = cls.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [cls.sanitize_string(item) if isinstance(item, str) else item for item in value]
            else:
                sanitized[key] = value
        return sanitized

# Pydantic validators for common fields
def username_validator(cls, v):
    return InputSanitizer.validate_username(v)

def email_validator(cls, v):
    return InputSanitizer.validate_email(v)

def password_validator(cls, v):
    return InputSanitizer.validate_password(v)

def role_name_validator(cls, v):
    return InputSanitizer.validate_role_name(v)

def sanitize_string_validator(max_length: int = 255):
    def validator_func(cls, v):
        return InputSanitizer.sanitize_string(v, max_length)
    return validator_func