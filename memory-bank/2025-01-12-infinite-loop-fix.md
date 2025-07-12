# Infinite Loop Fix - Admin Users Page
*Date: 2025-01-12*

## Problem Diagnosed by Oracle

The admin users page (`/admin/users`) was experiencing an infinite loop of API calls to `/api/auth/admin/list-users`, causing continuous database queries and performance issues.

### Root Cause Analysis

**Issue:** React `useEffect` was subscribed to the function reference (`fetchUsers`) instead of its dependencies:

```typescript
// PROBLEMATIC CODE:
useEffect(() => {
  fetchUsers();
}, [fetchUsers]); // <-- subscribing to function reference
```

**How the loop occurred:**
1. `fetchUsers` runs and updates local state (`setUsers`, `setLoading`, etc.)
2. State update triggers re-render → new `fetchUsers` instance created (despite `useCallback`)
3. `useEffect` sees different function reference and fires again
4. New request sent → infinite cycle continues

**Amplified in Development:** React 18 Strict Mode mounts components twice, making the issue more visible as a waterfall of identical API calls.

## Solution Implemented

### 1. Fixed useEffect Dependencies
Changed from subscribing to function reference to subscribing to the actual values that should trigger reloads:

```typescript
// FIXED CODE:
// Re-load whenever filters / pagination change
useEffect(() => {
  fetchUsers();
  // fetchUsers is stable *inside* a render, we only need the inputs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedSearchTerm, roleFilter, statusFilter, currentPage]);
```

### 2. Stabilized Constants
Moved page size constant outside component to prevent it from entering dependency arrays:

```typescript
// At top of file, outside component:
const PAGE_SIZE = 10;

// Inside component, removed from dependencies:
const fetchUsers = useCallback(async () => {
  const queryParams = {
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
    // ...
  };
}, [debouncedSearchTerm, roleFilter, statusFilter, currentPage, toast]);
```

### 3. Cleaned Up All References
Updated all `pageSize` references to use the stable `PAGE_SIZE` constant:
- Query parameters
- Pagination calculations  
- Display text

## Files Modified

### `apps/web/app/admin/users/page.tsx`
- Moved `PAGE_SIZE` constant outside component
- Fixed `useEffect` to depend on values instead of function reference
- Updated all `pageSize` references to `PAGE_SIZE`
- Cleaned up `useCallback` dependencies

## Technical Details

### Before Fix:
```typescript
const fetchUsers = useCallback(async () => {
  // ... fetch logic
}, [debouncedSearchTerm, roleFilter, statusFilter, currentPage, pageSize, toast]);

useEffect(() => {
  fetchUsers();
}, [fetchUsers]); // ❌ Function reference dependency
```

### After Fix:
```typescript
const PAGE_SIZE = 10; // Outside component

const fetchUsers = useCallback(async () => {
  // ... fetch logic using PAGE_SIZE
}, [debouncedSearchTerm, roleFilter, statusFilter, currentPage, toast]);

useEffect(() => {
  fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps  
}, [debouncedSearchTerm, roleFilter, statusFilter, currentPage]); // ✅ Value dependencies
```

## Impact

### Before Fix:
- Infinite API calls to `/api/auth/admin/list-users`
- Continuous database queries: `select "id", "name", "email"... from "users"`
- Poor performance and resource usage
- Development console flooded with network requests

### After Fix:
- API calls only when filters or pagination actually change
- Single request per user interaction
- Optimal database query patterns
- Clean development experience

## Testing Verification

### Server Restart Test:
1. ✅ Development server starts cleanly (`bun dev`)
2. ✅ Admin users page loads successfully (HTTP 200)
3. ✅ No infinite loop in server logs
4. ✅ Database queries only when expected

### Expected Behavior:
- API call on initial page load
- API call when search term changes (after 300ms debounce)
- API call when role filter changes
- API call when status filter changes  
- API call when pagination changes
- **No API calls** during idle state

## Prevention Guidelines

### React Hook Dependencies Best Practices:
1. **Subscribe to values, not functions** in `useEffect`
2. **Move constants outside components** when possible
3. **Stabilize functions with `useCallback`** but don't depend on them in effects
4. **Use exhaustive-deps ESLint rule** but understand when to disable it
5. **Test in React Strict Mode** to catch dependency issues early

### Code Review Checklist:
- [ ] `useEffect` dependencies are actual values that should trigger re-runs
- [ ] Function references aren't in dependency arrays unless absolutely necessary
- [ ] Constants are stable across renders
- [ ] `useCallback` dependencies are minimal and stable
- [ ] No infinite loops in development console

---
*Infinite loop issue successfully resolved. Admin users page now performs optimally with proper React hooks patterns.*
