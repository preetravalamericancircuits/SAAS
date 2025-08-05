-- Add indexes for frequently queried fields
-- Indexes for user-related tables
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Indexes for task-related tables
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Indexes for person-related tables
CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_persons_email ON persons(email);
CREATE INDEX IF NOT EXISTS idx_persons_role ON persons(role);

-- Indexes for auth-related tables
CREATE INDEX IF NOT EXISTS idx_auth_user_id ON auth(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);
CREATE INDEX IF NOT EXISTS idx_auth_role ON auth(role);

-- Indexes for performance optimizations
CREATE INDEX IF NOT EXISTS idx_persons_created_at ON persons(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Performance optimizations for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_status ON analytics(status);
