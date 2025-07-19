# Rate Limiting Security Improvements

## Overview

This document outlines critical security improvements made to the VT+ rate limiting system and additional recommended changes.

## Changes Implemented

### 1. VT+ Enhanced Rate Limits

- **VT+ users without BYOK**: 100 requests/day, 10 requests/minute
- **Regular users**: 10 requests/day, 1 request/minute
- **BYOK users**: Unlimited usage (bypass rate limiting entirely)

### 2. Security Fixes Applied

#### Fixed Abort-to-Bypass Vulnerability ✅

**Issue**: Requests were only counted in `onFinish` callback, allowing users to bypass limits by aborting requests early.

**Fix**: Moved `recordRequest()` to execute immediately after rate limit check passes, before streaming begins.

#### Fixed parseInt Radix Issue ✅

**Issue**: `parseInt()` calls without radix parameter could cause parsing issues.

**Fix**: Added radix parameter `parseInt(value, 10)` to all parsing operations.

#### Reduced Duplicate VT+ Checks ✅

**Issue**: VT+ subscription was checked twice per request.

**Fix**: Consolidated to single check, reusing result for both rate limiting and error messages.

## Critical Security Issues Still Needing Attention

### 1. Race Condition Vulnerability (HIGH PRIORITY)

**Issue**: Multiple concurrent requests can all pass rate limit check before any updates the counter.

**Current Flow**:

1. Request A: `checkRateLimit()` → sees 9/10 used → allows
2. Request B: `checkRateLimit()` → sees 9/10 used → allows
3. Request C: `checkRateLimit()` → sees 9/10 used → allows
4. All requests increment counter separately

**Recommended Fix**: Implement atomic upsert operation:

```sql
INSERT INTO user_rate_limits (user_id, model_id, daily_request_count, minute_request_count, last_daily_reset, last_minute_reset)
VALUES ($1, $2, 1, 1, NOW(), NOW())
ON CONFLICT (user_id, model_id) DO UPDATE
SET
  daily_request_count = CASE
    WHEN (timezone('UTC', now()))::date <> (timezone('UTC', user_rate_limits.last_daily_reset))::date
    THEN 1
    ELSE user_rate_limits.daily_request_count + 1
  END,
  minute_request_count = CASE
    WHEN floor(extract(epoch from now())/60) <> floor(extract(epoch from user_rate_limits.last_minute_reset)/60)
    THEN 1
    ELSE user_rate_limits.minute_request_count + 1
  END,
  last_daily_reset = CASE
    WHEN (timezone('UTC', now()))::date <> (timezone('UTC', user_rate_limits.last_daily_reset))::date
    THEN NOW()
    ELSE user_rate_limits.last_daily_reset
  END,
  last_minute_reset = NOW()
RETURNING daily_request_count, minute_request_count;
```

### 2. Database Schema Requirements

**Required**: Add UNIQUE constraint to prevent duplicate records:

```sql
ALTER TABLE user_rate_limits
ADD CONSTRAINT user_rate_limits_user_model_unique
UNIQUE (userId, modelId);
```

### 3. Data Type Issues

**Issue**: Rate limit counts stored as TEXT, parsed with `parseInt()`

**Recommended**: Change schema to use INTEGER columns:

```sql
ALTER TABLE user_rate_limits
ALTER COLUMN daily_request_count TYPE INTEGER USING daily_request_count::INTEGER,
ALTER COLUMN minute_request_count TYPE INTEGER USING minute_request_count::INTEGER;
```

## Performance Considerations

### Database Round Trips

- **Current**: 2 DB queries per request (SELECT + UPDATE/INSERT)
- **Recommended**: 1 atomic upsert query
- **Alternative**: Redis-based rate limiting with `INCR + EXPIRE`

### Cleanup Strategy

- **Issue**: `user_rate_limits` table will grow indefinitely
- **Recommended**: Add cleanup job to remove old records (>30 days)

## Testing Requirements

### Unit Tests Needed

1. **Concurrent Request Handling**: Verify limit enforcement under parallel requests
2. **Abort Resistance**: Confirm aborted requests are still counted
3. **VT+ Limit Enforcement**: Test enhanced limits for VT+ users
4. **Time Boundary Crossing**: Test daily/minute resets work correctly
5. **BYOK Bypass**: Verify unlimited usage with valid API keys

### Integration Tests Needed

1. **Database Constraint Violations**: Test unique constraint handling
2. **Rate Limit Message Accuracy**: Verify correct messages for each user type
3. **Subscription Status Changes**: Test behavior when VT+ status changes mid-session

## Migration Path

### Phase 1: Immediate (Completed)

- ✅ Fix abort bypass vulnerability
- ✅ Fix parseInt radix issues
- ✅ Consolidate VT+ checks
- ✅ VT+ enhanced rate limits

### Phase 2: Critical Security (Recommended)

- [ ] Add database UNIQUE constraint
- [ ] Implement atomic upsert rate limiting
- [ ] Add comprehensive test suite

### Phase 3: Performance & Maintenance (Optional)

- [ ] Consider Redis-based rate limiting
- [ ] Implement cleanup strategy
- [ ] Convert to INTEGER columns
- [ ] Add monitoring/alerting

## Configuration

### Environment Variables (Recommended)

```env
# Rate limits for regular users
GEMINI_FREE_DAILY_LIMIT=10
GEMINI_FREE_MINUTE_LIMIT=1

# Enhanced limits for VT+ users
GEMINI_VT_PLUS_DAILY_LIMIT=100
GEMINI_VT_PLUS_MINUTE_LIMIT=10

# Rate limiting backend
RATE_LIMIT_BACKEND=postgres  # or 'redis'
```

## Monitoring

### Metrics to Track

- Rate limit violations by user type
- Concurrent request conflicts
- Database query performance
- Rate limit bypass attempts

### Alerts Recommended

- High rate limit violation rates
- Database constraint violations
- Unusual traffic patterns
- Rate limiting service errors
