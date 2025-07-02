# VT Subscription System

## Overview

VT uses a dual-source subscription system that maintains consistency between user plan assignments and formal subscription records.

## Data Sources

### 1. Users Table (`users.plan_slug`)

- **Purpose**: Quick access to user's current plan
- **Values**: `'free'`, `'vt_plus'`
- **Usage**: Used for fast plan checks and as fallback when subscription records are missing
- **Note**: Free tier includes advanced features (Dark Mode, Document Processing, Thinking Mode, etc.) for logged-in users

### 2. User Subscriptions Table (`user_subscriptions`)

- **Purpose**: Detailed subscription management with billing periods, credits, and payment provider integration
- **Contains**: Plan details, billing periods, credit tracking, Creem/Stripe integration
- **Usage**: Authoritative source for subscription status and billing information

## Subscription Logic

The subscription status API (`/api/subscription/status`) follows this priority order:

1. **Primary**: Check `user_subscriptions` table for formal subscription record
2. **Fallback**: If no subscription record but `users.plan_slug = 'vt_plus'`, treat as active VT+
3. **Default**: If neither exists, default to free plan

## Key Components

### API Endpoints

- `/api/subscription/status` - Get current subscription status
- `/api/subscription/sync` - Sync subscription data between tables
- `/api/user/profile` - User profile with subscription metadata

### Hooks

- `useSubscriptionStatus()` - Database-backed subscription checking (recommended)
- `useCreemSubscription()` - Payment and portal management
- `useSubscription()` - Legacy hook using user metadata

### Utilities

- `subscription-sync.ts` - Server-side sync utilities
- `subscription.ts` - Client-side subscription logic

## Data Flow

```
User Subscribes → Webhook Updates user_subscriptions → API checks both sources → Frontend updates
                                     ↓
                              Auto-sync users.plan_slug
```

## Troubleshooting

### Issue: User has VT+ but app shows free tier

**Possible Causes:**

1. Missing `user_subscriptions` record
2. Expired subscription not properly handled
3. Cache/state not refreshed after subscription change

**Solutions:**

1. Run subscription sync: `POST /api/subscription/sync`
2. Check subscription status: `GET /api/subscription/status`
3. Verify database consistency:

    ```sql
    SELECT u.email, u.plan_slug, us.plan, us.status, us.current_period_end
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE u.plan_slug = 'vt_plus';
    ```

### Issue: Inconsistent data between tables

**Solution:** Use the sync utility to ensure consistency:

```javascript
import { syncUserSubscriptionData } from '@repo/shared/utils/subscription-sync';
await syncUserSubscriptionData();
```

## Best Practices

1. **Always check both sources** in subscription logic
2. **Use `useSubscriptionStatus()`** for new components (database-backed)
3. **Sync data after subscription changes** via webhooks or manual triggers
4. **Handle edge cases** where users have plan_slug but no subscription record
5. **Refresh subscription state** after payment flows complete

## Migration Notes

- Legacy users may have `plan_slug` set but no `user_subscriptions` record
- The sync utility automatically creates missing subscription records
- Always test subscription logic with edge cases (expired, missing records, etc.)
