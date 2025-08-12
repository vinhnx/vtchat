# Enhanced Subscription Verification Implementation

## Overview

This document describes the implementation of comprehensive subscription verification to prevent duplicate Creem subscriptions in VT.

## Problem Statement

Previously, the checkout API only checked the `user_subscriptions` table for existing subscriptions, which could miss cases where:

1. Users have VT+ access granted directly via `users.plan_slug` (admin-granted, legacy subscriptions)
2. Database inconsistencies where subscription records don't exist but plan access is granted
3. Edge cases during subscription transitions

## Solution

### Enhanced Verification Utility

Created `packages/shared/utils/subscription-verification.ts` with comprehensive verification logic:

```typescript
export async function verifyExistingCreemSubscription(
    userId: string,
    deps: DatabaseDependencies,
    targetPlan: PlanSlug = PlanSlug.VT_PLUS,
): Promise<SubscriptionVerificationResult>;
```

### Verification Strategy

The utility performs multi-step verification:

1. **Database Subscription Check**: Query `user_subscriptions` table for formal subscription records
2. **User Plan Check**: Query `users.plan_slug` as fallback for admin-granted or legacy access
3. **Comprehensive Analysis**: Evaluate both sources for complete verification
4. **Detailed Response**: Return verification source, subscription details, and user-friendly messages

### Integration Points

#### Checkout API (`apps/web/app/api/checkout/route.ts`)

Enhanced the existing subscription check:

```typescript
// Before: Only checked user_subscriptions table
const existingSubscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

// After: Comprehensive verification
const verification = await verifyExistingCreemSubscription(
    userId,
    { db, userSubscriptions, users, eq },
    PlanSlug.VT_PLUS,
);
```

## Benefits

### 1. Duplicate Prevention

- Prevents users from creating multiple subscriptions
- Catches edge cases missed by simple database checks
- Maintains subscription integrity across payment provider changes

### 2. Comprehensive Coverage

- Checks both `user_subscriptions` and `users.plan_slug`
- Handles admin-granted subscriptions
- Validates subscription expiration dates
- Accounts for legacy data inconsistencies

### 3. Enhanced User Experience

- Provides detailed error messages explaining why checkout is blocked
- Indicates the source of existing subscription (database vs. plan access)
- Suggests appropriate actions (customer portal for management)

### 4. Debugging and Monitoring

- Logs verification source for troubleshooting
- Detailed subscription analysis for support
- Clear error codes for different scenarios

## Error Response Format

When an active subscription is detected:

```json
{
    "error": "Active subscription exists",
    "message": "Active VT+ subscription found in database",
    "code": "SUBSCRIPTION_EXISTS",
    "hasActiveSubscription": true,
    "currentPlan": "vt_plus",
    "subscriptionId": "sub_1234567890",
    "verificationSource": "database_subscription"
}
```

## Verification Sources

| Source                  | Description                                                | Use Case                     |
| ----------------------- | ---------------------------------------------------------- | ---------------------------- |
| `database_subscription` | Found active subscription in `user_subscriptions`          | Standard Creem subscriptions |
| `user_plan_slug`        | Found VT+ in `users.plan_slug` without subscription record | Admin-granted, legacy access |
| `none`                  | No active subscription found                               | Proceed with checkout        |

## Testing Scenarios

### Scenario 1: Active Database Subscription

- User has active record in `user_subscriptions`
- Status: `ACTIVE`, Plan: `vt_plus`
- Expected: Block checkout, return subscription details

### Scenario 2: Admin-Granted Access

- User has `plan_slug = 'vt_plus'` but no subscription record
- Expected: Block checkout, indicate legacy/admin access

### Scenario 3: Expired Subscription

- User has subscription record but expired or inactive
- Expected: Allow checkout (user can resubscribe)

### Scenario 4: No Subscription

- User has no subscription record and `plan_slug != 'vt_plus'`
- Expected: Allow checkout

## Implementation Details

### Database Dependencies

The utility requires these dependencies to be passed in:

- `db`: Drizzle database instance
- `userSubscriptions`: userSubscriptions table schema
- `users`: users table schema
- `eq`: Drizzle equality function

This design allows the utility to be database-agnostic and testable.

### Error Handling

- Database errors are caught and logged but don't block checkout
- Graceful degradation ensures payment flow continues even if verification fails
- Comprehensive logging for monitoring and debugging

## Future Enhancements

1. **Webhook Integration**: Update verification when webhooks modify subscription status
2. **Caching**: Cache verification results for performance
3. **Audit Trail**: Log all subscription verification attempts
4. **Multi-plan Support**: Extend verification for other subscription tiers

## Configuration

### Package Exports

Added to `packages/shared/package.json`:

```json
"./utils/subscription-verification": "./utils/subscription-verification.ts"
```

Added to `packages/shared/utils/index.ts`:

```typescript
export * from './subscription-verification';
```

## Monitoring

Key metrics to monitor:

- Checkout attempts blocked by verification
- Verification source distribution
- Database error rates during verification
- User experience impact (reduced support tickets)

## Security Considerations

- Verification logic prevents subscription bypass
- No sensitive data exposed in error responses
- Database queries use parameterized statements
- Proper authentication required before verification
