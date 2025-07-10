# Security Fix: Remove Sensitive Configuration Logging

## Issue

The chat store was logging sensitive configuration data including user-specific configuration keys that contain UUIDs.

## Fixed Instances

Removed `configKey: CONFIG_KEY` from logging in the following locations:

1. **Chat mode persistence** (`packages/common/store/chat.store.ts:1049`)
    - Removed `configKey` from log object
    - Kept `context` and `chatMode` for debugging

2. **Model persistence** (`packages/common/store/chat.store.ts:1315`)
    - Removed `configKey` from log object
    - Kept `context` and `modelId` for debugging

3. **User config persistence** (`packages/common/store/chat.store.ts:1693`)
    - Removed `configKey` from log object
    - Kept `context` and `userId` for debugging

## Security Impact

- Prevents exposure of sensitive user identifiers in logs
- Maintains necessary debugging information without compromising privacy
- Follows security best practice of not logging sensitive data

## Date

January 10, 2025
