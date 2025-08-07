from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
import redis.asyncio as redis
from typing import Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

class CacheConfig:
    def __init__(self):
        self.redis_client = None
        self.cache_ttl = settings.cache_ttl
    
    async def init_cache(self):
        """Initialize Redis cache"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                password=settings.redis_password,
                decode_responses=True
            )
            
            backend = RedisBackend(self.redis_client)
            FastAPICache.init(backend, prefix="saas-cache")
            logger.info("Redis cache initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing cache: {e}")
            raise
    
    async def close_cache(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()

# Global cache config instance
cache_config = CacheConfig()
