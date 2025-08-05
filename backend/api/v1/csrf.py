from fastapi import APIRouter, Response
from csrf_protection import csrf_protection

router = APIRouter()

@router.get("/token")
async def get_csrf_token(response: Response):
    """Get CSRF token for client-side requests"""
    if not csrf_protection:
        return {"error": "CSRF protection not initialized"}
    
    token = csrf_protection.generate_csrf_token()
    
    # Set CSRF token in cookie for double-submit pattern
    response.set_cookie(
        key="csrf_token",
        value=token,
        httponly=False,  # Allow JavaScript access for header
        secure=True,     # HTTPS only in production
        samesite="strict",
        max_age=3600     # 1 hour
    )
    
    return {"csrf_token": token}