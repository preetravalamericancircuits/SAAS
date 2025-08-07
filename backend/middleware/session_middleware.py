import json
import redis.asyncio as redis
from typing import Optional, Dict, Any
from datetime import timedelta
import logging
from fastapi import Request, Response, HTTPException
from jose import jwt, JWTError
from config import settings

logger = logging.getLogger(__name__)

class RedisSessionManager:
    def __init__(self):
        self.redis_client = None
        self.session_ttl = 86400  # 24 hours
    
    async def init_redis(self):
        """Initialize Redis connection"""
        self.redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            db=1,  # Use separate DB for sessions
            decode_responses=True
        )
        logger.info("Redis session manager initialized")
    
    async def create_session(self, user_id: int, session_data: Dict[str, Any]) -> str:
        """Create new session in Redis"""
        try:
            session_id = f"session:{user_id}:{self._generate_session_id()}"
            session_data.update({
                "user_id": user_id,
                "created_at": str(self._get_timestamp()),
                "last_activity": str(self._get_timestamp())
            })
            
            await self.redis_client.setex(
                session_id,
                self.session_ttl,
                json.dumps(session_data)
            )
            
            logger.info(f"Session created for user {user_id}")
            return session_id
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data from Redis"""
        try:
            session_data = await self.redis_client.get(session_id)
            if session_data:
                data = json.loads(session_data)
                # Update last activity
                data["last_activity"] = str(self._get_timestamp())
                await self.redis_client.setex(
                    session_id,
                    self.session_ttl,
                    json.dumps(data)
                )
                return data
            return None
        except Exception as e:
            logger.error(f"Error retrieving session: {e}")
            return None
    
    async def delete_session(self, session_id: str):
        """Delete session from Redis"""
        try:
            await self.redis_client.delete(session_id)
            logger.info(f"Session {session_id} deleted")
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
    
    async def delete_all_user_sessions(self, user_id: int):
        """Delete all sessions for a user"""
        try:
            pattern = f"session:{user_id}:*"
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Deleted {len(keys)} sessions for user {user_id}")
        except Exception as e:
            logger.error(f"Error deleting user sessions: {e}")
    
    async def get_active_sessions(self, user_id: int) -> int:
        """Get count of active sessions for user"""
        try:
            pattern = f"session:{user_id}:*"
            keys = await self.redis_client.keys(pattern)
            return len(keys)
        except Exception as e:
            logger.error(f"Error counting active sessions: {e}")
            return 0
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        import uuid
        return str(uuid.uuid4())[:8]
    
    def _get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow()

# Global session manager instance
session_manager = RedisSessionManager()

# Middleware for session validation
async def session_middleware(request: Request, call_next):
    """Middleware to validate Redis sessions"""
    from fastapi.responses import JSONResponse
    
    # Skip session validation for public endpoints
    public_paths = ["/api/auth/login", "/api/auth/register", "/api/health", "/docs", "/openapi.json"]
    if any(request.url.path.startswith(path) for path in public_paths):
        response = await call_next(request)
        return response
    
    # Check for session token
    session_token = request.headers.get("X-Session-Token")
    if not session_token:
        response = await call_next(request)
        return response
    
    # Validate session
    session_data = await session_manager.get_session(session_token)
    if not session_data:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or expired session"}
        )
    
    # Add session data to request state
    request.state.session_data = session_data
    request.state.user_id = session_data.get("user_id")
    
    response = await call_next(request)
    return response
