"""
Docker Compose Generator
Generates docker-compose.yml from Docker models
"""

import yaml
from models import DOCKER_SERVICES, SAAS_NETWORK, DOCKER_VOLUMES

def generate_compose_config():
    """Generate docker-compose configuration from models"""
    
    services = {}
    
    for service in DOCKER_SERVICES:
        service_config = {
            'image': service.image,
            'container_name': service.container_name,
            'ports': service.ports,
            'environment': service.environment,
            'volumes': service.volumes,
            'networks': service.networks,
            'restart': service.restart_policy
        }
        
        if service.depends_on:
            service_config['depends_on'] = service.depends_on
            
        if service.health_check:
            service_config['healthcheck'] = {
                'test': ['CMD-SHELL', service.health_check['test']],
                'interval': service.health_check['interval'],
                'timeout': service.health_check['timeout'],
                'retries': int(service.health_check['retries'])
            }
        
        services[service.name] = service_config
    
    # Generate volumes
    volumes = {vol.name: {'driver': vol.driver} for vol in DOCKER_VOLUMES}
    
    # Generate networks
    networks = {
        SAAS_NETWORK.name: {
            'driver': SAAS_NETWORK.driver,
            'ipam': {
                'config': [{'subnet': SAAS_NETWORK.subnet}]
            }
        }
    }
    
    compose_config = {
        'services': services,
        'volumes': volumes,
        'networks': networks
    }
    
    return compose_config

def save_compose_file(filename='docker-compose.generated.yml'):
    """Save generated compose configuration to file"""
    config = generate_compose_config()
    
    with open(filename, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, indent=2)
    
    print(f"Generated {filename}")

if __name__ == "__main__":
    save_compose_file()