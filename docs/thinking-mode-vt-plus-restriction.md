# Thinking Mode VT+ Restriction Implementation

## Overview

This document outlines the implementation of restricting "thinking mode" (AI reasoning/step-by-step explanations) to VT+ (plus) users only.

## Implementation Summary

### 1. Backend Enforcement (API Level)

#### Updated Files:

- `apps/web/app/api/completion/types.ts`
- `apps/web/app/api/completion/route.ts`
- `apps/web/app/api/completion/stream-handlers.ts`

#### Changes:

1. **Request Schema Validation**: Added `thinkingMode` field to `completionRequestSchema` in `types.ts`:

    ```typescript
    thinkingMode: z
        .object({
            enabled: z.boolean(),
            budget: z.number(),
            includeThoughts: z.boolean(),
        })
        .optional(),
    ```

2. **API Route Enforcement**: Added VT+ access check in `route.ts`:

    ```typescript
    // Backend enforcement: Thinking mode is restricted to VT+ users only
    if (data.thinkingMode?.enabled) {
        const accessResult = await checkVTPlusAccess({ userId, ip });
        if (!accessResult.hasAccess) {
            return new Response(
                JSON.stringify({
                    error: 'VT+ subscription required for thinking mode',
                    reason: 'Thinking mode is a VT+ exclusive feature',
                    requiredFeature: 'THINKING_MODE',
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    }
    ```

3. **Workflow Integration**: Updated `stream-handlers.ts` to pass `thinkingMode` to the workflow:
    ```typescript
    const workflow = runWorkflow({
        // ...other params
        thinkingMode: data.thinkingMode,
    });
    ```

### 2. Client-Side Protection (UI Level)

#### Existing Protection:

The UI already had proper gating in place:

1. **ReasoningModeSettings Component**: Uses `useFeatureAccess(FeatureSlug.THINKING_MODE)` to check VT+ access
2. **ThinkingModeIndicator Component**: Only shows indicator for VT+ users with access
3. **Feature Access Hook**: `useFeatureAccess` properly validates subscription status

#### Files Already Protected:

- `packages/common/components/reasoning-mode-settings.tsx`
- `packages/common/components/chat-input/thinking-mode-indicator.tsx`
- `packages/common/hooks/use-subscription-access.ts`

### 3. Workflow Level Protection

#### Existing Integration:

The AI workflow already properly handles thinking mode:

1. **Flow Integration**: `packages/ai/workflow/flow.ts` passes `thinkingMode` to workflow context
2. **Task Implementation**: Writer and analysis tasks use `context?.get('thinkingMode')`
3. **AI Utils**: `packages/ai/workflow/utils.ts` has proper thinking mode integration with LLM calls

## Security Flow

1. **Client Request**: User attempts to use thinking mode
2. **UI Gating**: Components check VT+ access and prevent UI toggling for free users
3. **Request Validation**: API validates request schema including `thinkingMode` field
4. **Backend Enforcement**: API checks VT+ access if `thinkingMode.enabled = true`
5. **Workflow Execution**: If approved, workflow receives thinking mode config
6. **LLM Integration**: AI utils use thinking mode only if properly configured

## Protection Layers

1. **UI Layer**: Prevents free users from enabling thinking mode in settings
2. **API Layer**: Validates VT+ access before processing requests with thinking mode
3. **Schema Layer**: Ensures proper data structure and validation
4. **Workflow Layer**: Properly passes thinking mode configuration to AI components

## Testing Scenarios

### Free User Tests:

1. ✅ UI should not show thinking mode toggle
2. ✅ API should reject requests with `thinkingMode.enabled = true`
3. ✅ Workflow should not receive thinking mode configuration

### VT+ User Tests:

1. ✅ UI should show thinking mode settings
2. ✅ API should accept requests with valid thinking mode configuration
3. ✅ Workflow should receive and use thinking mode configuration
4. ✅ LLM calls should include reasoning capabilities when enabled

## Error Responses

Free users attempting to bypass restrictions will receive:

```json
{
    "error": "VT+ subscription required for thinking mode",
    "reason": "Thinking mode is a VT+ exclusive feature",
    "requiredFeature": "THINKING_MODE"
}
```

## Implementation Status: ✅ COMPLETE

All layers of protection are now in place:

- ✅ Backend API enforcement
- ✅ Request schema validation
- ✅ Workflow integration
- ✅ UI gating (already existed)
- ✅ Proper error handling
