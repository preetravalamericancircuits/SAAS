"""
Enhanced password security utilities with logging and validation
"""

import secrets
import string
import logging
from datetime import datetime
from typing import Dict, List
from password_utils import generate_strong_password, hash_password

# Configure logging for password operations
logging.basicConfig(level=logging.INFO)
password_logger = logging.getLogger('password_security')

class PasswordSecurityManager:
    """Manages secure password operations with audit logging"""
    
    def __init__(self):
        self.password_history: List[Dict] = []
    
    def create_user_password(self, username: str, email: str, created_by: str, length: int = 12) -> Dict[str, str]:
        """
        Create a secure password for a new user with full audit logging.
        
        Args:
            username: Username for the new user
            email: Email for the new user
            created_by: Username of the admin creating the user
            length: Password length (minimum 8, default 12)
            
        Returns:
            Dict containing plain_password and hashed_password
        """
        # Generate strong password
        plain_password = generate_strong_password(length)
        hashed_password = hash_password(plain_password)
        
        # Create audit entry
        audit_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'username': username,
            'email': email,
            'created_by': created_by,
            'password_length': len(plain_password),
            'password_strength': self._assess_password_strength(plain_password)
        }
        
        # Log the password creation (without the actual password)
        password_logger.info(
            f"Password generated for user: {username} | "
            f"Email: {email} | "
            f"Created by: {created_by} | "
            f"Length: {length} | "
            f"Strength: {audit_entry['password_strength']}"
        )
        
        # Store audit entry (without password)
        self.password_history.append(audit_entry)
        
        return {
            'plain_password': plain_password,
            'hashed_password': hashed_password
        }
    
    def _assess_password_strength(self, password: str) -> str:
        """
        Assess password strength based on character composition.
        
        Args:
            password: Plain text password
            
        Returns:
            Strength assessment string
        """
        score = 0
        
        # Length check
        if len(password) >= 12:
            score += 2
        elif len(password) >= 8:
            score += 1
        
        # Character type checks
        if any(c.islower() for c in password):
            score += 1
        if any(c.isupper() for c in password):
            score += 1
        if any(c.isdigit() for c in password):
            score += 1
        if any(c in "!@#$%^&*" for c in password):
            score += 1
        
        # Return strength assessment
        if score >= 6:
            return "Very Strong"
        elif score >= 4:
            return "Strong"
        elif score >= 3:
            return "Medium"
        else:
            return "Weak"
    
    def get_password_audit_log(self) -> List[Dict]:
        """
        Get the password creation audit log.
        
        Returns:
            List of audit entries
        """
        return self.password_history.copy()
    
    def validate_password_policy(self, password: str) -> Dict[str, bool]:
        """
        Validate password against security policy.
        
        Args:
            password: Plain text password to validate
            
        Returns:
            Dict with validation results
        """
        return {
            'min_length': len(password) >= 8,
            'has_lowercase': any(c.islower() for c in password),
            'has_uppercase': any(c.isupper() for c in password),
            'has_digit': any(c.isdigit() for c in password),
            'has_symbol': any(c in "!@#$%^&*" for c in password),
            'no_common_patterns': not self._has_common_patterns(password)
        }
    
    def _has_common_patterns(self, password: str) -> bool:
        """Check for common weak patterns in password"""
        common_patterns = [
            'password', '123456', 'qwerty', 'admin', 'login',
            'welcome', 'monkey', 'dragon', 'master', 'shadow'
        ]
        password_lower = password.lower()
        return any(pattern in password_lower for pattern in common_patterns)

# Global instance for use across the application
password_security_manager = PasswordSecurityManager()