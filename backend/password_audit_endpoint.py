"""
Password audit endpoint for monitoring password generation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from database import get_db
from models import User
from auth import requires_permission
from password_security import password_security_manager

router = APIRouter()

@router.get("/api/admin/password-audit", response_model=List[Dict])
async def get_password_audit_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("system:admin"))
):
    """
    Get password generation audit log (SuperUser only).
    Returns audit trail of all password generations without actual passwords.
    """
    return password_security_manager.get_password_audit_log()

@router.post("/api/admin/validate-password-policy")
async def validate_password_policy(
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(requires_permission("system:admin"))
):
    """
    Validate a password against security policy (SuperUser only).
    """
    validation_result = password_security_manager.validate_password_policy(password)
    
    # Calculate overall compliance
    all_checks_passed = all(validation_result.values())
    
    return {
        "password_valid": all_checks_passed,
        "policy_checks": validation_result,
        "recommendations": _get_password_recommendations(validation_result)
    }

def _get_password_recommendations(validation_result: Dict[str, bool]) -> List[str]:
    """Generate password improvement recommendations"""
    recommendations = []
    
    if not validation_result['min_length']:
        recommendations.append("Password must be at least 8 characters long")
    if not validation_result['has_lowercase']:
        recommendations.append("Include at least one lowercase letter")
    if not validation_result['has_uppercase']:
        recommendations.append("Include at least one uppercase letter")
    if not validation_result['has_digit']:
        recommendations.append("Include at least one number")
    if not validation_result['has_symbol']:
        recommendations.append("Include at least one special character (!@#$%^&*)")
    if not validation_result['no_common_patterns']:
        recommendations.append("Avoid common words and patterns")
    
    return recommendations