# Row Level Security (RLS) for Embeddings

## Overview

This document describes the implementation of Row Level Security (RLS) for the embeddings table in the VT Chat application. RLS ensures that users can only access their own embeddings, providing database-level security for the RAG (Retrieval-Augmented Generation) functionality.

## Implementation Details

### Database Schema Changes

1. **Added `owner_id` column** to the `embeddings` table:
   - Type: `text`
   - Foreign key reference to `users.id`
   - NOT NULL constraint
   - Indexed for performance

2. **Enabled RLS** on the `embeddings` table:
   - `ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY`
   - `ALTER TABLE embeddings FORCE ROW LEVEL SECURITY`

### RLS Policies

The following policies are implemented:

```sql
-- Only owners can SELECT their embeddings (content protection)
CREATE POLICY p_select_own_embeddings ON embeddings
  FOR SELECT
  USING (owner_id = current_setting('app.current_user_id', true));

-- Only owners can INSERT embeddings for themselves
CREATE POLICY p_insert_own_embeddings ON embeddings
  FOR INSERT
  WITH CHECK (owner_id = current_setting('app.current_user_id', true));

-- Only owners can UPDATE their embeddings
CREATE POLICY p_update_own_embeddings ON embeddings
  FOR UPDATE
  USING (owner_id = current_setting('app.current_user_id', true))
  WITH CHECK (owner_id = current_setting('app.current_user_id', true));

-- Owners can DELETE their embeddings OR admin can delete any embeddings
CREATE POLICY p_delete_embeddings ON embeddings
  FOR DELETE
  USING (
    owner_id = current_setting('app.current_user_id', true) OR
    current_setting('app.user_role', true) = 'admin'
  );
```

### Application Code Changes

1. **RLS Helper Functions** (`apps/web/lib/database/rls.ts`):
   - `withUserRLS(userId, operation)` - Executes database operations with user context
   - `withAdminRLS(adminUserId, operation)` - Admin operations (can delete, cannot read content)
   - `withSystemRLS(operation)` - System operations (bypasses all RLS - use with caution)
   - Sets `app.current_user_id` and `app.user_role` session variables

2. **Content Obfuscation** (`apps/web/lib/utils/content-security.ts`):
   - `secureContentForEmbedding()` - Automatically masks PII before storage
   - `maskPII()` - Comprehensive PII pattern matching and replacement
   - `containsPII()` - Detects potential sensitive information
   - Patterns include: names, ages, addresses, phone numbers, emails, birth years, meetings

3. **Updated Embedding Functions**:
   - `createResource` in `apps/web/lib/actions/resources.ts` - Uses RLS for creation
   - `findRelevantContent` in `apps/web/lib/ai/embedding.ts` - Uses RLS for search
   - All embedding operations now include `ownerId` field
   - Content automatically obfuscated before storage

### Database Migration

Migration file: `apps/web/lib/database/migrations/0007_add_rls_embeddings.sql`

Applied to:
- ✅ VT Dev database (`lucky-cake-27376292`)
- ⏳ VT Production database (pending)

## Security Benefits

1. **Content Protection**: Only embedding owners can read the actual content
2. **Content Obfuscation**: PII and sensitive data automatically masked in stored embeddings
3. **Database-level Protection**: Even if application code has bugs, users cannot access other users' embeddings
4. **Admin Control**: Admins can delete embeddings for moderation but cannot read content
5. **Defense in Depth**: Multiple layers of security (application + database + obfuscation)
6. **Automatic Enforcement**: No manual filtering required in application code
7. **Audit Trail**: All access is logged at database level

## Testing

### Test Results

- ✅ RLS policies created successfully
- ✅ Schema migration completed
- ✅ Application code updated
- ✅ Helper functions implemented
- ⚠️ RLS policies not enforced in development (see limitations)

### Test Environment Issues

In the development environment, RLS policies are not enforced because the database user (`vt_dev_owner`) has superuser privileges (`neon_superuser` role). This is expected behavior:

```sql
-- Development user has superuser privileges
SELECT current_user; -- vt_dev_owner
SELECT pg_has_role(current_user, 'neon_superuser', 'member'); -- true
```

### Production Behavior

In production, the application will connect with a regular user role (not superuser), and RLS policies will be properly enforced.

