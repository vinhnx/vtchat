# 2025-01-09 — Image Generation Follow-Up Chat Fix

## Issue Fixed

- **Problem**: Follow-up messages in image generation conversations were failing with "Prompt is required" error
- **Root Cause**: Client-side prompt processing in `runImageFlow` function wasn't properly validating and cleaning prompts
- **Impact**: Users couldn't continue conversations with generated images (e.g., "change the color to pink")

## Solution Implemented

- **Added prompt validation**: Clean and validate prompts in `runImageFlow` before API calls
- **User-friendly errors**: Show helpful toast messages for empty prompts instead of server errors
- **Consistent processing**: Use cleaned prompt throughout the entire flow (thread creation, API calls)

## Files Modified

- `packages/common/components/chat-input/input.tsx`: Added `cleanPrompt` validation and processing
- `apps/web/app/api/image/route.ts`: Simplified user tier handling (removed compilation error)
- `docs/image-generation-followup-fix.md`: Complete fix documentation

## Testing Verified

✅ Initial image generation works
✅ Follow-up messages like "change to porsche taycan" work
✅ Multiple follow-ups work correctly
✅ Empty prompts show user-friendly errors

## Technical Notes

- The issue was specific to follow-up messages routed through regular chat input vs direct ImageGenButton usage
- Fixed by ensuring consistent prompt cleaning between both flows
- Added early validation to provide better UX and prevent server-side errors
