# HTTP Client Migration Guide: From fetch/secure-http to ky

## Overview

This guide shows how to migrate from your current HTTP patterns to the new `ky`-based HTTP client, which will significantly reduce LOC and improve code maintainability.

## Current vs New Approach

### Before (using fetch/secure-http)

```typescript
// Old way with manual error handling
const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VTChat/1.0',
    },
    body: JSON.stringify(data),
    signal: controller.signal,
});

if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

const result = await response.json();
```

### After (using ky)

```typescript
// New way with automatic JSON handling and error handling
import { http } from '@repo/shared/lib/http-client';

const result = await http.post(url, { body: data });
```

## Migration Examples

### 1. Simple GET requests

**Before:**

```typescript
const response = await fetch('/api/user/profile');
const data = await response.json();
```

**After:**

```typescript
const data = await http.get('/api/user/profile');
```

### 2. POST with JSON body

**Before:**

```typescript
const response = await fetch('/api/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
});
const result = await response.json();
```

**After:**

```typescript
const result = await http.post('/api/completion', { body: requestData });
```

### 3. Requests with API keys (secure-http replacement)

**Before (secure-http):**

```typescript
import { secureFetch } from '@repo/shared/utils/secure-http';

const result = await secureFetch('/api/admin/users', {
    method: 'GET',
    apiKeys: { openai: 'sk-...' },
});
```

**After:**

```typescript
import { http } from '@repo/shared/lib/http-client';

const result = await http.get('/api/admin/users', {
    apiKeys: { openai: 'sk-...' },
});
```

### 4. Specialized API clients

**Completion API:**

```typescript
import { completionApi } from '@repo/shared/lib/http-client';

const result = await completionApi.post(chatData, {
    apiKeys: { openai: userApiKey },
});
```

**Admin API:**

```typescript
import { adminApi } from '@repo/shared/lib/http-client';

const users = await adminApi.get('/users');
const result = await adminApi.post('/settings', { body: newSettings });
```

## Benefits of Migration

### 1. **Automatic Features**

- ✅ Automatic JSON parsing
- ✅ Built-in retry logic
- ✅ Request/response logging
- ✅ Error handling
- ✅ Type safety

### 2. **Security Features**

- ✅ HTTPS validation in production
- ✅ API keys in headers (not body)
- ✅ Secure logging (no sensitive data)
- ✅ Request timeout handling

### 3. **Developer Experience**

- ✅ Cleaner, more readable code
- ✅ TypeScript-first design
- ✅ Consistent error handling
- ✅ Less boilerplate

## Files to Migrate (Priority Order)

### High Priority (Most LOC reduction)

1. **`apps/web/app/admin/page.tsx`** - Multiple fetch calls
2. **`packages/common/utils/subscription-client.ts`** - API state management
3. **`packages/common/components/link-preview.tsx`** - OG data fetching
4. **`apps/web/app/api/completion/route.ts`** - External API calls

### Medium Priority

1. **`packages/common/components/feedback-widget.tsx`**
2. **`packages/common/components/recent-threads.tsx`**
3. **All admin API routes**

### Low Priority

1. **Test files and scripts**
2. **One-off utility functions**

## Migration Script

You can use this script to help identify files that need migration:

```bash
# Find all files with fetch calls
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "fetch(" > fetch_files.txt

# Find files using secure-http
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "secureFetch" > secure_http_files.txt
```

## Example: Complete File Migration

### Before: `apps/web/app/admin/page.tsx` (partial)

```typescript
const [analytics, infrastructure, security] = await Promise.all([
    fetch('/api/admin/analytics'),
    fetch('/api/admin/infrastructure'),
    fetch('/api/admin/security'),
]);

const analyticsData = await analytics.json();
const infrastructureData = await infrastructure.json();
const securityData = await security.json();
```

### After: `apps/web/app/admin/page.tsx` (partial)

```typescript
import { adminApi } from '@repo/shared/lib/http-client';

const [analyticsData, infrastructureData, securityData] = await Promise.all([
    adminApi.get('/analytics'),
    adminApi.get('/infrastructure'),
    adminApi.get('/security'),
]);
```

**LOC Reduction: 6 lines → 3 lines (50% reduction)**

## Next Steps

1. **Start with high-priority files** - maximum impact
2. **Update one file at a time** - easier to test and debug
3. **Remove old dependencies** - once migration is complete:
   ```bash
   bun remove node-fetch undici
   ```
4. **Consider react-query** - for additional API state management benefits

## Estimated Impact

- **Total LOC reduction**: 200-500 lines
- **Files affected**: 51 files with fetch calls
- **Dependencies removed**: `node-fetch`, `undici`, custom `secure-http`
- **Code maintainability**: Significantly improved
- **Type safety**: Enhanced with ky's TypeScript-first design
