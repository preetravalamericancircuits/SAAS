from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from prometheus_client import start_http_server
from config import settings
import logging

logger = logging.getLogger(__name__)

# Global metrics
meter = None
request_counter = None
request_duration = None
auth_attempts_counter = None
active_users_gauge = None
database_operations_counter = None

def init_telemetry():
    """Initialize OpenTelemetry instrumentation"""
    global meter, request_counter, request_duration, auth_attempts_counter, active_users_gauge, database_operations_counter
    
    # Create resource
    resource = Resource.create({
        "service.name": "saas-backend",
        "service.version": settings.app_version,
        "service.environment": settings.environment,
    })
    
    # Initialize tracing
    trace.set_tracer_provider(TracerProvider(resource=resource))
    
    # Initialize metrics with Prometheus exporter
    prometheus_reader = PrometheusMetricReader()
    metrics.set_meter_provider(MeterProvider(
        resource=resource,
        metric_readers=[prometheus_reader]
    ))
    
    # Get meter
    meter = metrics.get_meter("saas-backend")
    
    # Create metrics
    request_counter = meter.create_counter(
        "http_requests_total",
        description="Total HTTP requests",
        unit="1"
    )
    
    request_duration = meter.create_histogram(
        "http_request_duration_seconds",
        description="HTTP request duration",
        unit="s"
    )
    
    auth_attempts_counter = meter.create_counter(
        "auth_attempts_total",
        description="Authentication attempts",
        unit="1"
    )
    
    active_users_gauge = meter.create_up_down_counter(
        "active_users_total",
        description="Currently active users",
        unit="1"
    )
    
    database_operations_counter = meter.create_counter(
        "database_operations_total",
        description="Database operations",
        unit="1"
    )
    
    # Auto-instrument FastAPI
    FastAPIInstrumentor.instrument()
    
    # Auto-instrument SQLAlchemy
    SQLAlchemyInstrumentor.instrument()
    
    # Auto-instrument requests
    RequestsInstrumentor.instrument()
    
    # Start Prometheus metrics server
    start_http_server(8001)
    
    logger.info(f"OpenTelemetry initialized for {settings.environment}")

def record_request(method: str, endpoint: str, status_code: int, duration: float):
    """Record HTTP request metrics"""
    if request_counter and request_duration:
        request_counter.add(1, {
            "method": method,
            "endpoint": endpoint,
            "status_code": str(status_code)
        })
        request_duration.record(duration, {
            "method": method,
            "endpoint": endpoint,
            "status_code": str(status_code)
        })

def record_auth_attempt(username: str, success: bool, method: str = "password"):
    """Record authentication attempt"""
    if auth_attempts_counter:
        auth_attempts_counter.add(1, {
            "username": username,
            "success": str(success).lower(),
            "method": method
        })

def record_active_user(action: str = "login"):
    """Record active user change"""
    if active_users_gauge:
        if action == "login":
            active_users_gauge.add(1)
        elif action == "logout":
            active_users_gauge.add(-1)

def record_database_operation(operation: str, table: str, success: bool):
    """Record database operation"""
    if database_operations_counter:
        database_operations_counter.add(1, {
            "operation": operation,
            "table": table,
            "success": str(success).lower()
        })