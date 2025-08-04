"""
Docker Models for SAAS Application
Defines container configurations and service models
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class ServiceType(Enum):
    DATABASE = "database"
    BACKEND = "backend"
    FRONTEND = "frontend"
    PROXY = "proxy"
    CACHE = "cache"
    MONITORING = "monitoring"

class HealthStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    STARTING = "starting"
    UNKNOWN = "unknown"

@dataclass
class DockerService:
    name: str
    image: str
    container_name: str
    ports: List[str]
    environment: Dict[str, str]
    volumes: List[str]
    networks: List[str]
    depends_on: List[str]
    service_type: ServiceType
    health_check: Optional[Dict[str, str]] = None
    restart_policy: str = "unless-stopped"

@dataclass
class DockerNetwork:
    name: str
    driver: str = "bridge"
    subnet: str = "172.25.0.0/16"

@dataclass
class DockerVolume:
    name: str
    driver: str = "local"

# Service Definitions
POSTGRES_SERVICE = DockerService(
    name="postgres",
    image="postgres:15-alpine",
    container_name="saas_postgres",
    ports=["5432:5432"],
    environment={
        "POSTGRES_DB": "aci_db",
        "POSTGRES_USER": "aci_user",
        "POSTGRES_PASSWORD": "aci_password"
    },
    volumes=["postgres_data:/var/lib/postgresql/data"],
    networks=["saas_network"],
    depends_on=[],
    service_type=ServiceType.DATABASE,
    health_check={
        "test": "pg_isready -U aci_user -d aci_db",
        "interval": "10s",
        "timeout": "5s",
        "retries": "5"
    }
)

BACKEND_SERVICE = DockerService(
    name="backend",
    image="saas_backend:latest",
    container_name="saas_backend",
    ports=["8000:8000"],
    environment={
        "DATABASE_URL": "postgresql://aci_user:aci_password@postgres:5432/aci_db"
    },
    volumes=["./backend:/app"],
    networks=["saas_network"],
    depends_on=["postgres"],
    service_type=ServiceType.BACKEND,
    health_check={
        "test": "curl -f http://localhost:8000/api/health",
        "interval": "30s",
        "timeout": "10s",
        "retries": "3"
    }
)

FRONTEND_SERVICE = DockerService(
    name="frontend",
    image="saas_frontend:latest",
    container_name="saas_frontend",
    ports=["3000:3000"],
    environment={
        "NEXT_PUBLIC_API_URL": "http://localhost:8000"
    },
    volumes=["./frontend:/app"],
    networks=["saas_network"],
    depends_on=["backend"],
    service_type=ServiceType.FRONTEND,
    health_check={
        "test": "curl -f http://localhost:3000",
        "interval": "30s",
        "timeout": "10s",
        "retries": "3"
    }
)

NGINX_SERVICE = DockerService(
    name="nginx",
    image="nginx:alpine",
    container_name="saas_nginx",
    ports=["80:80", "443:443"],
    environment={},
    volumes=["./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro"],
    networks=["saas_network"],
    depends_on=["frontend", "backend"],
    service_type=ServiceType.PROXY
)

REDIS_SERVICE = DockerService(
    name="redis",
    image="redis:7-alpine",
    container_name="saas_redis",
    ports=["6379:6379"],
    environment={},
    volumes=["redis_data:/data"],
    networks=["saas_network"],
    depends_on=[],
    service_type=ServiceType.CACHE
)

# Network and Volume Definitions
SAAS_NETWORK = DockerNetwork(name="saas_network")

DOCKER_VOLUMES = [
    DockerVolume("postgres_data"),
    DockerVolume("redis_data"),
    DockerVolume("backend_logs"),
    DockerVolume("frontend_logs"),
    DockerVolume("nginx_logs")
]

# Complete Service Stack
DOCKER_SERVICES = [
    POSTGRES_SERVICE,
    BACKEND_SERVICE,
    FRONTEND_SERVICE,
    NGINX_SERVICE,
    REDIS_SERVICE
]