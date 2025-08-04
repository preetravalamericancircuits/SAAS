import logging
import logging.config
import json
import sys
from datetime import datetime
from typing import Dict, Any
from config import settings

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'ip_address'):
            log_entry['ip_address'] = record.ip_address
        if hasattr(record, 'endpoint'):
            log_entry['endpoint'] = record.endpoint
        if hasattr(record, 'method'):
            log_entry['method'] = record.method
        if hasattr(record, 'status_code'):
            log_entry['status_code'] = record.status_code
        if hasattr(record, 'duration'):
            log_entry['duration_ms'] = record.duration
            
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)

def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration based on environment"""
    
    if settings.environment == "production":
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json": {
                    "()": JSONFormatter,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "json",
                    "stream": sys.stdout,
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "json",
                    "filename": "logs/app.log",
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                },
                "error_file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "json",
                    "filename": "logs/error.log",
                    "maxBytes": 10485760,  # 10MB
                    "backupCount": 5,
                    "level": "ERROR",
                },
            },
            "loggers": {
                "": {  # Root logger
                    "handlers": ["console", "file", "error_file"],
                    "level": "INFO",
                    "propagate": False,
                },
                "uvicorn": {
                    "handlers": ["console", "file"],
                    "level": "INFO",
                    "propagate": False,
                },
                "sqlalchemy.engine": {
                    "handlers": ["file"],
                    "level": "WARNING",
                    "propagate": False,
                },
            },
        }
    else:
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "detailed": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "detailed",
                    "stream": sys.stdout,
                },
            },
            "loggers": {
                "": {  # Root logger
                    "handlers": ["console"],
                    "level": "DEBUG" if settings.debug else "INFO",
                    "propagate": False,
                },
            },
        }

def setup_logging():
    """Setup logging configuration"""
    import os
    
    # Create logs directory if it doesn't exist
    if settings.environment == "production":
        os.makedirs("logs", exist_ok=True)
    
    config = get_logging_config()
    logging.config.dictConfig(config)
    
    # Get logger and log startup
    logger = logging.getLogger(__name__)
    logger.info("Logging configured", extra={
        "environment": settings.environment,
        "debug": settings.debug
    })

# Create logger instance
logger = logging.getLogger(__name__)