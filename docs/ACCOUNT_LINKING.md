# Account Linking Implementation

This document describes the enhanced account linking system that ensures accurate UI state based on database information.

## Key Improvements

### 1. Database-First Approach

The system now prioritizes database information over cached session data:

- **Direct Database Queries**: `apps/web/app/api/auth/list-accounts/route.ts` provides real-time account status
- **Accurate State Detection**: UI reflects actual database state, not cached information
- **Neon MCP Ready**: Infrastructure prepared for Neon MCP integration

### 2. OAuth Callback Handling

Account linking success is only shown after OAuth callback completion:

```typescript
// Before: Immediate success feedback (unreliable)
await linkSocial({ provider: 'google' });
setSuccess('Account linked!'); // ❌ May not be accurate

// After: Callback-based success detection (reliable)
localStorage.setItem('linking_provider', provider);
await linkSocial({ provider: 'google' });
// Success shown only after OAuth callback verification ✅
```

### 3. Enhanced UI States

The UI now provides accurate visual feedback:

- **Connected State**: Green background, checkmark overlay, "Connected" badge
- **Linking State**: Loading spinner, "Connecting..." text
- **Just Connected**: Animated "Just Connected!" badge with pulse effect
- **Error State**: Clear error messages with retry options

### 4. Database Schema

The system uses Better Auth's standard accounts table:

```sql
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### List Linked Accounts

```
GET /api/auth/list-accounts
```

Returns all linked OAuth accounts for the authenticated user:

```json
{
    "success": true,
    "accounts": [
        {
            "id": "acc_123",
            "accountId": "google_123456789",
            "providerId": "google",
            "userId": "user_456",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
        }
    ],
    "userId": "user_456"
}
```

## Neon MCP Integration

The system is prepared for Neon MCP integration for direct database queries:

### Example Configuration

```json
{
    "mcpServers": {
        "neon": {
            "command": "npx",
            "args": ["-y", "@neondatabase/mcp-server"],
            "env": {
                "DATABASE_URL": "postgresql://username:password@host/database"
            }
        }
    }
}
```

### Example Queries

```sql
-- Get all linked accounts for a user
SELECT
    id,
    account_id as "accountId",
    provider_id as "providerId",
    user_id as "userId",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM accounts
WHERE user_id = $1
ORDER BY created_at DESC;

-- Check if specific provider is linked
SELECT EXISTS(
    SELECT 1 FROM accounts
    WHERE user_id = $1 AND provider_id = $2
) as "exists";
```

## Components

### UserProfileSettings

Main component for account linking UI located at:
`packages/common/components/user-profile-settings.tsx`

Key features:

- Real-time database state checking
- OAuth callback detection
- Visual feedback for all states
- Error handling and retry logic

### Database Utilities

Helper functions for account linking queries:
`packages/common/utils/account-linking-db.ts`

Functions:

- `getLinkedAccountsFromDB()` - Fetch accounts via API
- `isProviderLinked()` - Check specific provider status
- `getLinkedAccountsFromNeonMCP()` - Neon MCP example
- `isProviderLinkedMCP()` - MCP existence check

## Testing

The implementation ensures:

1. **UI shows linked state only when account is actually linked in database**
2. **Success feedback appears only after OAuth callback completion**
3. **Error states are handled gracefully with retry options**
4. **Loading states provide clear user feedback**

## Security

- OAuth tokens are stored securely in the database
- Session management follows Better Auth security practices
- Account unlinking prevents orphaned OAuth tokens
- Proper cleanup on logout to prevent data leakage

## Future Enhancements

1. **Full Neon MCP Integration**: Replace API calls with direct MCP queries
2. **Real-time Updates**: WebSocket-based account status updates
3. **Enhanced Error Handling**: More specific error messages for different OAuth failures
4. **Audit Logging**: Track account linking/unlinking events for security
