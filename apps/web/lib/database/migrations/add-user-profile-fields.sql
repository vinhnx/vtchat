-- Add enhanced user profile fields
-- Migration: add-user-profile-fields.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_marketing BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Update the updated_at field for this migration
UPDATE users SET updated_at = NOW() WHERE bio IS NULL;
