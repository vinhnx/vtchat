# Next.js 15 Upgrade Analysis & Implementation

Date: January 13, 2025

## Summary

VTChat project was already running Next.js 15.3.5, but required migration of deprecated synchronous APIs to new async patterns. Successfully applied Next.js 15 codemods and manually fixed all compatibility issues.

## Current Versions

- **Next.js**: 15.3.5 ✅ (latest)
- **React**: 18.3.1 ⚠️ (should upgrade to 19.0.0)
- **Node.js**: Compatible
- **TypeScript**: 5.x ✅

## Key Breaking Changes Addressed

### 1. Async Request APIs

**Issue**: `headers()`, `cookies()`, `draftMode()` are now async functions
**Solution**: Applied `next-async-request-api` codemod + manual fixes

#### Before:

```typescript
const headers = headers();
const cookieStore = cookies();
```

#### After:

```typescript
const headersList = await headers();
const cookieStore = await cookies();
```

### 2. Async Page Props (params/searchParams)

**Issue**: `params` and `searchParams` are now Promise-wrapped
**Solution**: Use React's `use()` hook

#### Before:

```typescript
const ChatPage = ({ params }: { params: { threadId: string } }) => {
    const { threadId } = params;
};
```

#### After:

```typescript
const ChatPage = (props: { params: Promise<{ threadId: string }> }) => {
    const params = use(props.params);
    const { threadId } = params;
};
```

## Files Modified

### API Routes (8 files):

1. `apps/web/app/api/agent/knowledge/route.ts`
2. `apps/web/app/api/agent/clear/route.ts`
3. `apps/web/app/api/agent/delete/route.ts`
4. `apps/web/app/api/agent/chat/route.ts`
5. `apps/web/app/api/chat/assistant/route.ts`
6. `apps/web/app/api/admin/obfuscate-embeddings/route.ts`
7. `apps/web/app/chat/[threadId]/page.tsx`
8. `apps/web/lib/actions/resources.ts`

### Common Pattern Fixed:

```typescript
// Old pattern (deprecated)
const session = await auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers()),
});

// New pattern (Next.js 15)
import { headers } from 'next/headers';
const session = await auth.api.getSession({
    headers: await headers(),
});
```

## Codemod Applied

```bash
bunx @next/codemod@latest next-async-request-api . --force
```

**Results**:

- 683 files processed
- 8 files modified
- 0 errors
- 675 unmodified

## Manual Fixes Required

The codemod left `@next-codemod-error` comments that required manual intervention:

1. Fixed dynamic imports to direct imports
2. Updated variable names to avoid conflicts (`headers` → `headersList`)
3. Added proper imports for `headers` function
4. Updated React component patterns to use `use()` hook

## React 19 Upgrade Recommendation

Next.js 15 recommends React 19 for full feature compatibility:

- `useFormState` → `useActionState`
- Enhanced `useFormStatus` with additional properties
- Better Server Component support

## Testing Status

- ✅ Build completed successfully
- ✅ No TypeScript errors from Next.js 15 changes
- ✅ All async patterns implemented correctly
- ⚠️ Full production testing recommended

## Breaking Changes Not Applicable

- **fetch caching**: Already using appropriate cache settings
- **Route Handlers**: No changes needed for GET endpoints
- **Client-side Router Cache**: Using default behavior
- **next/font**: Already using built-in next/font
- **NextRequest geolocation**: Not using these deprecated properties

## Architecture Impact

The async request APIs change aligns well with VTChat's architecture:

- Better-Auth session management works correctly with async headers
- VT+ access control functions properly await headers for IP detection
- Database operations remain unaffected
- Zustand stores continue working as expected

## Future Considerations

1. **React 19 Migration**: Plan upgrade for enhanced Server Actions
2. **Performance Monitoring**: Track impact of async header calls
3. **Error Handling**: Monitor for async timing issues in production
4. **Cache Optimization**: Review if new cache behaviors benefit VTChat

## Production Deployment

Ready for production with current changes. Consider React 19 upgrade as separate task.
