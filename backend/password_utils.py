"""
Password generation utilities for secure user creation
"""

import secrets
import string
from typing import str

def generate_secure_password(length: int = 12) -> str:
    """
    Generate a cryptographically secure random password.
    
    Args:
        length: Password length (default 12)
        
    Returns:
        Secure random password string
    """
    # Use URL-safe characters for better compatibility
    return secrets.token_urlsafe(length)

def generate_readable_password(length: int = 12) -> str:
    """
    Generate a secure but more readable password with mixed characters.
    
    Args:
        length: Password length (default 12)
        
    Returns:
        Secure random password with letters, digits, and symbols
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))