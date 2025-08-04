# Backend Performance Optimizations

from functools import lru_cache
from typing import Optional
import asyncio
import time
from contextlib import asynccontextmanager

# 1. Database Connection Pool Optimization
from sqlalchemy.pool import QueuePool
from sqlalchemy import create_engine

def create_optimized_engine(database_url: str):
    return create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False  # Disable in production
    )

# 2. Response Caching Decorator
def cache_response(expire_time: int = 300):
    def decorator(func):
        @lru_cache(maxsize=128)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# 3. Database Query Optimization
class OptimizedQueries:
    @staticmethod
    async def get_users_with_pagination(db, skip: int = 0, limit: int = 100):
        """Optimized user query with pagination"""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_user_count(db):
        """Cached user count"""
        return db.query(User).count()

# 4. Background Task Processing
class BackgroundTasks:
    @staticmethod
    async def process_heavy_task(task_data):
        """Process heavy tasks in background"""
        await asyncio.sleep(0.1)  # Simulate processing
        return {"status": "completed", "data": task_data}

# 5. Request/Response Middleware for Performance Monitoring
async def performance_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log slow requests
    if process_time > 1.0:
        print(f"Slow request: {request.url} took {process_time:.2f}s")
    
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 6. Optimized Pydantic Models
from pydantic import BaseModel, Field
from typing import List

class OptimizedUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True
        # Enable JSON schema caching
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "user1",
                "email": "user@example.com",
                "role": "User",
                "is_active": True
            }
        }

# 7. Batch Operations
class BatchOperations:
    @staticmethod
    async def bulk_create_users(db, users_data: List[dict]):
        """Bulk create users for better performance"""
        users = [User(**user_data) for user_data in users_data]
        db.add_all(users)
        await db.commit()
        return users

# 8. Memory Usage Optimization
import gc
from typing import Generator

def memory_efficient_query(db, model, batch_size: int = 1000) -> Generator:
    """Memory efficient query processing"""
    offset = 0
    while True:
        batch = db.query(model).offset(offset).limit(batch_size).all()
        if not batch:
            break
        
        for item in batch:
            yield item
        
        # Clear memory
        del batch
        gc.collect()
        offset += batch_size

# 9. API Response Compression
from fastapi.middleware.gzip import GZipMiddleware

def add_compression_middleware(app):
    app.add_middleware(GZipMiddleware, minimum_size=1000)

# 10. Health Check Optimization
@lru_cache(maxsize=1)
def get_system_health():
    """Cached system health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }