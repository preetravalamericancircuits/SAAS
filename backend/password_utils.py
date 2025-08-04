"""
Password generation utilities for secure user creation
"""

import secrets
import string
from passlib.context import CryptContext
from typing import Tuple

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_strong_password(length: int = 12) -> str:
    """
    Generate a cryptographically secure strong password.
    
    Args:
        length: Password length (default 12)
        
    Returns:
        Strong random password with mixed character types
    """
    # Ensure minimum complexity requirements
    if length < 8:
        length = 8
    
    # Character sets for strong passwords
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*"
    
    # Ensure at least one character from each set
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(symbols)
    ]
    
    # Fill remaining length with random choices from all sets
    all_chars = lowercase + uppercase + digits + symbols
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Bcrypt hashed password
    """
    return pwd_context.hash(password)

def generate_and_hash_password(length: int = 12) -> Tuple[str, str]:
    """
    Generate a strong password and return both plain and hashed versions.
    
    Args:
        length: Password length (default 12)
        
    Returns:
        Tuple of (plain_password, hashed_password)
    """
    plain_password = generate_strong_password(length)
    hashed_password = hash_password(plain_password)
    return plain_password, hashed_password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Bcrypt hashed password
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)