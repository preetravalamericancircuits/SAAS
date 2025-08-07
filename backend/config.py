from pydantic import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://aci_user:aci_password@localhost:5432/aci_db"
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_password: str = "redis_password"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # CDN Configuration
    cdn_url: Optional[str] = None
    cdn_enabled: bool = False
    
    # Cache Configuration
    cache_ttl: int = 3600  # 1 hour default
    cache_prefix: str = "saas_cache"
    
    # Environment
    environment: str = "development"
    debug: bool = False
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # Sentry
    sentry_dsn: Optional[str] = None
    
    # Application
    app_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"

settings = Settings()
