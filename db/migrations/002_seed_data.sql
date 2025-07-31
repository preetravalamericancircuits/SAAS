-- Insert additional test users
INSERT INTO users (username, email, hashed_password, role_id) VALUES
    ('manager1', 'manager1@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 
     (SELECT id FROM roles WHERE name = 'manager'))
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, hashed_password, role_id) VALUES
    ('user1', 'user1@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 
     (SELECT id FROM roles WHERE name = 'user'))
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, hashed_password, role_id) VALUES
    ('user2', 'user2@aci.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', 
     (SELECT id FROM roles WHERE name = 'user'))
ON CONFLICT (username) DO NOTHING; 