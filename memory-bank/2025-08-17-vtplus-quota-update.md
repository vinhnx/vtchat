# VT+ Quota Update - August 17, 2025

## Summary

- Increased daily quotas for VT+ exclusive features:
  - Pro Search: 50 requests/day (was 20)
  - Deep Research: 25 requests/day (was 10)
- Updated all public docs and pages to reflect new limits.
- Synchronized default configuration and tests with new quotas.

## Files Updated

- `packages/shared/config/terms.ts`
- `packages/shared/config/privacy.ts`
- `apps/web/app/about/page.tsx`
- `apps/web/app/help/page.tsx`
- `apps/web/app/help/faq/page.tsx`
- `docs/guides/vtplus-rate-limiting.md`
- `packages/common/src/config/vtPlusLimits.ts`
- `packages/common/__tests__/vtplus-config.test.ts`
- `packages/common/__tests__/vtplus-limits-config.test.ts`
- `apps/web/app/tests/vtplus-daily-limits.test.ts`

## Impact

- Documentation and configuration now accurately describe current VT+ feature quotas.
- Tests aligned with new defaults.
