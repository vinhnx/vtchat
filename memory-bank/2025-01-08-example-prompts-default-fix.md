# Example Prompts Default Setting Fix

**Date**: 2025-01-08
**Type**: Bug Fix / UX Improvement
**Status**: ✅ Completed

## Issue

PersonalizedGreeting and example prompts were not showing on the chat home page due to `showExamplePrompts` being set to `false` by default, creating a poor onboarding experience for new users.

## Root Cause

- `showExamplePrompts` setting defaulted to `false` in app store
- ExamplePrompts component returns `null` when setting is disabled
- New users couldn't see example prompts to understand what they could do
- Home page felt empty without prompts

## Solution

Updated default value for `showExamplePrompts` to `true` in two locations:

1. **Initial state** in app store:

    ```typescript
    showExamplePrompts: true, // Enable by default for better onboarding
    ```

2. **Reset function** for consistency:
    ```typescript
    state.showExamplePrompts = true; // Enable by default for better onboarding
    ```

## Files Modified

- `packages/common/store/app.store.ts` - Updated default values

## Impact

- ✅ Better onboarding experience for new users
- ✅ PersonalizedGreeting now visible with example prompts
- ✅ Users can still disable in settings if preferred
- ✅ Consistent experience across user states

## Related

- Addresses TODO item: "example doesn't show even toggle from settings"
- Improves overall home page welcome experience
- Maintains user preference controls

## Testing

- Verify home page shows PersonalizedGreeting and example prompts by default
- Confirm setting can still be toggled off in preferences
- Test reset user state maintains the improved defaults
