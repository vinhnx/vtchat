# VT+ Rate Limiting System

This guide documents the VT+ rate limiting system that tracks and enforces usage quotas for premium features in VT Chat.

## Overview

The VT+ rate limiting system provides quota-based access control for three premium features:
- **Deep Research (DR)** - Advanced research workflows with multiple AI model calls
- **Pro Search (PS)** - Enhanced search capabilities with web grounding  
- **RAG Personal Assistant (RAG)** - Document processing and knowledge management

## Architecture

### Core Components

1. **Configuration** (`packages/common/src/config/vtPlusLimits.ts`)
   - Feature definitions and default limits
   - Environment variable overrides
   - QuotaExceededError class

2. **Rate Limiter** (`packages/common/src/lib/vtplusRateLimiter.ts`)
   - Atomic quota consumption using PostgreSQL UPSERT
   - Usage tracking and retrieval
   - Race condition prevention

3. **Quota Wrappers** (`packages/common/src/lib/geminiWithQuota.ts`)
   - AI SDK call interceptors for server-funded models
   - Automatic quota enforcement for VT+ users

4. **Database Schema** (`apps/web/lib/database/migrations/0009_vtplus_usage.sql`)
   - `vtplus_usage` table with atomic constraints
   - Unique constraint on (user_id, feature, period_start)

## Features and Limits

### Default Monthly Limits

| Feature | Code | Default Limit | Estimated Cost |
|---------|------|---------------|----------------|
| Deep Research | `DR` | 500 completions | ~$30-40/month |
| Pro Search | `PS` | 800 completions | ~$40-50/month |
| RAG Assistant | `RAG` | 2000 completions | ~$80-100/month |

### Environment Configuration

Override defaults with environment variables:

```bash
# VT+ Rate Limiting Configuration
VTPLUS_LIMIT_DR=500     # Deep Research - completions per month
VTPLUS_LIMIT_PS=800     # Pro Search - completions per month  
VTPLUS_LIMIT_RAG=2000   # RAG Personal Assistant - completions per month
```

## Usage Tracking

### Completion Call Counting

The system counts **individual AI model API calls**, not user requests:

- **Deep Research**: 5 API calls per user request
  - refine-query task: 1 call
  - planner task: 1 call  
  - gemini-web-search task: 1 call
  - analysis task: 1 call
  - writer task: 1 call

- **Pro Search**: 1-2 API calls per user request
- **RAG Assistant**: 1 API call per conversation turn

### Quota Consumption Logic

```typescript
// Only consume quota for VT+ users using server-funded models
if (userId && userTier === 'PLUS' && !isByokKey) {
    await consumeQuota({
        userId,
        feature: VtPlusFeature.DEEP_RESEARCH,
        amount: 1, // per API call
    });
}
```

### Bypass Conditions

Quota is **not consumed** when:
- User provides their own API keys (BYOK)
- User is not on VT+ plan
- Using free models only

## Database Design

### Schema

```sql
CREATE TABLE vtplus_usage (
    id bigint primary key generated always as identity,
    user_id uuid not null,
    feature text not null,
    period_start date not null,
    used int not null default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint vtplus_unique unique (user_id, feature, period_start),
    constraint chk_non_negative check (used >= 0),
    constraint chk_valid_feature check (feature in ('DR', 'PS', 'RAG')),
    constraint chk_reasonable_limit check (used <= 1000000)
);
```

### Atomic UPSERT Pattern

Race conditions are prevented using PostgreSQL's atomic UPSERT:

```sql
INSERT INTO vtplus_usage (user_id, feature, period_start, used)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, feature, period_start)
DO UPDATE SET 
    used = vtplus_usage.used + $4,
    updated_at = now()
RETURNING used;
```

## API Integration

### Workflow Integration

Tasks automatically consume quota by passing feature parameters:

```typescript
// In workflow tasks (planner.ts, analysis.ts, etc.)
import { VtPlusFeature } from '@repo/common/config/vtPlusLimits';

const vtplusFeature = mode === ChatMode.Deep ? VtPlusFeature.DEEP_RESEARCH : 
                     mode === ChatMode.Pro ? VtPlusFeature.PRO_SEARCH : VtPlusFeature.DEEP_RESEARCH;

await generateObject({
    // ... other parameters
    userId: context?.get('userId'),
    feature: vtplusFeature,
});
```

### API Routes

Quota consumption is handled in:
- `/api/completion` - Deep Research and Pro Search
- `/api/agent/chat` - RAG Assistant
- `/api/chat/assistant` - RAG Assistant

