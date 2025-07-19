# Admin System Documentation

## Overview

VTChat uses Better-Auth's admin plugin for role-based access control. This system replaces hardcoded admin emails with a flexible, database-driven approach that supports user management, session control, and admin panel access.

## Admin Account Setup

### Creating Admin Accounts

#### Method 1: Environment Variable (Recommended for initial setup)

Set the environment variable for comma-separated admin user IDs:

```bash
ADMIN_USER_IDS="user-id-1,user-id-2,user-id-3"
```

#### Method 2: Database Role Assignment

Promote existing users to admin using the promotion script:

```bash
bun run scripts/promote-admin.js user@example.com
```

#### Method 3: Direct Database Update

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Admin Role Validation

- Roles are validated by database constraint: `CHECK (role IN ('user', 'admin'))`
- Banned users cannot have admin privileges
- Admin status requires both `role = 'admin'` AND `banned = false`

## Admin Panel Access

### Web/Desktop Access

1. Click your user avatar (top right)
2. Select **"Admin Dashboard"** from dropdown
3. Direct URL: `/admin/database-maintenance`

### Mobile Access

1. Tap menu button (≡)
2. Tap your user avatar
3. Select **"Admin Dashboard"** from dropdown

### Admin Dashboard Features

- **Real-time database health monitoring**
- **Maintenance operation tracking**
- **Success/error rate analytics**
- **System alerts and warnings**
- **Recent activity logs**
- **Auto-refresh every 5 minutes**

## API Endpoints

### Admin Status Check

```
GET /api/admin/check-status
```

Returns: `{ isAdmin: boolean }`

### Database Maintenance Dashboard

```
GET /api/admin/database-maintenance-dashboard?hours=24
```

Returns comprehensive dashboard data for specified time window.

### Embedding Obfuscation

```
POST /api/admin/obfuscate-embeddings
```

Admin-only endpoint for content security operations.

## Environment Configuration

### Environment Variables

```bash
# Primary admin configuration (supports multiple comma-separated IDs)
ADMIN_USER_IDS="user-id-1,user-id-2"

# Backwards compatibility (single admin)
ADMIN_USER_ID="single-user-id"

# Better-Auth configuration
NEXT_PUBLIC_BETTER_AUTH_URL="your-auth-url"
DATABASE_URL="your-database-url"
```

### Better-Auth Plugin Configuration

The admin plugin is configured with:

- **Default Role**: 'user'
- **Admin Roles**: ['admin']
- **Admin User IDs**: Environment variable driven
- **Session Management**: Multi-session support with impersonation tracking

## Database Schema

### Users Table Admin Fields

```sql
role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
banned BOOLEAN DEFAULT false
ban_reason TEXT
ban_expires TIMESTAMP
```

### Sessions Table Admin Fields

```sql
impersonated_by TEXT  -- Tracks admin impersonation
```

### Performance Indexes

- `users_role_idx` - Fast role lookups
- `users_banned_partial_idx` - Banned user queries
- `sessions_impersonated_by_idx` - Impersonation tracking

## Admin Features

### User Management

- **Role Assignment**: Promote/demote users
- **User Banning**: Temporary or permanent bans
- **Session Control**: View and revoke user sessions
- **Impersonation**: Act as other users (with audit trail)

### System Monitoring

- **Database Health**: Real-time metrics
- **Maintenance Operations**: Automated task monitoring
- **Performance Analytics**: Success rates and timing
- **Alert System**: Critical issue notifications

### Content Security

- **Embedding Obfuscation**: Secure sensitive content
- **PII Protection**: Automated content screening
- **Audit Logging**: Track admin actions

## Security Features

### Access Control

- **Role-based permissions** using Better-Auth
- **Session validation** for all admin routes
- **Banned user protection** - banned users cannot be admin
- **Environment-based override** for emergency access

### Audit Trail

- **Admin actions logged** in database
- **Impersonation tracking** in sessions table
- **Role changes recorded** with timestamps
- **Ban/unban activities tracked**

### Performance & Caching

- **5-minute admin status cache** reduces API calls
- **Request deduplication** prevents concurrent requests
- **Database indexes** optimize admin queries
- **Manual cache invalidation** for role changes

