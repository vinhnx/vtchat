# Subscription Data Integrity Guide

## Overview

This guide documents the comprehensive protection system implemented to prevent subscription tier bugs where paying customers lose access to features they paid for.

## The Problem

**Critical Bug**: Users with valid VT+ subscriptions were showing as base tier due to:
- Multiple subscription rows per user without proper query ordering
- Cache serving stale data
- Lack of data integrity constraints

## Multi-Layer Protection System

### 1. Database Constraints (Schema Level)

#### Unique Partial Index
Prevents multiple active subscriptions per user:
```sql
CREATE UNIQUE INDEX uniq_active_subscription
  ON user_subscriptions (user_id)
  WHERE status IN ('active', 'trialing', 'past_due');
```

#### Data Validation
- Valid subscription statuses only
- Valid plan types only
- Future period end dates for active subscriptions

#### Automatic Cache Invalidation
Database triggers automatically invalidate caches when subscriptions change.

### 2. Application Layer (Service Level)

#### SubscriptionService
- **Centralized upsert**: Prevents duplicate active subscriptions
- **Data validation**: Ensures consistency between users.plan_slug and subscription data
- **Automatic fixing**: Resolves data integrity issues automatically

#### Query Protection
All subscription queries use deterministic ordering:
```sql
ORDER BY 
  CASE 
    WHEN status IN ('active','trialing','past_due') THEN 0
    WHEN status IN ('canceled','cancelled') THEN 1
    ELSE 2
  END,
  current_period_end DESC,
  updated_at DESC
```

### 3. Monitoring & Alerting

#### Real-time Monitoring
- **Duplicate detection**: Alerts on multiple active subscriptions
- **Mismatch detection**: Alerts on plan_slug inconsistencies
- **Canary monitoring**: Synthetic VT+ user tests every 60 seconds

#### Health Check Endpoints
- `GET /api/admin/subscription-health` - Comprehensive health check
- `POST /api/admin/subscription-health` - Auto-fix issues
- `GET /api/monitoring/subscription-metrics` - Real-time metrics

#### Metrics Tracked
- Total users and VT+ users
- Duplicate active subscriptions (should be 0)
- Plan slug mismatches
- Expired but active subscriptions
- Canary check success rate

### 4. Testing

#### Comprehensive Test Suite
- Database constraint validation
- Application layer protection
- Query ordering verification
- Edge case handling
- Cache invalidation testing

#### Regression Prevention
- Tests for multiple subscription scenarios
- Timezone edge cases
- SQL injection prevention
- Cache consistency validation

## Operational Procedures

### Emergency Response

If subscription tier bugs are detected:

1. **Immediate**: Check health endpoint
   ```bash
   curl -H "Authorization: Bearer admin-token" \
     https://vtchat.io.vn/api/admin/subscription-health
   ```

2. **Auto-fix**: Run automated repair
   ```bash
   curl -X POST -H "Authorization: Bearer admin-token" \
     https://vtchat.io.vn/api/admin/subscription-health
   ```

3. **Manual fix**: For individual users
   ```javascript
   await SubscriptionService.fixUserSubscriptions(userId);
   ```

### Monitoring Dashboard

Access real-time metrics:
```bash
curl https://vtchat.io.vn/api/monitoring/subscription-metrics
```

Expected healthy response:
```json
{
  "healthy": true,
  "metrics": {
    "duplicateActiveSubscriptions": 0,
    "planSlugMismatches": 0,
    "canary": { "success": true }
  },
  "alerts": []
}
```

### Prevention Checklist

Before any subscription-related deployment:

- [ ] Run comprehensive tests
- [ ] Check database constraints are active
- [ ] Verify monitoring endpoints are responding
- [ ] Confirm canary user has valid access
- [ ] Test auto-fix functionality

## Alerts Configuration

### Critical Alerts (Page Immediately)
- Any duplicate active subscriptions (threshold: 0)
- Canary check failures (threshold: 2 consecutive failures)
- Plan slug mismatches >50 users

### Warning Alerts
- Plan slug mismatches 5-50 users
- Expired but active subscriptions >10
- Canary response time >1000ms

## Architecture Decisions

### Why Multiple Layers?
Each layer assumes others may fail:
- Database constraints prevent data corruption
- Application logic handles business rules
- Monitoring detects issues in real-time
- Tests prevent regressions

### Cache Strategy
- Automatic invalidation on subscription changes
- Short TTL (30 seconds) for subscription data
- Multi-layer caching (LRU + Redis)
- Cache bypass option for debugging

### Data Model
- Single source of truth for active subscriptions
- Historical data preserved for auditing
- Consistent users.plan_slug synchronization

## Troubleshooting

### Common Issues

1. **User shows base tier despite valid subscription**
   - Check: `GET /api/admin/subscription-health`
   - Fix: `POST /api/admin/subscription-health`
   - Verify: Clear user's cache and refresh

2. **Multiple active subscriptions detected**
   - Auto-fix will keep the most recent one
   - Others are marked as canceled
   - Cache is automatically invalidated

3. **Plan slug mismatch**
   - Auto-fix synchronizes users.plan_slug with subscription
   - Validates subscription is still active
   - Logs changes for audit trail

### Debug Commands

```sql
-- Check for duplicates
SELECT user_id, COUNT(*) 
FROM user_subscriptions 
WHERE status IN ('active', 'trialing', 'past_due')
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Check mismatches
SELECT u.id, u.plan_slug, s.plan, s.status
FROM users u
JOIN user_subscriptions s ON u.id = s.user_id
WHERE s.status IN ('active', 'trialing', 'past_due')
  AND (
    (s.plan = 'vt_plus' AND u.plan_slug != 'vt_plus') OR
    (s.plan = 'vt_base' AND u.plan_slug != 'vt_base')
  );
```

## Future Enhancements

### Planned Improvements
- Real-time webhook validation
- Automated customer notifications
- Advanced analytics dashboard
- Predictive issue detection

### Monitoring Expansion
- Customer satisfaction metrics
- Revenue impact tracking
- Performance optimization
- Load testing scenarios

## Contacts

- **On-call Engineer**: Check health endpoints first
- **Database Admin**: For constraint or migration issues
- **Product Team**: For business logic questions
- **Customer Support**: For user impact assessment

## SLA Targets

- **Detection Time**: <5 minutes (via monitoring)
- **Resolution Time**: <15 minutes (via auto-fix)
- **False Positive Rate**: <1% (via comprehensive testing)
- **Customer Impact**: Zero paying customers lose access

This system ensures that the critical subscription tier bug can never happen again through comprehensive prevention, detection, and automated remediation.
