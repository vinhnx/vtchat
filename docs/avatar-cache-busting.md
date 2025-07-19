# Avatar Cache Busting

## Overview

VTChat implements avatar cache busting to ensure user profile images are properly refreshed when updated. This prevents stale avatar images from being displayed due to browser caching.

## Implementation

### Session-Based Cache Busting

The application uses session-based cache busting via the `getSessionCacheBustedAvatarUrl()` utility function. This approach:

- Appends a session-unique timestamp to avatar URLs
- Ensures avatars refresh on each page/session refresh
- Maintains consistency within the same browser session
- Reduces unnecessary network requests

### Components Affected

The following components have been updated with cache-busting:

1. **UserButton** (`packages/common/components/user-button.tsx`)
    - Used in sidebars and navigation areas
    - Displays user avatar in dropdown menu

2. **NavUser** (`packages/common/components/dashboard/nav-user.tsx`)
    - Dashboard sidebar user component
    - Shows avatar in both collapsed and expanded states

3. **UserProfileSettings** (`packages/common/components/user-profile-settings.tsx`)
    - Profile settings page avatar display
    - Used in user account management

4. **Admin Users Table** (`apps/web/app/admin/users/columns.tsx`)
    - User listing in admin dashboard
    - Ensures admin sees up-to-date user avatars

## Technical Details

### Cache Busting Functions

```typescript
// Session-based cache busting (recommended)
getSessionCacheBustedAvatarUrl(url: string | null | undefined): string | undefined

// Timestamp-based cache busting (for real-time updates)
getCacheBustedAvatarUrl(url: string | null | undefined): string | undefined
```

### Session ID Generation

The session ID is generated using `window.performance.timeOrigin` which provides:

- Consistent value across page reloads within the same session
- Unique value for each browser session
- Fallback to `Date.now()` for server-side rendering

### URL Parameter Format

Cache-busted URLs follow this pattern:

```
https://example.com/avatar.jpg?_sid=1234567890000
https://example.com/avatar.jpg?size=100&_sid=1234567890000
```

## Benefits

1. **Fresh Avatars**: Users see updated profile pictures immediately after changes
2. **Session Consistency**: Avatars remain stable during a browsing session
3. **Minimal Network Impact**: Only refreshes on session/page reload
4. **Backward Compatibility**: Works with existing avatar URLs and OAuth providers

## Testing

The implementation includes comprehensive unit tests covering:

- Null/undefined URL handling
- Query parameter detection and appending
- Session ID generation consistency
- Browser environment compatibility

Run tests with:

```bash
bun test packages/common/utils/__tests__/avatar-cache.test.ts
```
