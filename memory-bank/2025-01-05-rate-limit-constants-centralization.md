# Rate Limit Constants Centralization Implementation

**Date:** 2025-01-05  
**Task:** Replace hardcoded rate limit numbers with centralized constants  
**Status:** ✅ Approved and Implemented  

## Problem Statement
Multiple files contained hardcoded rate limit numbers (20/5 for free tier, 100/10 for VT+ tier) that needed to be centralized for consistency and maintainability. Any future rate limit changes would require updating multiple files manually.

## Oracle Plan Implementation
Following the Oracle's detailed plan, implemented a single source of truth for rate limit constants:

### 1. Created Central Constants File
- **File:** `packages/shared/constants/rate-limits.ts`
- **Contents:** 
  - `GEMINI_FLASH_LIMITS` object with FREE_DAY, FREE_MINUTE, PLUS_DAY, PLUS_MINUTE
  - `limitText` helper functions for consistent UI formatting
  - Normalized wording: "requests/day" and "/min" format

### 2. Updated Backend Rate Limit Service
- **File:** `apps/web/lib/services/rate-limit.ts`
- **Changes:** Replaced hardcoded numbers with `GEMINI_FLASH_LIMITS` constants
- **Impact:** Single source of truth for all rate limiting logic

### 3. Updated User-Facing Files
- **About Page:** `apps/web/app/about/page.tsx` - Uses `limitText.compare()`
- **Pricing Config:** `apps/web/lib/config/pricing.ts` - Uses `limitText.free()` and `limitText.compare()`
- **Usage Meter:** `packages/common/components/rate-limit-usage-meter.tsx` - Uses `limitText.plus()` and `GEMINI_FLASH_LIMITS`

### 4. Package Exports Configuration
- Added `"./constants/rate-limits"` export to `packages/shared/package.json`
- Added re-export in `packages/shared/constants/index.ts`
- Enables both direct imports and through main constants index

## Oracle Review & Approval
**Status:** ✅ Approved with addressed feedback

**Oracle Feedback Addressed:**
- ✅ Normalized wording in limitText helpers for consistency
- ✅ Added re-export in constants/index.ts for alternative import paths
- ✅ Successfully builds and compiles

## Implementation Details

### Constants Structure
```typescript
export const GEMINI_FLASH_LIMITS = {
    FREE_DAY: 20,
    FREE_MINUTE: 5,
    PLUS_DAY: 100,
    PLUS_MINUTE: 10,
} as const;

export const limitText = {
    free: () => `${GEMINI_FLASH_LIMITS.FREE_DAY} requests/day, ${GEMINI_FLASH_LIMITS.FREE_MINUTE}/min`,
    plus: () => `${GEMINI_FLASH_LIMITS.PLUS_DAY} requests/day, ${GEMINI_FLASH_LIMITS.PLUS_MINUTE}/min`,
    compare: () => `${limitText.plus()} vs ${GEMINI_FLASH_LIMITS.FREE_DAY}/day, ${GEMINI_FLASH_LIMITS.FREE_MINUTE}/min`,
} as const;
```

### Import Patterns
- Direct: `import { GEMINI_FLASH_LIMITS, limitText } from '@repo/shared/constants/rate-limits'`
- Through index: `import { GEMINI_FLASH_LIMITS } from '@repo/shared/constants'`

## Impact
- **Consistency:** All rate limit displays now use identical formatting
- **Maintainability:** Single point to change rate limits affects entire application
- **Future-proof:** Helper functions ensure consistent messaging
- **Type Safety:** Constants provide compile-time checks for rate limit values

## Files Modified
1. `packages/shared/constants/rate-limits.ts` (new)
2. `packages/shared/constants/index.ts` (added re-export)
3. `packages/shared/package.json` (added export)
4. `apps/web/lib/services/rate-limit.ts` (backend constants)
5. `apps/web/app/about/page.tsx` (UI display)
6. `apps/web/lib/config/pricing.ts` (pricing descriptions)
7. `packages/common/components/rate-limit-usage-meter.tsx` (usage display)

## Next Steps (Oracle Suggestions)
- Optional: Update remaining hardcoded numbers in FAQ, terms, privacy pages
- Optional: Update test files to use constants for future-proofing
- All core runtime code now uses centralized constants ✅
