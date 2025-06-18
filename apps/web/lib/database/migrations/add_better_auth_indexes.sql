-- Database indexes for Better Auth performance optimization
-- Based on the Better Auth documentation recommendations

-- Add indexes for the users table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_normalized_email ON users(normalized_email);

-- Add indexes for the accounts table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_provider_account ON accounts(provider_id, account_id);

-- Add indexes for the sessions table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Add indexes for the verifications table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verifications_identifier ON verifications(identifier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verifications_expires_at ON verifications(expires_at);

-- Add indexes for subscription-related queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_creem_customer_id ON user_subscriptions(creem_customer_id);

-- Add indexes for feedback table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verifications_identifier_expires ON verifications(identifier, expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- Clean up expired sessions and verifications (optional optimization)
-- This could be run as a periodic cleanup job
-- DELETE FROM sessions WHERE expires_at < NOW();
-- DELETE FROM verifications WHERE expires_at < NOW();
