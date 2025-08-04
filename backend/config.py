from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://aci_user:aci_password@localhost:5432/aci_db"
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # Logging
    log_level: str = "DEBUG"
    log_format: str = "detailed"
    log_file_max_size: int = 10485760  # 10MB
    log_file_backup_count: int = 5
    
    # CORS Configuration
    allowed_origins: list = ["http://localhost:3000", "http://frontend:3000"]
    allowed_methods: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: list = ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"]
    allow_credentials: bool = True
    max_age: int = 86400  # 24 hours
    
    @property
    def cors_origins(self) -> list:
        if self.environment == "production":
            return [origin for origin in self.allowed_origins if not origin.startswith("http://localhost")]
        return self.allowed_origins
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings() 