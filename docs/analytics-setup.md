# Analytics Setup - Vemetric Only

VTChat uses **Vemetric** as the primary and only analytics solution. Vercel Web Analytics has been explicitly disabled.

## Configuration

### 1. Vercel Analytics - DISABLED ❌

- **Status**: Disabled in `next.config.mjs` and `vercel.json`
- **Reason**: Using Vemetric as the single analytics solution
- **Files**: 
  - `apps/web/next.config.mjs` - `analyticsId: ''`
  - `apps/web/vercel.json` - `"analytics": false`

### 2. Vemetric Analytics - ENABLED ✅

- **Status**: Primary analytics solution
- **Provider**: Vemetric (`@vemetric/react`, `@vemetric/node`)
- **Configuration**: `packages/common/lib/analytics-config.ts`

#### Environment Variables Required:
```env
# Frontend tracking (required)
NEXT_PUBLIC_VEMETRIC_TOKEN=your_vemetric_token

# Backend tracking (optional)
VEMETRIC_TOKEN=your_vemetric_backend_token

# Custom host (optional)
VEMETRIC_HOST=https://hub.vemetric.com
```

#### Features Enabled:
- ✅ Page view tracking
- ✅ User event tracking
- ✅ Performance monitoring
- ✅ Custom events
- ✅ User journey tracking
- ✅ Subscription analytics
- ✅ Payment tracking

## Implementation

### Frontend Components
```tsx
// Layout integration
<VemetricScript token={process.env.NEXT_PUBLIC_VEMETRIC_TOKEN} />
<VemetricAuthProvider>
  <VemetricChatTracker />
  <VemetricSubscriptionTracker />
  <VemetricSettingsTracker />
</VemetricAuthProvider>
```

### Backend Service
```typescript
import { vemetricBackend } from '@repo/common/services/vemetric-backend';

// Track server-side events
await vemetricBackend.trackEvent('custom_event', { data });
```

## CORS Configuration

If experiencing CORS issues with Vemetric:

1. **Check Domain Allowlist**: Add your domains in Vemetric dashboard
2. **Test Connection**: Run `bun scripts/test-vemetric-connection.js`
3. **Verify Config**: Run `bun scripts/check-vemetric-config.js`

### Required Domains:
```
localhost:3000
localhost:3001
yourapp.com
*.vercel.app
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Solution: Add domains to Vemetric allowlist
   - Fallback: Errors are silently handled in production

2. **Missing Token**:
   - Check `NEXT_PUBLIC_VEMETRIC_TOKEN` is set
   - Verify token is valid in Vemetric dashboard

3. **Failed Requests**:
   - Use debug mode: `useVemetric({ debug: true })`
   - Check network tab for request details

## Migration from Vercel Analytics

✅ **Complete** - Vercel Analytics has been fully disabled:

1. Removed from Next.js config
2. Disabled in Vercel project settings
3. Analytics script injection prevented
4. All tracking migrated to Vemetric

No action required for existing deployments.
