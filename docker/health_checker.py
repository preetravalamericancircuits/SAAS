"""
Docker Health Checker
Monitors container health and provides status reports
"""

import time
import requests
from typing import Dict, List
from models import DOCKER_SERVICES
from container_manager import ContainerManager

class HealthChecker:
    def __init__(self):
        self.manager = ContainerManager()
    
    def check_database_health(self) -> Dict:
        """Check PostgreSQL database health"""
        try:
            import psycopg2
            conn = psycopg2.connect(
                host="localhost",
                port="5432",
                database="aci_db",
                user="aci_user",
                password="aci_password"
            )
            conn.close()
            return {"status": "healthy", "message": "Database connection successful"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Database error: {str(e)}"}
    
    def check_backend_health(self) -> Dict:
        """Check FastAPI backend health"""
        try:
            response = requests.get("http://localhost:8000/api/health", timeout=5)
            if response.status_code == 200:
                return {"status": "healthy", "message": "Backend API responding"}
            else:
                return {"status": "unhealthy", "message": f"Backend returned {response.status_code}"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Backend error: {str(e)}"}
    
    def check_frontend_health(self) -> Dict:
        """Check Next.js frontend health"""
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                return {"status": "healthy", "message": "Frontend responding"}
            else:
                return {"status": "unhealthy", "message": f"Frontend returned {response.status_code}"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Frontend error: {str(e)}"}
    
    def check_redis_health(self) -> Dict:
        """Check Redis cache health"""
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379, decode_responses=True)
            r.ping()
            return {"status": "healthy", "message": "Redis responding"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Redis error: {str(e)}"}
    
    def run_full_health_check(self) -> Dict:
        """Run complete health check on all services"""
        results = {
            "timestamp": time.time(),
            "services": {}
        }
        
        # Check each service
        health_checks = {
            "postgres": self.check_database_health,
            "backend": self.check_backend_health,
            "frontend": self.check_frontend_health,
            "redis": self.check_redis_health
        }
        
        for service_name, check_func in health_checks.items():
            container_status = self.manager.get_service_status(service_name)
            health_result = check_func()
            
            results["services"][service_name] = {
                "container_status": container_status["status"],
                "health_check": health_result,
                "overall_status": "healthy" if (
                    container_status["status"] == "running" and 
                    health_result["status"] == "healthy"
                ) else "unhealthy"
            }
        
        # Calculate overall system health
        healthy_services = sum(1 for s in results["services"].values() 
                             if s["overall_status"] == "healthy")
        total_services = len(results["services"])
        
        results["overall"] = {
            "status": "healthy" if healthy_services == total_services else "degraded",
            "healthy_services": healthy_services,
            "total_services": total_services,
            "health_percentage": (healthy_services / total_services) * 100
        }
        
        return results
    
    def wait_for_services(self, timeout: int = 300) -> bool:
        """Wait for all services to become healthy"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            health_report = self.run_full_health_check()
            
            if health_report["overall"]["status"] == "healthy":
                print("All services are healthy!")
                return True
            
            print(f"Waiting for services... {health_report['overall']['healthy_services']}/{health_report['overall']['total_services']} healthy")
            time.sleep(10)
        
        print("Timeout waiting for services to become healthy")
        return False