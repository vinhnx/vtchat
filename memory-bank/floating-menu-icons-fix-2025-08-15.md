# Floating Menu Icons Fix - August 15, 2025

## Summary
- **Issue**: Mobile floating menu icons were clipped by the main container due to overflow and border radius.
- **Fix**: Updated root layout container to only apply `rounded-sm` and `overflow-hidden` on desktop (`md:` breakpoint) so mobile view uses `rounded-none` and `overflow-visible`.
- **Benefit**: Floating menu buttons (menu and user avatar) now remain fully visible and accessible on mobile devices.

## Files Modified
- `packages/common/components/layout/root.tsx`
