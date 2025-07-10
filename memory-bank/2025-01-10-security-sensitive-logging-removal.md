# Security: Removed Sensitive Logging from Chat Store

## Date

January 10, 2025

## Changes Made

### 1. Removed Sensitive Logging in setChatMode Function

- **File**: `packages/common/store/chat.store.ts`
- **Issue**: Log statement was exposing `chatMode` and `configKey` which could contain sensitive subscription information
- **Before**:
    ```typescript
    log.info(
        { context: 'ChatStore', chatMode, configKey: CONFIG_KEY },
        'Successfully persisted chat mode'
    );
    ```
- **After**:
    ```typescript
    log.info({ context: 'ChatStore' }, 'Successfully persisted chat mode');
    ```

### 2. Removed Sensitive Logging in setModel Function

- **File**: `packages/common/store/chat.store.ts`
- **Issue**: Log statement was exposing `modelId` and `configKey` which could contain sensitive subscription information
- **Before**:
    ```typescript
    log.info(
        { context: 'ChatStore', modelId: model.id, configKey: CONFIG_KEY },
        'Successfully persisted model'
    );
    ```
- **After**:
    ```typescript
    log.info({ context: 'ChatStore' }, 'Successfully persisted model');
    ```

### 3. Code Formatting

- Applied Biome formatter to fix formatting issues in the chat store file
- Fixed 1 formatting issue automatically

## Security Impact

- **High Priority**: Removed logging of potentially sensitive subscription data including:
    - Chat mode selection (could reveal subscription tier)
    - Model selection (could reveal access to premium models)
    - Config keys (could reveal user-specific identifiers)

## Verification

- Verified no other sensitive logging exists in the chat store file
- Confirmed existing safe logging patterns remain (only isAnonymous flags, no actual user IDs)
- Applied code formatting to maintain consistency

## Related Issue

- Fixed issue mentioned in TODO.md where logs were exposing `configKey` data like `chat-config-dc60d50d-9aac-47e7-8cb1-ce9000d28208`
- This addresses security concern about subscription-related information appearing in client-side logs

## Files Modified

- `packages/common/store/chat.store.ts`
