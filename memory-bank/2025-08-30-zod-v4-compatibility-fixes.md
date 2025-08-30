# Zod v4 Compatibility Fixes

**Date**: August 30, 2025
**Status**: ✅ Completed
**Priority**: Medium

## Problem

While investigating the Creem.io checkout error, I discovered some Zod v4 compatibility issues in the codebase. The main issues were:

1. `z.record()` usage without explicit key types (Zod v4 requires both key and value types)
2. ZodError property access using deprecated `errors` instead of `issues`
3. Potential compatibility issues with other Zod patterns

## Root Cause

Zod v4 introduced breaking changes:

- `z.record(valueType)` → `z.record(keyType, valueType)`
- `ZodError.errors` → `ZodError.issues`
- Stricter type checking for record schemas

## Solution

### 1. Updated z.record() Usage

Fixed all instances of `z.record()` to include explicit key types:

```typescript
// Before (Zod v3)
z.record(z.any());
z.record(z.string());

// After (Zod v4)
z.record(z.string(), z.any());
z.record(z.string(), z.string());
```

### 2. Files Updated

- `apps/web/app/api/metrics/database-maintenance/route.ts`
- `apps/web/app/api/webhook/creem/route.ts` (2 instances)
- `packages/common/components/custom-schema-builder.tsx`
- `packages/common/hooks/use-structured-extraction.ts`

### 3. Test Coverage

Created comprehensive test suite `apps/web/tests/zod-v4-compatibility.test.js` covering:

- Basic schema validation
- `z.iso.date()` and `z.iso.datetime()` usage
- Transform operations
- Refine operations
- ZodError handling (using `issues` property)
- SafeParse functionality
- Literal values
- Optional and default values
- Arrays and nested objects
- Enum validation
- API schema compatibility

## Verification

- ✅ All tests pass (14/14)
- ✅ Build completes successfully
- ✅ No Zod-related runtime errors
- ✅ Checkout functionality works correctly

## Impact

- ✅ Full Zod v4 compatibility maintained
- ✅ No breaking changes to existing functionality
- ✅ Future-proof schema validation
- ✅ Improved type safety

## Files Modified

- `apps/web/app/api/metrics/database-maintenance/route.ts`
- `apps/web/app/api/webhook/creem/route.ts`
- `packages/common/components/custom-schema-builder.tsx`
- `packages/common/hooks/use-structured-extraction.ts`
- `apps/web/tests/zod-v4-compatibility.test.js` (new)

## Notes

- The previous Zod v4 migration (2025-08-26) had already handled most compatibility issues
- These fixes addressed remaining `z.record()` usage patterns
- All schema validation continues to work as expected
- The Creem.io checkout fix was unrelated to these Zod issues

## Future Considerations

- Monitor for any new Zod v4 patterns in future development
- Consider using `zod/mini` for client-only code if bundle size becomes a concern
- Keep test suite updated with new Zod usage patterns
