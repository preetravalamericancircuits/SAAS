-- Complete Database Schema Initialization
-- This script creates all tables, roles, permissions, and initial data

-- =============================================================================
-- CREATE TABLES
-- =============================================================================

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions association table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create PersonRole enum type
DO $$ BEGIN
    CREATE TYPE person_role AS ENUM ('SuperUser', 'Operator', 'User', 'ITRA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create person table
CREATE TABLE IF NOT EXISTS person (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role person_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Roles table indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);

-- Permissions table indexes
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions(created_at);

-- Person table indexes
CREATE INDEX IF NOT EXISTS idx_person_username ON person(username);
CREATE INDEX IF NOT EXISTS idx_person_email ON person(email);
CREATE INDEX IF NOT EXISTS idx_person_role ON person(role);
CREATE INDEX IF NOT EXISTS idx_person_created_at ON person(created_at);

-- =============================================================================
-- INSERT DEFAULT ROLES
-- =============================================================================

INSERT INTO roles (name, description) VALUES
    ('SuperUser', 'Full system access with all permissions'),
    ('Admin', 'Administrative access with user and role management'),
    ('Manager', 'Manager access with limited user management'),
    ('User', 'Standard user access'),
    ('Guest', 'Limited read-only access')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- INSERT DEFAULT PERMISSIONS
-- =============================================================================

INSERT INTO permissions (name, description) VALUES
    -- User management permissions
    ('user:read', 'Read user information'),
    ('user:create', 'Create new users'),
    ('user:update', 'Update user information'),
    ('user:delete', 'Delete users'),
    
    -- Role management permissions
    ('role:read', 'Read role information'),
    ('role:create', 'Create new roles'),
    ('role:update', 'Update role information'),
    ('role:delete', 'Delete roles'),
    
    -- Permission management permissions
    ('permission:read', 'Read permission information'),
    ('permission:create', 'Create new permissions'),
    ('permission:update', 'Update permission information'),
    ('permission:delete', 'Delete permissions'),
    
    -- Person management permissions
    ('person:read', 'Read person information'),
    ('person:create', 'Create new persons'),
    ('person:update', 'Update person information'),
    ('person:delete', 'Delete persons'),
    
    -- System permissions
    ('system:admin', 'Full system administration access'),
    ('system:read', 'Read system information')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- ASSIGN PERMISSIONS TO ROLES
-- =============================================================================

-- SuperUser gets all permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'SuperUser'
ON CONFLICT DO NOTHING;

-- Admin gets most permissions (except system:admin)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Admin' AND p.name != 'system:admin'
ON CONFLICT DO NOTHING;

-- Manager gets limited permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Manager' AND p.name IN (
    'user:read', 'user:create', 'user:update',
    'person:read', 'person:create', 'person:update',
    'system:read'
)
ON CONFLICT DO NOTHING;

-- User gets basic permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'User' AND p.name IN (
    'user:read', 'person:read', 'system:read'
)
ON CONFLICT DO NOTHING;

-- Guest gets minimal permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Guest' AND p.name IN (
    'system:read'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERT DEFAULT USERS
-- =============================================================================

-- Create default admin user (password: admin123)
INSERT INTO users (username, email, hashed_password, role_id) 
SELECT 'admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', r.id
FROM roles r WHERE r.name = 'SuperUser'
ON CONFLICT (username) DO NOTHING;

-- =============================================================================
-- INSERT PERSON TABLE USERS
-- =============================================================================

-- Insert 5 users with specified names (password: password123)
INSERT INTO person (username, email, hashed_password, role) VALUES
    ('preet', 'preet@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'SuperUser'),
    ('kanav', 'kanav@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'Operator'),
    ('khash', 'khash@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'User'),
    ('cathy', 'cathy@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'ITRA'),
    ('pratiksha', 'pratiksha@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'User')
ON CONFLICT (username) DO NOTHING;

-- =============================================================================
-- CREATE UPDATED_AT TRIGGER FOR USERS TABLE
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 