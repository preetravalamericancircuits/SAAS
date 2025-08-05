import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from config import settings
import logging

def init_sentry():
    """Initialize Sentry for error tracking"""
    
    # Only initialize if DSN is provided
    sentry_dsn = getattr(settings, 'sentry_dsn', None)
    if not sentry_dsn:
        logging.warning("Sentry DSN not configured - error tracking disabled")
        return
    
    # Configure integrations
    integrations = [
        FastApiIntegration(auto_enabling_integrations=False),
        SqlalchemyIntegration(),
        LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
    ]
    
    # Initialize Sentry
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=integrations,
        traces_sample_rate=0.1 if settings.environment == "production" else 1.0,
        environment=settings.environment,
        release=getattr(settings, 'app_version', 'unknown'),
        send_default_pii=False,
        attach_stacktrace=True,
        max_breadcrumbs=50,
        before_send=filter_sensitive_data
    )
    
    logging.info(f"Sentry initialized for environment: {settings.environment}")

def filter_sensitive_data(event, hint):
    """Filter sensitive data from Sentry events"""
    
    # Remove sensitive headers
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        sensitive_headers = ['authorization', 'cookie', 'x-csrf-token']
        for header in sensitive_headers:
            if header in headers:
                headers[header] = '[Filtered]'
    
    # Remove sensitive form data
    if 'request' in event and 'data' in event['request']:
        data = event['request']['data']
        if isinstance(data, dict):
            sensitive_fields = ['password', 'token', 'secret', 'key']
            for field in sensitive_fields:
                if field in data:
                    data[field] = '[Filtered]'
    
    return event

def capture_auth_error(error, user_id=None, username=None):
    """Capture authentication-related errors with context"""
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("error_type", "authentication")
        if user_id:
            scope.set_user({"id": user_id})
        if username:
            scope.set_context("auth", {"username": username})
        sentry_sdk.capture_exception(error)

def capture_api_error(error, endpoint=None, method=None, user_id=None):
    """Capture API-related errors with context"""
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("error_type", "api")
        if endpoint:
            scope.set_tag("endpoint", endpoint)
        if method:
            scope.set_tag("method", method)
        if user_id:
            scope.set_user({"id": user_id})
        sentry_sdk.capture_exception(error)

def capture_database_error(error, query=None, table=None):
    """Capture database-related errors with context"""
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("error_type", "database")
        if table:
            scope.set_tag("table", table)
        if query:
            scope.set_context("database", {"query": str(query)[:500]})
        sentry_sdk.capture_exception(error)