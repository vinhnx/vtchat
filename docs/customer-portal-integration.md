# Customer Portal Integration

## Overview

The customer portal integration allows VT+ subscribers to manage their subscriptions through Creem.io's billing portal. This implementation directly calls the Creem.io API to retrieve a personalized portal URL for each customer.

## API Endpoint

### POST `/api/portal`

**Description**: Generates a customer portal URL for subscription management.

**Authentication**: Required (user must be logged in)

**Request Body**: None (user ID is extracted from session)

**Response**:

```json
{
  "success": true,
  "url": "https://portal.creem.io/customer/manage/abc123"
}
```

**Error Response**:

```json
{
  "error": "Authentication required"
}
```

## Implementation Details

### 1. Customer ID Resolution

The system attempts to find the customer ID in the following order:

1. **Primary**: `users.creem_customer_id` field
2. **Fallback**: `user_subscriptions.stripe_customer_id` field (legacy, to be renamed)

### 2. Creem API Integration

The implementation calls the Creem.io API directly:

```typescript
const response = await fetch(`${baseUrl}/v1/customers/billing`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': CREEM_API_KEY,
  },
  body: JSON.stringify({
    customer_id: customerId,
  }),
});
```

**API Response Handling:**

The Creem.io API returns the portal URL in the `customer_portal_link` field:

```json
{
  "customer_portal_link": "https://creem.io/test/my-orders/login/abc123"
}
```

The implementation supports multiple response formats:

- `customer_portal_link` (Creem.io specific)
- `url`, `portalUrl`, `link` (generic formats)
- Direct string response

### 3. Environment Configuration

- **Sandbox**: `https://test-api.creem.io/v1/customers/billing`
- **Production**: `https://api.creem.io/v1/customers/billing`

### 4. Frontend Integration

The `useCreemSubscription` hook provides the `openCustomerPortal` function:

```typescript
const { openCustomerPortal, isLoading } = useCreemSubscription();

// Usage
await openCustomerPortal(); // Redirects to portal
```

## Environment Variables

Required environment variables in `.env`:

```bash
CREEM_API_KEY=creem_test_xxxxxxxxxxxx  # Use test key for development
CREEM_PRODUCT_ID=your_product_id_here
CREEM_WEBHOOK_SECRET=your_webhook_secret
```

## Loading States

The implementation includes comprehensive loading states for better user experience:

### Hook Loading States

```typescript
const {
  openCustomerPortal,
  isPortalLoading,  // Specific to portal operations
  isLoading         // General subscription loading
} = useCreemSubscription();
```

### Component Integration

**Usage Credits Settings:**

- Button shows "Loading..." text when `isPortalLoading` is true
- Button is disabled during portal operations

**Sidebar:**

- "Manage Subscription" button shows loading state
- Tooltip remains functional during loading

**Plus Page:**

- Subscription buttons show loading indicators
- Buttons are disabled during portal/payment operations

## Error Handling

The implementation includes comprehensive error handling:

1. **Authentication Errors**: Redirects to login
2. **Missing Customer ID**: Falls back to upgrade page
3. **API Errors**: Shows user-friendly error messages
4. **Network Errors**: Graceful degradation

## Testing

Run the customer portal tests:

```bash
bun test apps/web/app/tests/test-customer-portal.js
```

## Components Using Portal

The following components integrate with the customer portal:

1. `apps/web/app/plus/page.tsx` - Main subscription page
2. `packages/common/components/side-bar.tsx` - Sidebar manage button
3. `packages/common/components/usage-credits-settings.tsx` - Settings page

## Security Considerations

1. All API keys are server-side only
2. Customer IDs are validated against authenticated user
3. Portal URLs are single-use and time-limited by Creem.io
4. All requests require valid authentication

## Future Improvements

1. Rename `stripe_customer_id` to `creem_customer_id` in database schema
2. Add analytics tracking for portal usage
3. Implement webhook handling for subscription updates
4. Add portal URL caching for performance
