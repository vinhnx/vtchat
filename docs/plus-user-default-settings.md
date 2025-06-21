# Plus User Default Settings Implementation

## Overview

This implementation automatically enables default settings for VT+ subscribers, specifically:

1. **Thinking Mode Settings** (enabled by default for plus users):
   - Enable Thinking Mode: `true`
   - Show Thought Process: `true` 
   - Thinking Budget: `2048` tokens (default)

2. **Gemini Explicit Caching Settings** (enabled by default for plus users):
   - Enable Explicit Caching: `true`
   - Cache Duration: `3600` seconds (1 hour)
   - Max Cached Conversations: `1`

## Implementation Details

### Files Created/Modified

1. **`packages/shared/utils/plus-defaults.ts`** - Core utility for managing plus user defaults
2. **`packages/common/hooks/use-plus-defaults.ts`** - React hook for automatic settings application
3. **`packages/common/components/plus-defaults-provider.tsx`** - Provider component for settings management
4. **`packages/common/store/app.store.ts`** - Updated store with plus defaults integration
5. **`apps/web/app/layout.tsx`** - Added PlusDefaultsProvider to app hierarchy

### Key Features

- **Automatic Application**: Settings are automatically applied when a user subscribes to VT+
- **Upgrade Detection**: When upgrading from base to plus, plus defaults are applied
- **User Customization Preservation**: User's custom settings (like budget values) are preserved when possible
- **Downgrade Handling**: When downgrading to base plan, base defaults are restored

### Context7 Integration

The implementation follows Context7 patterns for:
- Configuration-based defaults
- Feature-specific settings
- Subscription-aware behavior

### Usage

The implementation works automatically through the provider hierarchy:

```tsx
<SubscriptionProvider>
  <PlusDefaultsProvider>
    <YourApp />
  </PlusDefaultsProvider>
</SubscriptionProvider>
```

### Utility Functions

- `getDefaultSettingsForPlan(plan)` - Get defaults based on plan
- `getDefaultSettingsForFeatures(features)` - Get defaults based on available features
- `mergeWithPlusDefaults(current, plan)` - Merge current settings with defaults
- `shouldApplyPlusDefaults(current, newPlan, previousPlan)` - Check if defaults should be applied

### Hooks

- `usePlusDefaults()` - Automatically manages settings based on subscription changes
- `usePlusDefaultsControl()` - Manual control for applying defaults (useful for settings UI)

## Testing

The implementation has been tested with:
- Build verification (`bun run build`)
- Code formatting (`bun run format`)
- Type checking for core functionality

## Benefits

1. **Better User Experience**: Plus users get optimal settings by default
2. **Feature Discovery**: Users discover plus features automatically
3. **Consistent Behavior**: All plus users start with the same optimal configuration
4. **Seamless Upgrades**: No manual configuration needed after upgrading

## Configuration

Default values can be modified in `packages/shared/utils/plus-defaults.ts`:

```typescript
export const PLUS_THINKING_MODE_DEFAULTS = {
    enabled: true,
    budget: THINKING_MODE.DEFAULT_BUDGET,
    includeThoughts: true,
} as const;

export const PLUS_GEMINI_CACHING_DEFAULTS = {
    enabled: true,
    ttlSeconds: 3600, // 1 hour
    maxCaches: 1,
} as const;
```
