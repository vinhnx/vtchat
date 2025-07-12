-- SQL functions for database optimizations
-- These should be created in your Neon database

-- Function to cleanup expired sessions efficiently
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions 
    WHERE expires_at <= NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh subscription summary materialized view
CREATE OR REPLACE FUNCTION refresh_subscription_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_subscription_summary;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Failed to refresh user_subscription_summary: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for fast subscription lookups
CREATE MATERIALIZED VIEW IF NOT EXISTS user_subscription_summary AS
SELECT 
    u.id as user_id,
    u.email,
    us.plan_slug as user_plan_slug,
    us.status as subscription_status,
    us.current_period_end,
    us.creem_subscription_id,
    CASE 
        WHEN us.plan_slug = 'vt-plus' AND us.status = 'active' 
        THEN true 
        ELSE false 
    END as is_vt_plus,
    us.created_at as subscription_created_at,
    us.updated_at as subscription_updated_at
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.id IS NOT NULL;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS user_subscription_summary_user_id_idx 
ON user_subscription_summary (user_id);

-- Indexes for optimal performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id_expires_at 
ON sessions(user_id, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token_hash 
ON sessions USING hash(token);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_plan_status 
ON user_subscriptions(plan_slug, status) 
WHERE status = 'active';

-- Function to get database health stats
CREATE OR REPLACE FUNCTION get_database_health_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'sessions_total', (SELECT COUNT(*) FROM sessions),
        'sessions_active', (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()),
        'sessions_expired', (SELECT COUNT(*) FROM sessions WHERE expires_at <= NOW()),
        'users_total', (SELECT COUNT(*) FROM users),
        'subscriptions_active', (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active'),
        'last_analyzed', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
