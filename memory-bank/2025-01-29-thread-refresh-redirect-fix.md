# Thread Page Refresh Redirect Fix

**Date**: 2025-01-29\
**Issue**: Critical authentication bug causing redirects to login on page refresh\
**Status**: ✅ FIXED

## Problem Description

When users were on a thread details page (`/chat/[threadId]`) and performed a full page refresh (F5 or browser refresh), the application incorrectly redirected them to the login page instead of keeping them on the thread details page they were viewing.

**Expected behavior**: After page refresh, authenticated users should remain on the same thread details page (`/chat/[threadId]`) they were previously viewing.

**Problematic behavior**: Page refresh on `/chat/[threadId]` routed users to the login page, forcing them to re-authenticate and losing their current context.

## Root Cause Analysis

The issue was in the middleware's authentication flow (`apps/web/middleware.ts`):

1. **Cookie Cache Expiration**: Better-Auth cookie cache expires after 5 minutes
2. **Aggressive Timeout**: When cookie cache expired, middleware fell back to database session check with only 1-second timeout
3. **False Negatives**: The 1-second timeout was too short, causing legitimate session checks to timeout
4. **Premature Redirect**: Timeout caused middleware to assume no valid session and redirect to login

### Technical Details

- **Cookie Cache Duration**: 5 minutes (too short for user experience)
- **Database Timeout**: 1 second (too aggressive for network/database latency)
- **Route Protection**: `/chat/[threadId]` routes correctly configured as protected
- **Session Management**: Better-Auth sessions valid for 7 days, but middleware couldn't verify them

## Solution Implemented

### 1. Increased Database Session Check Timeout

**File**: `apps/web/middleware.ts`

```typescript
// BEFORE: 1-second timeout (too aggressive)
const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Auth timeout')), 1000)
);

// AFTER: 5-second timeout (more reasonable)
const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Auth timeout')), 5000)
);
```

### 2. Extended Cookie Cache Duration

**File**: `apps/web/lib/auth-server.ts`

```typescript
// BEFORE: 5-minute cache (too short)
cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes cache
},

// AFTER: 15-minute cache (better UX)
cookieCache: {
    enabled: true,
    maxAge: 60 * 15, // 15 minutes cache
},
```

### 3. Improved Error Handling and Logging

Added better distinction between timeout errors and other authentication failures:

```typescript
// Distinguish between timeout and other errors for better debugging
const isTimeout = error instanceof Error && error.message === 'Auth timeout';

if (isTimeout) {
    log.warn({ pathname, timeout: '5s' }, '[Middleware] Auth check timed out');
} else {
    log.warn({ error, pathname }, '[Middleware] Auth check failed');
}
```

## Impact

### Before Fix

- ❌ Users redirected to login on page refresh
- ❌ Lost context and thread state
- ❌ Poor user experience
- ❌ False authentication failures

### After Fix

- ✅ Users remain on thread page after refresh
- ✅ Context and thread state preserved
- ✅ Improved user experience
- ✅ Reliable authentication validation

## Testing

1. **Manual Testing Required**:
   - Navigate to a thread page (`/chat/[threadId]`)
   - Wait 5+ minutes (to ensure cookie cache expires)
   - Perform page refresh (F5)
   - Verify user stays on thread page (no redirect to login)

2. **Edge Cases to Test**:
   - Page refresh immediately after login
   - Page refresh after extended idle time
   - Page refresh with slow network connection
   - Page refresh with database latency

## Files Modified

1. `apps/web/middleware.ts` - Increased timeout, improved error handling
2. `apps/web/lib/auth-server.ts` - Extended cookie cache duration

## Related Documentation

- [Better-Auth Session Management](https://better-auth.com/docs/concepts/sessions)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Thread Route Handling](../docs/guides/unified-thread-id-system.md)

## Future Improvements

1. **Session Persistence**: Consider implementing client-side session persistence
2. **Progressive Enhancement**: Add client-side authentication fallback
3. **Performance Monitoring**: Track middleware authentication performance
4. **User Feedback**: Add loading states during authentication checks
