#!/usr/bin/env python3
"""
Docker CLI Tool for SAAS Application
Command-line interface for managing Docker services
"""

import argparse
import json
from container_manager import ContainerManager
from health_checker import HealthChecker
from compose_generator import save_compose_file

def main():
    parser = argparse.ArgumentParser(description='SAAS Docker Management CLI')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Show service status')
    status_parser.add_argument('--service', help='Specific service name')
    
    # Health command
    health_parser = subparsers.add_parser('health', help='Run health checks')
    
    # Start command
    start_parser = subparsers.add_parser('start', help='Start service')
    start_parser.add_argument('service', help='Service name to start')
    
    # Stop command
    stop_parser = subparsers.add_parser('stop', help='Stop service')
    stop_parser.add_argument('service', help='Service name to stop')
    
    # Restart command
    restart_parser = subparsers.add_parser('restart', help='Restart service')
    restart_parser.add_argument('service', help='Service name to restart')
    
    # Logs command
    logs_parser = subparsers.add_parser('logs', help='Show service logs')
    logs_parser.add_argument('service', help='Service name')
    logs_parser.add_argument('--lines', type=int, default=100, help='Number of lines')
    
    # Generate command
    gen_parser = subparsers.add_parser('generate', help='Generate docker-compose.yml')
    
    args = parser.parse_args()
    
    manager = ContainerManager()
    health_checker = HealthChecker()
    
    if args.command == 'status':
        if args.service:
            status = manager.get_service_status(args.service)
            print(json.dumps(status, indent=2))
        else:
            statuses = manager.get_all_services_status()
            print(json.dumps(statuses, indent=2))
    
    elif args.command == 'health':
        health_report = health_checker.run_full_health_check()
        print(json.dumps(health_report, indent=2))
    
    elif args.command == 'start':
        success = manager.start_service(args.service)
        print(f"Service {args.service}: {'started' if success else 'failed to start'}")
    
    elif args.command == 'stop':
        success = manager.stop_service(args.service)
        print(f"Service {args.service}: {'stopped' if success else 'failed to stop'}")
    
    elif args.command == 'restart':
        success = manager.restart_service(args.service)
        print(f"Service {args.service}: {'restarted' if success else 'failed to restart'}")
    
    elif args.command == 'logs':
        logs = manager.get_service_logs(args.service, args.lines)
        print(logs)
    
    elif args.command == 'generate':
        save_compose_file()
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()