### Error Handling

```typescript
try {
    await streamTextWithQuota(params, quotaOptions);
} catch (error) {
    if (error instanceof QuotaExceededError) {
        return new Response(
            JSON.stringify({
                error: 'quota_exceeded',
                message: error.message,
                feature: error.feature,
                limit: error.limit,
                used: error.used,
            }),
            { status: 429 }
        );
    }
    throw error;
}
```

## User Interface

### Usage Display

VT+ usage is displayed in the settings modal via:
- `packages/common/components/vtplus-usage-meter.tsx`
- `/api/vtplus/usage` endpoint
- Real-time usage updates

### Features

- Current usage vs. limits for all three features
- Monthly usage periods (resets on billing cycle)
- Visual progress bars and warnings at 90% usage
- Upgrade prompts when limits are reached

## Testing

### Unit Tests

- Configuration validation (`vtplus-config.test.ts`)
- Feature limits and error handling (`vtplus-limits-config.test.ts`)
- Concurrency simulation (`vtplus-concurrency-unit.test.ts`)

### Integration Tests

- Real database race condition testing (`vtplus-concurrency.test.ts`)
- 20+ parallel quota consumption calls
- Mixed amount concurrency testing

Run tests:
```bash
# Unit tests
bun test packages/common/__tests__/vtplus-*.test.ts

# Integration tests (requires database)
bun test packages/common/__tests__/vtplus-concurrency.test.ts
```

## Deployment

### Database Migration

1. **Preparation**:
   ```sql
   CREATE TABLE vtplus_usage_new (...);
   -- Copy existing data if any
   ALTER TABLE vtplus_usage RENAME TO vtplus_usage_backup;
   ALTER TABLE vtplus_usage_new RENAME TO vtplus_usage;
   ```

2. **Application Deployment**:
   ```bash
   ./deploy-fly.sh --auto --version patch
   ```

3. **Verification**:
   - Monitor logs for quota consumption
   - Test VT+ features in staging
   - Verify usage tracking in UI

### Rollback Plan

```sql
-- Emergency rollback
DROP TABLE vtplus_usage;
ALTER TABLE vtplus_usage_backup RENAME TO vtplus_usage;
-- Redeploy previous application version
```

## Monitoring

### Logging

All quota operations are logged with structured data:

```typescript
log.info({ 
    userId, 
    feature, 
    amount,
    used,
    limit 
}, 'VT+ quota consumed');
```

### Metrics to Monitor

- Quota consumption rate per feature
- QuotaExceededError frequency
- Database operation latency
- Usage pattern analysis

### Alerts

Set up alerts for:
- High QuotaExceededError rate (>10/minute)
- Database connection saturation
- Unusual usage spikes

## Performance Optimization

### Future Enhancements

1. **Redis Caching** (planned)
   - Cache `getAllUsage` results for 30-60 seconds
   - Invalidate on quota consumption
   - Reduce database read load by >90%

2. **Admin Tooling** (planned)
   - CLI for quota adjustments
   - Web UI for usage monitoring
   - Custom limit overrides

3. **Advanced Analytics**
   - Usage trending and forecasting
   - Cost optimization recommendations
   - User behavior insights

## Troubleshooting

### Common Issues

1. **Quota not consuming**
   - Check user tier: must be VT+ 
   - Verify BYOK status: should be false for quota consumption
   - Confirm feature mapping in workflow tasks

2. **Race condition concerns**
   - Monitor for duplicate rows in `vtplus_usage`
   - Check UNIQUE constraint enforcement
   - Review concurrent test results

3. **Performance issues**
   - Monitor database connection pool usage
   - Check query execution plans
   - Consider implementing Redis cache

### Debugging

Enable detailed logging:
```bash
export LOG_LEVEL=debug
```

Check quota status:
```typescript
const usage = await getUsage({
    userId: 'user-id',
    feature: VtPlusFeature.DEEP_RESEARCH,
});
console.log(usage);
```

## Security Considerations

### Data Protection

- User IDs are UUIDs, not sequential
- No sensitive data stored in usage table
- Quota limits prevent resource abuse

### Input Validation

- Feature values validated against enum
- Amount values must be positive integers
- User IDs validated for proper format

### Access Control

- Only VT+ users can consume server quota
- BYOK users manage their own limits
- Admin tools require proper authentication

---

For implementation details, see the source code in:
- `packages/common/src/config/vtPlusLimits.ts`
- `packages/common/src/lib/vtplusRateLimiter.ts`
- `packages/ai/workflow/utils.ts`
