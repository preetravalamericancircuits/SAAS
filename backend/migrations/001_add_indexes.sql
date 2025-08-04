-- Database indexes for performance optimization
-- Run this migration after initial database setup

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_active_role ON users (is_active, role_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_username_active ON users (username, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_email_active ON users (email, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_created_active ON users (created_at, is_active);

-- Person table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_active_role ON person (is_active, role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_username_active ON person (username, is_active);

-- Role permissions composite index
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_role_permissions_composite ON role_permissions (role_id, permission_id);

-- Additional single column indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_role_id ON users (role_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_is_active ON users (is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_users_created_at ON users (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_role ON person (role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_is_active ON person (is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_person_created_at ON person (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_roles_created_at ON roles (created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_permissions_created_at ON permissions (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_role_permissions_role_id ON role_permissions (role_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_role_permissions_permission_id ON role_permissions (permission_id);