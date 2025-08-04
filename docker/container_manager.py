"""
Docker Container Manager
Manages Docker containers using the defined models
"""

import docker
from typing import List, Dict
from models import DOCKER_SERVICES, ServiceType, HealthStatus

class ContainerManager:
    def __init__(self):
        self.client = docker.from_env()
    
    def get_service_status(self, service_name: str) -> Dict:
        """Get status of a specific service"""
        try:
            container = self.client.containers.get(f"saas_{service_name}")
            return {
                'name': service_name,
                'status': container.status,
                'health': self._get_health_status(container),
                'ports': container.ports,
                'image': container.image.tags[0] if container.image.tags else 'unknown'
            }
        except docker.errors.NotFound:
            return {
                'name': service_name,
                'status': 'not_found',
                'health': HealthStatus.UNKNOWN.value,
                'ports': {},
                'image': 'unknown'
            }
    
    def get_all_services_status(self) -> List[Dict]:
        """Get status of all services"""
        return [self.get_service_status(service.name) for service in DOCKER_SERVICES]
    
    def start_service(self, service_name: str) -> bool:
        """Start a specific service"""
        try:
            container = self.client.containers.get(f"saas_{service_name}")
            container.start()
            return True
        except docker.errors.NotFound:
            return False
    
    def stop_service(self, service_name: str) -> bool:
        """Stop a specific service"""
        try:
            container = self.client.containers.get(f"saas_{service_name}")
            container.stop()
            return True
        except docker.errors.NotFound:
            return False
    
    def restart_service(self, service_name: str) -> bool:
        """Restart a specific service"""
        try:
            container = self.client.containers.get(f"saas_{service_name}")
            container.restart()
            return True
        except docker.errors.NotFound:
            return False
    
    def get_service_logs(self, service_name: str, lines: int = 100) -> str:
        """Get logs from a specific service"""
        try:
            container = self.client.containers.get(f"saas_{service_name}")
            return container.logs(tail=lines).decode('utf-8')
        except docker.errors.NotFound:
            return f"Container saas_{service_name} not found"
    
    def _get_health_status(self, container) -> str:
        """Get health status from container"""
        if hasattr(container, 'attrs') and 'State' in container.attrs:
            health = container.attrs['State'].get('Health', {})
            if health:
                return health.get('Status', HealthStatus.UNKNOWN.value)
        return HealthStatus.UNKNOWN.value
    
    def get_services_by_type(self, service_type: ServiceType) -> List[Dict]:
        """Get services filtered by type"""
        services = []
        for service in DOCKER_SERVICES:
            if service.service_type == service_type:
                services.append(self.get_service_status(service.name))
        return services