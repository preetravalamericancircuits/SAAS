import logging
from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SecurityEvent:
    timestamp: datetime
    event_type: str
    ip_address: str
    username: str = None
    details: str = None

class SecurityMonitor:
    """Monitor and track security events"""
    
    def __init__(self):
        self.events: List[SecurityEvent] = []
        self.ip_reputation: Dict[str, int] = defaultdict(int)
        self.blocked_ips: Dict[str, datetime] = {}
    
    def log_failed_login(self, ip_address: str, username: str):
        """Log failed login attempt"""
        event = SecurityEvent(
            timestamp=datetime.utcnow(),
            event_type="failed_login",
            ip_address=ip_address,
            username=username
        )
        self.events.append(event)
        self.ip_reputation[ip_address] += 1
        
        logger.warning(f"Failed login: {username} from {ip_address}")
    
    def log_successful_login(self, ip_address: str, username: str):
        """Log successful login"""
        event = SecurityEvent(
            timestamp=datetime.utcnow(),
            event_type="successful_login",
            ip_address=ip_address,
            username=username
        )
        self.events.append(event)
        
        # Reset reputation on successful login
        if ip_address in self.ip_reputation:
            self.ip_reputation[ip_address] = max(0, self.ip_reputation[ip_address] - 1)
    
    def log_rate_limit_exceeded(self, ip_address: str, endpoint: str):
        """Log rate limit violation"""
        event = SecurityEvent(
            timestamp=datetime.utcnow(),
            event_type="rate_limit_exceeded",
            ip_address=ip_address,
            details=f"endpoint: {endpoint}"
        )
        self.events.append(event)
        self.ip_reputation[ip_address] += 2
        
        logger.warning(f"Rate limit exceeded: {ip_address} on {endpoint}")
    
    def is_ip_suspicious(self, ip_address: str) -> bool:
        """Check if IP has suspicious activity"""
        return self.ip_reputation[ip_address] >= 10
    
    def get_recent_events(self, hours: int = 24) -> List[SecurityEvent]:
        """Get security events from last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return [event for event in self.events if event.timestamp > cutoff]
    
    def cleanup_old_events(self, days: int = 7):
        """Remove events older than N days"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        self.events = [event for event in self.events if event.timestamp > cutoff]

# Global security monitor
security_monitor = SecurityMonitor()