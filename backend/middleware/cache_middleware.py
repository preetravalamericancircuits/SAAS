import json
import hashlib
from typing import Optional, Any
from fastapi import Request, Response
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
import redis.asyncio as redis
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

class CacheMiddleware:
    def __init__(self, redis_client: redis.Redis, cache_ttl: int = 3600):
        self.redis_client = redis_client
        self.cache_ttl = cache_ttl
    
    async def init_cache(self):
        """Initialize Redis cache backend"""
        backend = RedisBackend(self.redis_client)
        FastAPICache.init(backend, prefix="saas-cache")
        logger.info("Redis cache initialized successfully")
    
    def generate_cache_key(self, request: Request) -> str:
        """Generate cache key from request"""
        key_parts = [
            request.method,
            str(request.url),
            request.headers.get("authorization", ""),
        ]
        
        # Include query parameters
        if request.query_params:
            key_parts.append(str(request.query_params))
        
        key_string = "|".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    async def get_cached_response(self, key: str) -> Optional[Any]:
        """Get cached response from Redis"""
        try:
            cached_data = await self.redis_client.get(key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Error retrieving cached response: {e}")
        return None
    
    async def set_cached_response(self, key: str, response_data: Any, ttl: Optional[int] = None):
        """Cache response in Redis"""
        try:
            ttl = ttl or self.cache_ttl
            await self.redis_client.setex(
                key,
                ttl,
                json.dumps(response_data, default=str)
            )
        except Exception as e:
            logger.error(f"Error caching response: {e}")
    
    async def invalidate_cache_pattern(self, pattern: str):
        """Invalidate cache entries matching pattern"""
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries")
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")

# Cache decorator for specific endpoints
def cache_endpoint(expire: int = 3600, key_builder=None):
    """Decorator for caching API endpoints"""
    return cache(expire=expire, key_builder=key_builder)

# Cache invalidation helpers
async def invalidate_user_cache(user_id: int):
    """Invalidate all cache entries for a specific user"""
    cache = CacheMiddleware(None)  # Will use existing Redis client
    await cache.invalidate_cache_pattern(f"saas-cache:*user:{user_id}*")

async def invalidate_api_cache(endpoint: str):
    """Invalidate cache for specific API endpoint"""
    cache = CacheMiddleware(None)
    await cache.invalidate_cache_pattern(f"saas-cache:*{endpoint}*")
