-- Create PersonRole enum type
CREATE TYPE person_role AS ENUM ('SuperUser', 'Operator', 'User', 'ITRA');

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_person_username ON person(username);
CREATE INDEX IF NOT EXISTS idx_person_email ON person(email);
CREATE INDEX IF NOT EXISTS idx_person_role ON person(role);
CREATE INDEX IF NOT EXISTS idx_person_created_at ON person(created_at);

-- Insert 5 users with specified names
-- Password for all users: 'password123' (hashed with bcrypt)
INSERT INTO person (username, email, hashed_password, role) VALUES
    ('preet', 'preet@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'SuperUser'),
    ('kanav', 'kanav@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'Operator'),
    ('khash', 'khash@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'User'),
    ('cathy', 'cathy@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'ITRA'),
    ('pratiksha', 'pratiksha@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 'User')
ON CONFLICT (username) DO NOTHING; 