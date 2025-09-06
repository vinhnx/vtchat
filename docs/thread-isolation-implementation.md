# Thread Isolation & User Account Management Implementation

## Overview

This document describes the implementation of per-account thread isolation and comprehensive user session management in VT. The solution ensures that threads are isolated per user account while maintaining the local-only storage approach using IndexedDB.

## Problem Statement

The original requirements were:

1. **Gated Access Management**: Ensure all subscription/feature access is cleared on user logout
2. **Sidebar Button**: Show appropriate subscription management options based on user status
3. **Thread Isolation**: Implement per-account thread management with the current local-only (Dexie/IndexedDB) implementation

## Solution Architecture

### 1. User Session & Logout Management ✅

**Implementation**: Enhanced the existing logout flow in `packages/common/hooks/use-logout.ts`

**Key Changes**:

- Added `clearAllThreads()` call to logout process
- Maintains existing gated feature clearing (API keys, MCP config, subscription cache)
- Ensures complete session cleanup on logout

**Code Location**: `packages/common/hooks/use-logout.ts`

### 2. Subscription Button Management ✅

**Status**: Already correctly implemented

**Implementation**: Sidebar logic in `packages/common/components/side-bar.tsx` correctly shows:

- "Manage Subscription" for VT+ subscribers
- "Upgrade to Plus" for non-subscribers

**Code Location**: `packages/common/components/side-bar.tsx`

### 3. Per-Account Thread Isolation ✅

**Implementation**: User-specific database namespacing with automatic switching

#### Database Namespacing

**Approach**: Modified the IndexedDB database naming strategy to include user identification:

```typescript
// Database naming pattern:
// Authenticated users: "threads-{userId}"
// Anonymous users: "threads-anonymous"

const getDatabaseName = (userId: string | null): string => {
    return userId ? `threads-${userId}` : 'threads-anonymous';
};
```

**Code Location**: `packages/common/store/chat.store.ts`

#### Automatic Database Switching

**Implementation**: Created authentication-aware hook that monitors user state changes and switches thread databases automatically.

**Key Components**:

1. **Thread Authentication Hook** (`packages/common/hooks/use-thread-auth.ts`):
    - Monitors user session changes
    - Triggers database switches when user login/logout occurs
    - Provides logging for debugging

2. **Database Management Functions** (`packages/common/store/chat.store.ts`):
    - `initializeUserDatabase(userId)`: Sets up user-specific database
    - `switchUserDatabase(userId)`: Switches active database and loads user's threads
    - Graceful error handling and fallback states

3. **Global Integration** (`packages/common/context/root.tsx`):
    - Integrated `useThreadAuth()` hook into root provider
    - Ensures database switching runs globally across the application

## Technical Implementation Details

### Thread Database Management

```typescript
// Core database switching logic
switchUserDatabase: async (userId: string | null) => {
    try {
        console.log(`[ThreadDB] Switching to database for user: ${userId || 'anonymous'}`);

        // Initialize the new user-specific database
        initializeUserDatabase(userId);

        // Load data from the new database
        const newData = await loadInitialData();

        // Update the store with data from the new user's database
        set({
            threads: newData.threads,
            threadItems: [],
            currentThreadId: newData.currentThreadId,
            // ... other state updates
        });

        console.log(
            `[ThreadDB] Successfully switched to user database with ${newData.threads.length} threads`
        );
    } catch (error) {
        console.error('[ThreadDB] Error switching user database:', error);
        // Fallback to clean state on error
    }
};
```

### Authentication-Based Switching

```typescript
// Hook that monitors authentication changes
export const useThreadAuth = () => {
    const { data: session } = useSession();
    const switchUserDatabase = useChatStore(state => state.switchUserDatabase);
    const previousUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        const currentUserId = session?.user?.id || null;
        const previousUserId = previousUserIdRef.current;

        // Only switch database if user actually changed
        if (currentUserId !== previousUserId) {
            switchUserDatabase(currentUserId);
            previousUserIdRef.current = currentUserId;
        }
    }, [session?.user?.id, switchUserDatabase]);
};
```

## User Experience

### Authentication Flow

1. **Anonymous User**: Uses `threads-anonymous` database
2. **User Login**: Automatically switches to `threads-{userId}` database
3. **User Logout**: Clears all threads and switches back to `threads-anonymous`
4. **User Switch**: Seamlessly switches between user-specific databases

### Data Isolation

- **Complete Isolation**: Each user sees only their own threads
- **No Cross-Contamination**: No access to other users' thread data
- **Logout Security**: All thread data cleared on logout
- **Anonymous Support**: Anonymous users get their own isolated space

### Limitations

- **Device-Specific**: Threads remain local to the device/browser
- **No Cross-Device Sync**: User's threads are not synced across devices
- **Local Storage Dependency**: Relies on IndexedDB availability

## Files Modified

1. **`packages/common/hooks/use-logout.ts`**
    - Added `clearAllThreads()` call to logout flow

2. **`packages/common/store/chat.store.ts`**
    - Implemented user-specific database namespacing
    - Added `switchUserDatabase()` and `initializeUserDatabase()` functions
    - Modified database initialization logic

3. **`packages/common/hooks/use-thread-auth.ts`** (New)
    - Created authentication monitoring hook
    - Handles automatic database switching

4. **`packages/common/hooks/index.ts`**
    - Exported new `useThreadAuth` hook

5. **`packages/common/context/root.tsx`**
    - Integrated `useThreadAuth()` hook globally

## Testing & Validation

- ✅ **Build Test**: Successful compilation with no TypeScript errors
- ✅ **Type Safety**: All types properly maintained
- ✅ **Integration**: Hook properly integrated into global context
- ✅ **Error Handling**: Graceful fallbacks implemented
- ✅ **Logging**: Debug logging added for troubleshooting

## Benefits

1. **Privacy**: Complete thread isolation between user accounts
2. **Security**: Thread data cleared on logout
3. **Performance**: Local-only storage remains fast
4. **Seamless UX**: Automatic switching without user intervention
5. **Robust**: Graceful error handling and fallback states
6. **Maintainable**: Clean separation of concerns

## Future Considerations

1. **Cross-Device Sync**: Could implement server-side thread storage for sync
2. **Migration Path**: Current approach allows easy migration to server-side storage
3. **Backup/Export**: Could add thread export functionality for user data portability
4. **Analytics**: Database switching events provide insights into user behavior

## Conclusion

The implemented solution successfully addresses all requirements:

- ✅ **Gated access cleared on logout**
- ✅ **Sidebar button shows correct subscription options**
- ✅ **Per-account thread isolation implemented with local storage**

The approach maintains the performance benefits of local-only storage while providing complete user isolation and a seamless authentication experience.
