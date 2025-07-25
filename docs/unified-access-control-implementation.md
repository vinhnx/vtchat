# Unified Access Control System Implementation

## Overview

This document outlines the implementation of a unified access control system that eliminates scattered `'vt_plus'` string usage and `user?.planSlug === 'vt_plus'` checks throughout the codebase.

## Problem Solved

### Before

- Scattered hardcoded string comparisons: `user?.planSlug === 'vt_plus'`
- Magic strings: `'vt_plus'` used directly in multiple files
- Inconsistent plan checking logic across different modules
- Potential for typos and inconsistent behavior

### After

- Single source of truth for all access control logic
- Enum-based plan checking: `PlanSlug.VT_PLUS`
- Unified functions for all plan comparisons
- Consistent behavior across the entire codebase

## Implementation Details

### 1. Created Unified Access Control System

**File:** `packages/shared/utils/access-control.ts`

**Core Functions:**

- `hasVTPlusAccess(user)` - Check if user has VT+ access
- `hasVTPlusAccessByPlan(planSlug)` - Check VT+ access by plan slug string
- `hasVTBaseAccess(user)` - Check if user has base plan access
- `canUpgrade(user)` - Check if user can upgrade (not already VT+)
- `isEligibleForQuotaConsumption(user, isByokKey)` - Check quota eligibility
- `hasFeatureAccess(user, requiredPlan)` - General feature access checking
- `validateUserForQuota(user)` - Validate user context for quota operations
- `isPlanEqual(planA, planB)` - Compare two plan slugs safely
- `getNormalizedPlanSlug(planSlug)` - Handle null/undefined cases

**Constants:**

```typescript
export const ACCESS_CONTROL = {
    VT_PLUS_PLAN: PlanSlug.VT_PLUS,
    VT_BASE_PLAN: PlanSlug.VT_BASE,
    REQUIRED_PLAN_FOR_QUOTA: PlanSlug.VT_PLUS,
} as const;
```

### 2. Updated Core Quota System

**Files Modified:**

- `packages/common/src/lib/geminiWithQuota.ts`
- `packages/ai/workflow/utils.ts`

**Changes:**

- Replaced `user?.planSlug === 'vt_plus'` with `isEligibleForQuotaConsumption(user, isByokKey)`
- Uses unified access control for all quota consumption decisions
- Consistent behavior across all AI workflow tasks

### 3. Replaced All Magic Strings

**Files Updated:**

- `packages/common/components/rate-limit-usage-meter.tsx`
- `packages/common/__tests__/gemini-logic.test.ts`
- `packages/common/hooks/__tests__/use-logout.test.ts`
- `apps/web/app/tests/rag-auth-fix-unit.test.ts`
- `apps/web/app/api/completion/route.ts`

**Changes:**

- All `'vt_plus'` strings replaced with `PlanSlug.VT_PLUS`
- Added proper imports for the enum
- Maintained backward compatibility

### 4. Updated Utilities to Use Unified Logic

**Files Modified:**

- `packages/shared/utils/subscription.ts`
- `packages/shared/utils/plus-defaults.ts`

**Changes:**

- `isVtPlus: hasVTPlusAccessByPlan(subscriptionData.planSlug)`
- `canUpgrade: canUserUpgrade({ planSlug: subscriptionData.planSlug })`
- `isPlusUser = hasVTPlusAccessByPlan(plan)`

### 5. Added Package Export

**File:** `packages/shared/package.json`

**Added:**

```json
"./utils/access-control": "./utils/access-control.ts"
```

## Benefits

### 1. Single Source of Truth

All plan checking logic is centralized in one location, making it easier to:

- Maintain consistency
- Add new plan types
- Debug access control issues
- Update business logic

### 2. Type Safety

- Eliminates magic strings
- Uses TypeScript enums for compile-time checking
- Reduces potential for typos

### 3. Better Testing

- Unified functions are easier to unit test
- Consistent behavior across all modules
- Easier to mock for testing

### 4. Maintainability

- Changes to access control logic only need to be made in one place
- Clear function names make intent obvious
- Better code documentation

## Migration Guide

### Before

```typescript
// Old scattered checks
if (user?.planSlug === 'vt_plus') {
    // VT+ logic
}

// Magic strings
const quotaType = 'vt_plus';

// Inconsistent logic
const canUpgrade = user.planSlug !== 'vt_plus';
```

### After

```typescript
import { hasVTPlusAccess, canUpgrade, PlanSlug } from '@repo/shared/utils/access-control';

// Unified checks
if (hasVTPlusAccess(user)) {
    // VT+ logic
}

// Enum usage
const quotaType = PlanSlug.VT_PLUS;

// Consistent logic
const userCanUpgrade = canUpgrade(user);
```

## Testing

### Current Status

- ✅ Build passes successfully
- ✅ All imports and exports configured correctly
- ✅ Type checking passes
- 🔄 **Next:** Runtime testing needed

### Test Plan

1. **Pro Search**: Should consume "PS" quota correctly
2. **Deep Research**: Should continue consuming "DR" quota correctly
3. **RAG**: Should consume "RAG" quota correctly (investigate session.user.planSlug)
4. **Access Control**: All plan checks should work consistently

## Files Changed

### Core System

- `packages/shared/utils/access-control.ts` (new)
- `packages/shared/package.json` (export added)

### Quota System

- `packages/common/src/lib/geminiWithQuota.ts`
- `packages/ai/workflow/utils.ts`

### Utilities

- `packages/shared/utils/subscription.ts`
- `packages/shared/utils/plus-defaults.ts`

### Components & Tests

- `packages/common/components/rate-limit-usage-meter.tsx`
- `packages/common/__tests__/gemini-logic.test.ts`
- `packages/common/hooks/__tests__/use-logout.test.ts`
- `apps/web/app/tests/rag-auth-fix-unit.test.ts`
- `apps/web/app/api/completion/route.ts`

## Next Steps

1. **Test Runtime Behavior**: Verify quota consumption works correctly
2. **Add Logging**: Investigate RAG quota consumption issue
3. **Update Documentation**: Update any remaining documentation that references old patterns
4. **Code Review**: Ensure all team members understand the new unified system

## Future Enhancements

1. **Additional Plan Types**: Easy to add new plan types to the enum
2. **Feature-Based Access**: Expand the system to handle granular feature access
3. **Audit Logging**: Add logging for all access control decisions
4. **Cache Optimization**: Add caching for frequently accessed plan checks
