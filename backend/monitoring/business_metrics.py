"""
Custom business metrics for key business flows
"""
from prometheus_client import Counter, Histogram, Gauge, Summary
from typing import Dict, Any
import time
import logging

logger = logging.getLogger(__name__)

# Business metrics
class BusinessMetrics:
    """Collection of business-specific metrics"""
    
    def __init__(self):
        # User registration metrics
        self.user_registrations = Counter(
            'user_registrations_total',
            'Total user registrations',
            ['registration_method', 'success']
        )
        
        self.user_registration_duration = Histogram(
            'user_registration_duration_seconds',
            'User registration process duration',
            ['registration_method']
        )
        
        # Authentication metrics
        self.auth_attempts = Counter(
            'auth_attempts_total',
            'Authentication attempts',
            ['method', 'success', 'failure_reason']
        )
        
        self.auth_duration = Histogram(
            'auth_duration_seconds',
            'Authentication process duration',
            ['method']
        )
        
        # API endpoint usage metrics
        self.api_requests = Counter(
            'api_requests_total',
            'API requests by endpoint',
            ['endpoint', 'method', 'status_code']
        )
        
        self.api_duration = Histogram(
            'api_duration_seconds',
            'API response time by endpoint',
            ['endpoint', 'method']
        )
        
        # Business flow metrics
        self.business_flow_completions = Counter(
            'business_flow_completions_total',
            'Business flow completions',
            ['flow_name', 'success']
        )
        
        self.business_flow_duration = Histogram(
            'business_flow_duration_seconds',
            'Business flow completion duration',
            ['flow_name']
        )
        
        # Error rate metrics
        self.errors = Counter(
            'errors_total',
            'Application errors',
            ['error_type', 'endpoint', 'severity']
        )
        
        # System state metrics
        self.active_sessions = Gauge(
            'active_sessions_total',
            'Currently active user sessions'
        )
        
        self.system_load = Gauge(
            'system_load_average',
            'System load average'
        )
    
    def record_user_registration(self, registration_method: str, success: bool, duration: float):
        """Record user registration attempt"""
        self.user_registrations.labels(
            registration_method=registration_method,
            success=str(success).lower()
        ).inc()
        
        self.user_registration_duration.labels(
            registration_method=registration_method
        ).observe(duration)
    
    def record_auth_attempt(self, method: str, success: bool, failure_reason: str = "", duration: float = 0):
        """Record authentication attempt"""
        self.auth_attempts.labels(
            method=method,
            success=str(success).lower(),
            failure_reason=failure_reason
        ).inc()
        
        if duration > 0:
            self.auth_duration.labels(method=method).observe(duration)
    
    def record_api_request(self, endpoint: str, method: str, status_code: int, duration: float):
        """Record API request"""
        self.api_requests.labels(
            endpoint=endpoint,
            method=method,
            status_code=str(status_code)
        ).inc()
        
        self.api_duration.labels(
            endpoint=endpoint,
            method=method
        ).observe(duration)
    
    def record_business_flow(self, flow_name: str, success: bool, duration: float):
        """Record business flow completion"""
        self.business_flow_completions.labels(
            flow_name=flow_name,
            success=str(success).lower()
        ).inc()
        
        self.business_flow_duration.labels(flow_name=flow_name).observe(duration)
    
    def record_error(self, error_type: str, endpoint: str, severity: str):
        """Record application error"""
        self.errors.labels(
            error_type=error_type,
            endpoint=endpoint,
            severity=severity
        ).inc()
    
    def record_active_sessions(self, count: int):
        """Record active session count"""
        self.active_sessions.set(count)
    
    def record_system_load(self, load_avg: float):
        """Record system load average"""
        self.system_load.set(load_avg)

# Global instance
business_metrics = BusinessMetrics()
