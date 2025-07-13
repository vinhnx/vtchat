-- SQL functions for VT+ quota management with Neon MCP
-- This function provides atomic quota consumption with proper error handling

CREATE OR REPLACE FUNCTION consume_vtplus_quota(
  p_user_id text,
  p_feature text,
  p_amount int,
  p_limit int,
  p_period_start date
) RETURNS TABLE(used int, would_exceed bool) AS $$
BEGIN
  -- Attempt to insert new usage or increment existing usage atomically
  INSERT INTO vtplus_usage (user_id, feature, period_start, used, created_at, updated_at)
  VALUES (p_user_id, p_feature, p_period_start, p_amount, NOW(), NOW())
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET 
    used = vtplus_usage.used + p_amount,
    updated_at = NOW()
  WHERE vtplus_usage.used + p_amount <= p_limit;

  -- Check if the operation succeeded
  IF NOT FOUND THEN
     -- Quota would be exceeded, return current usage
     RETURN QUERY
       SELECT vtplus_usage.used::int, true::bool 
       FROM vtplus_usage
       WHERE user_id = p_user_id AND feature = p_feature AND period_start = p_period_start;
  ELSE
     -- Success, return new usage
     RETURN QUERY
       SELECT vtplus_usage.used::int, false::bool 
       FROM vtplus_usage
       WHERE user_id = p_user_id AND feature = p_feature AND period_start = p_period_start;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance if not exists
CREATE INDEX IF NOT EXISTS idx_vtplus_usage_lookup 
ON vtplus_usage (user_id, feature, period_start);

-- Comment for documentation
COMMENT ON FUNCTION consume_vtplus_quota IS 
'Atomically consume VT+ quota for a user feature with proper limit checking. Returns current usage and whether limit would be exceeded.';