## Code Integration

### Server-Side Admin Checks

```typescript
import { isUserAdmin, requireAdmin, AdminAccessRequiredError } from '@/lib/admin';

// Check admin status
const adminStatus = await isUserAdmin(userId);

// Require admin (throws AdminAccessRequiredError)
await requireAdmin();
```

### Client-Side Admin Hook

```typescript
import { useAdmin } from '@repo/common/hooks';

function MyComponent() {
  const { isAdmin, loading, invalidateAdminCache } = useAdmin();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      <button onClick={invalidateAdminCache}>Refresh Admin Status</button>
    </div>
  );
}
```

### Error Handling

```typescript
try {
    await requireAdmin();
    // Admin-only code
} catch (error) {
    if (error instanceof AdminAccessRequiredError) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw error;
}
```

## Best Practices

### Security

1. **Minimal Admin Count**: Only assign admin role when necessary
2. **Regular Audits**: Review admin actions and access logs
3. **Environment Variables**: Keep admin IDs in secure environment config
4. **Session Monitoring**: Watch for suspicious admin activities

### Performance

1. **Cache Admin Status**: Use provided caching mechanisms
2. **Batch Operations**: Group admin queries when possible
3. **Index Utilization**: Ensure database indexes are maintained
4. **Monitor Query Performance**: Watch admin-related query metrics

### Maintenance

1. **Regular Cleanup**: Remove inactive admin accounts
2. **Role Reviews**: Periodic admin role audits
3. **Ban Expiration**: Monitor and clean expired bans
4. **Session Cleanup**: Regular session table maintenance

## Troubleshooting

### Common Issues

#### Admin Panel Not Showing

- Check user role in database: `SELECT role FROM users WHERE id = 'user-id'`
- Verify user is not banned: `SELECT banned FROM users WHERE id = 'user-id'`
- Clear admin status cache: Use `invalidateAdminCache()` function

#### Environment Variable Issues

- Ensure `ADMIN_USER_IDS` is properly formatted (comma-separated)
- Check for trailing spaces or invalid characters
- Verify environment is loaded in application

#### Database Performance

- Monitor admin-related indexes
- Check for slow queries involving role/banned columns
- Review session table size and cleanup policies

### Debugging Commands

#### Check Admin Status

```sql
SELECT id, email, role, banned, ban_expires
FROM users
WHERE role = 'admin' OR banned = true;
```

#### View Admin Sessions

```sql
SELECT s.*, u.email
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE u.role = 'admin'
ORDER BY s.created_at DESC;
```

#### Check Impersonation Activity

```sql
SELECT s.*, u1.email as admin_email, u2.email as target_email
FROM sessions s
JOIN users u1 ON s.impersonated_by = u1.id
JOIN users u2 ON s.user_id = u2.id
WHERE s.impersonated_by IS NOT NULL;
```

## Migration Guide

### From Hardcoded Emails

If migrating from hardcoded admin emails:

1. **Identify Current Admins**: List all hardcoded admin emails
2. **Create Admin Roles**: Use promotion script for each admin
3. **Update Environment**: Set `ADMIN_USER_IDS` if needed
4. **Test Access**: Verify admin panel access works
5. **Remove Hardcoded Values**: Clean up old admin email arrays

### Database Migration

The admin system requires these database changes:

```sql
-- Add admin plugin fields
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN ban_reason TEXT;
ALTER TABLE users ADD COLUMN ban_expires TIMESTAMP;
ALTER TABLE sessions ADD COLUMN impersonated_by TEXT;

-- Add constraints and indexes
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
CREATE INDEX users_role_idx ON users(role) WHERE role IS NOT NULL;
CREATE INDEX users_banned_partial_idx ON users(banned) WHERE banned = true;
CREATE INDEX sessions_impersonated_by_idx ON sessions(impersonated_by) WHERE impersonated_by IS NOT NULL;
```

---

This admin system provides enterprise-grade user management while maintaining security, performance, and ease of use. For additional support or feature requests, refer to the Better-Auth documentation or create an issue in the project repository.
