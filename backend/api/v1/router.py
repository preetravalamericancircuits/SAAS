from fastapi import APIRouter
from . import auth, users, me, csrf, token_info

# Create v1 API router
v1_router = APIRouter(prefix="/v1")

# Include sub-routers
v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
v1_router.include_router(users.router, prefix="/users", tags=["Users"])
v1_router.include_router(me.router, prefix="/me", tags=["Current User"])
v1_router.include_router(csrf.router, prefix="/csrf", tags=["CSRF Protection"])
v1_router.include_router(token_info.router, prefix="/token", tags=["Token Info"])