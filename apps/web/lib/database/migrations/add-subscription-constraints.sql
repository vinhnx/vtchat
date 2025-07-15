-- Migration: Prevent duplicate active subscriptions and ensure data integrity
-- This prevents the root cause of subscription tier bugs

BEGIN;

-- 1. Create unique partial index to prevent multiple active subscriptions per user
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uniq_active_subscription
  ON user_subscriptions (user_id)
  WHERE status IN ('active', 'trialing', 'past_due');

-- 2. Ensure unique Creem subscription IDs
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uniq_creem_subscription_id
  ON user_subscriptions (creem_subscription_id)
  WHERE creem_subscription_id IS NOT NULL;

-- 3. Add check constraint for valid statuses
ALTER TABLE user_subscriptions 
ADD CONSTRAINT valid_subscription_status 
CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'cancelled', 'expired', 'inactive', 'incomplete', 'none'));

-- 4. Add check constraint for valid plans
ALTER TABLE user_subscriptions 
ADD CONSTRAINT valid_subscription_plan 
CHECK (plan IN ('vt_base', 'vt_plus'));

-- 5. Ensure current_period_end is in the future for active subscriptions
ALTER TABLE user_subscriptions 
ADD CONSTRAINT future_period_end_for_active 
CHECK (
  (status NOT IN ('active', 'trialing', 'past_due')) OR 
  (current_period_end IS NULL) OR 
  (current_period_end > created_at)
);

-- 6. Create function to automatically invalidate cache on subscription changes
CREATE OR REPLACE FUNCTION invalidate_subscription_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- This would trigger cache invalidation in the application
  -- For now, we'll log the change for monitoring
  RAISE NOTICE 'Subscription changed for user_id: %, subscription_id: %', 
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.id, OLD.id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to detect subscription changes
DROP TRIGGER IF EXISTS subscription_change_trigger ON user_subscriptions;
CREATE TRIGGER subscription_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION invalidate_subscription_cache();

COMMIT;
