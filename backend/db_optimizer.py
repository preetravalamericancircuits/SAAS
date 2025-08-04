from sqlalchemy import text
from database import engine
import logging

logger = logging.getLogger(__name__)

def create_performance_indexes():
    """Create performance indexes for frequent queries"""
    
    indexes = [
        # Authentication queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_username_lookup ON users (username) WHERE is_active = true",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_email_lookup ON users (email) WHERE is_active = true",
        
        # Role-based queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_by_role ON users (role_id) WHERE is_active = true",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_by_role ON person (role) WHERE is_active = true",
        
        # Permission lookups
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_role_permissions_lookup ON role_permissions (role_id, permission_id)",
        
        # Audit and reporting queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_created_date ON users (created_at DESC)",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_created_date ON person (created_at DESC)",
        
        # Composite indexes for common filters
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_active_created ON users (is_active, created_at DESC)",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_active_created ON person (is_active, created_at DESC)",
    ]
    
    with engine.connect() as conn:
        for index_sql in indexes:
            try:
                conn.execute(text(index_sql))
                conn.commit()
                logger.info(f"Created index: {index_sql.split('IF NOT EXISTS')[1].split('ON')[0].strip()}")
            except Exception as e:
                logger.error(f"Failed to create index: {e}")

def analyze_tables():
    """Update table statistics for query optimization"""
    
    tables = ['users', 'person', 'roles', 'permissions', 'role_permissions']
    
    with engine.connect() as conn:
        for table in tables:
            try:
                conn.execute(text(f"ANALYZE {table}"))
                logger.info(f"Analyzed table: {table}")
            except Exception as e:
                logger.error(f"Failed to analyze table {table}: {e}")
        conn.commit()

if __name__ == "__main__":
    create_performance_indexes()
    analyze_tables()