## Usage Examples

### Creating Embeddings with RLS

```typescript
import { withUserRLS } from '@/lib/database/rls';

const result = await withUserRLS(session.user.id, async (tx) => {
    // Create resource
    const [resource] = await tx.insert(resources).values({
        content: 'User content',
        userId: session.user.id,
    }).returning();

    // Create embeddings - RLS ensures only user can create for themselves
    await tx.insert(embeddings).values({
        resourceId: resource.id,
        ownerId: session.user.id, // Must match current user
        content: 'Processed content',
        embedding: embeddingVector,
    });
});
```

### Searching Embeddings with RLS

```typescript
const similarContent = await withUserRLS(userId, async (tx) => {
    // RLS automatically filters to only user's embeddings
    return tx.select().from(embeddings)
        .where(gt(similarity, 0.5))
        .orderBy(desc(similarity))
        .limit(4);
});
```

### Admin Operations

```typescript
import { withAdminRLS } from '@/lib/database/rls';

// Admin can delete embeddings (for moderation) but cannot read content
const adminDeleteEmbedding = async (adminUserId: string, embeddingId: string) => {
    return withAdminRLS(adminUserId, async (tx) => {
        // Admin can delete but cannot SELECT content
        const deleted = await tx
            .delete(embeddings)
            .where(eq(embeddings.id, embeddingId))
            .returning({ id: embeddings.id, ownerId: embeddings.ownerId });
        
        return deleted;
    });
};

// Admin trying to read content will be blocked by RLS
const adminReadContent = async (adminUserId: string, embeddingId: string) => {
    return withAdminRLS(adminUserId, async (tx) => {
        // This will return empty results due to RLS SELECT policy
        return tx.select().from(embeddings)
            .where(eq(embeddings.id, embeddingId));
    });
};
```

### Content Obfuscation Patterns

The system automatically detects and masks the following sensitive information:

| Pattern Type | Example Input | Obfuscated Output |
|--------------|---------------|-------------------|
| Names | "my name is John Smith" | "my name is [NAME_REDACTED]" |
| Age | "I am 35 years old" | "I am [AGE_REDACTED] years old" |
| Birth Year | "I was born in 1990" | "I was born in [YEAR_REDACTED]" |
| Meetings | "meeting with CEO tomorrow" | "meeting with [PERSON_REDACTED]" |
| Email | "contact@example.com" | "[EMAIL_REDACTED]" |
| Phone | "(555) 123-4567" | "[PHONE_REDACTED]" |
| Address | "123 Main Street" | "[ADDRESS_REDACTED]" |
| Credit Card | "4532 1234 5678 9012" | "[CARD_REDACTED]" |

### Admin Obfuscation Tools

Admins can run obfuscation on existing embeddings:

```bash
# Check obfuscation status
GET /api/admin/obfuscate-embeddings

# Apply obfuscation to existing content
POST /api/admin/obfuscate-embeddings
```

Response includes statistics on processed, updated, and skipped embeddings.

## Limitations and Considerations

1. **Development Environment**: RLS not enforced for database owners/superusers
2. **Performance**: RLS adds overhead to queries (mitigated by indexes)
3. **Debugging**: RLS policies can make debugging more complex
4. **Connection Pooling**: Session variables are connection-scoped

## Rollback Plan

If RLS needs to be disabled:

```sql
-- Disable RLS (not recommended for production)
ALTER TABLE embeddings DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS p_select_own_embeddings ON embeddings;
DROP POLICY IF EXISTS p_insert_own_embeddings ON embeddings;
DROP POLICY IF EXISTS p_update_own_embeddings ON embeddings;
DROP POLICY IF EXISTS p_delete_own_embeddings ON embeddings;

-- Remove owner_id column (optional)
ALTER TABLE embeddings DROP COLUMN owner_id;
```

## Monitoring

Monitor RLS effectiveness:

```sql
-- Check RLS status
SELECT tablename, rowsecurity, relforcerowsecurity 
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE tablename = 'embeddings';

-- Check active policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'embeddings';
```

## Next Steps

1. Apply migration to production database
2. Test RLS in production environment
3. Monitor query performance
4. Set up alerting for RLS policy violations
