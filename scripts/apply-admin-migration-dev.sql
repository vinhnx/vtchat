-- Admin Plugin Migration for Development Database
-- Run this on your development database to fix the "impersonated_by" column error

-- Add admin plugin fields to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS impersonated_by TEXT;

-- Add admin plugin fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_expires TIMESTAMP;

-- Add constraints for data integrity
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- Add performance indexes
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_banned_partial_idx ON users(banned) WHERE banned = true;
CREATE INDEX IF NOT EXISTS sessions_impersonated_by_idx ON sessions(impersonated_by) WHERE impersonated_by IS NOT NULL;

-- Verify the migration
SELECT 'Admin migration completed successfully' as status;
