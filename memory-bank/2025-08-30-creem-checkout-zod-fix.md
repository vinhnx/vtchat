# Creem.io Checkout Zod Validation Fix

**Date**: August 30, 2025
**Status**: ✅ Completed
**Priority**: Critical

## Problem

The Creem.io checkout process was failing with a critical error:

```
"Failed to create checkout session: Input validation failed: TypeError: Cannot read properties of undefined (reading '_zod')"
```

This error was occurring when users tried to subscribe to VT+ through the pricing page, preventing any new subscriptions.

## Root Cause

The issue was in the Creem SDK (version 0.3.37) where internal Zod validation was failing due to an undefined object trying to access the `_zod` property. This appears to be an internal SDK bug where the validation schema wasn't properly initialized.

## Solution

Implemented a robust fallback mechanism in `packages/shared/config/payment.ts`:

1. **Primary**: Try using the Creem SDK as usual
2. **Fallback**: If SDK fails with Zod error, fall back to direct API calls to Creem endpoints
3. **Error Detection**: Specifically catch errors containing `_zod` or `Input validation failed`
4. **API Endpoints**: Use appropriate sandbox/production endpoints based on environment

### Key Changes

```typescript
// In PaymentService.createCheckout()
try {
    result = await PaymentService.client.createCheckout({...});
} catch (sdkError: any) {
    // Check if this is the Zod validation error
    if (sdkError.message?.includes('_zod') || sdkError.message?.includes('Input validation failed')) {
        // Fallback to direct API call
        const apiEndpoint = isProductionEnvironment()
            ? 'https://api.creem.io/v1/checkouts'
            : 'https://test-api.creem.io/v1/checkouts';

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': PaymentService.API_KEY!,
            },
            body: JSON.stringify(requestBody),
        });

        // Transform response to match SDK format
        result = await response.json();
    }
}
```

## Testing

1. **Manual Testing**: Verified checkout process works end-to-end
2. **Unit Tests**: Added tests in `apps/web/tests/checkout-fix.test.js`
3. **Logs**: Confirmed fallback mechanism activates and succeeds

### Test Results

```
[PaymentService] SDK Zod error detected, falling back to direct API call
[PaymentService] Making direct API call to Creem
[PaymentService] Checkout session created successfully
```

## Impact

- ✅ VT+ subscriptions now work reliably
- ✅ Graceful degradation when SDK fails
- ✅ No user-facing changes required
- ✅ Maintains full functionality

## Files Modified

- `packages/shared/config/payment.ts` - Added fallback mechanism
- `apps/web/tests/checkout-fix.test.js` - Added verification tests

## Future Considerations

- Monitor Creem SDK updates for permanent fix
- Consider migrating to direct API calls if SDK issues persist
- Add monitoring for fallback usage frequency

## Verification

The fix was tested with a real checkout attempt and successfully created checkout session `ch_2ip57aY5eR3EgNyYrhbxBi`, confirming the fallback mechanism works correctly.
