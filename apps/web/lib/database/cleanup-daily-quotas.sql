-- Cleanup job for old daily quota rows
-- Run this periodically to prevent table bloat from daily quota tracking

-- Delete daily quota rows older than 30 days (keep monthly data)
-- This prevents unbounded growth while maintaining audit trail
DELETE FROM vtplus_usage 
WHERE period_start < CURRENT_DATE - INTERVAL '30 days'
AND EXISTS (
    SELECT 1 FROM unnest(ARRAY['DR', 'PS']) AS daily_feature(code)
    WHERE vtplus_usage.feature = daily_feature.code
);

-- Optional: Add logging for cleanup operations
-- Uncomment if you want to track cleanup operations
-- INSERT INTO system_logs (operation, details, created_at)
-- VALUES ('daily_quota_cleanup', 
--         FORMAT('Cleaned up rows older than %s', CURRENT_DATE - INTERVAL '30 days'),
--         NOW());

-- Performance note: Consider running this during low-traffic hours
-- Recommended schedule: Weekly at 02:00 UTC Sunday
-- Example cron: 0 2 * * 0 psql -f cleanup-daily-quotas.sql
