# Creem.io Webhook Setup for Development

## Overview
This guide explains how to set up Creem.io webhooks for local development to test subscription flows.

## Prerequisites
1. Creem.io account with access to webhook configuration
2. Local development environment running on `http://localhost:3000`
3. Tunnel service for exposing local server (ngrok or similar)

## Setup Steps

### 1. Environment Variables
Ensure these environment variables are set in your `.env.local`:

```bash
# Creem.io Configuration
CREEM_API_KEY=your_sandbox_api_key
CREEM_PRODUCT_ID=your_product_id
CREEM_WEBHOOK_SECRET=your_webhook_secret

# Optional: For development webhook URL override
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Expose Local Server
Use ngrok or similar service to expose your local development server:

```bash
# Install ngrok if not already installed
npm install -g ngrok

# Expose port 3000
ngrok http 3000
```

This will give you a URL like: `https://abc123.ngrok.io`

### 3. Configure Webhook in Creem.io Dashboard

1. Go to your Creem.io dashboard
2. Navigate to Webhooks section
3. Add a new webhook with the following settings:

**Webhook URL:** `https://your-ngrok-url.ngrok.io/api/webhook/creem`

**Events to subscribe to:**
- `checkout.completed`
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`

**Webhook Secret:** Generate a secure secret and add it to your `.env.local` as `CREEM_WEBHOOK_SECRET`

### 4. Test Webhook Setup

1. Start your development server:
```bash
bun dev
```

2. Check the console for webhook environment logging:
```
[Creem Webhook] Environment: {
  nodeEnv: 'development',
  hasWebhookSecret: true,
  webhookUrl: 'https://abc123.ngrok.io/api/webhook/creem'
}
```

3. Test a subscription purchase to verify webhooks are working

### 5. Development Mode Features

The webhook handler includes development-friendly features:

- **Signature verification bypass**: In development mode, signature verification can be skipped if `CREEM_WEBHOOK_SECRET` is not set
- **Enhanced logging**: Detailed logs for debugging webhook payloads
- **Error handling**: Graceful error handling with detailed error messages

### 6. Testing Subscription Flows

To test the complete subscription flow:

1. **Sign up** for an account in your local app
2. **Navigate** to `/plus` pricing page
3. **Click** "Upgrade to Plus" to initiate checkout
4. **Complete** payment in Creem.io checkout
5. **Verify** webhook received and user subscription updated
6. **Check** that VT+ features are now accessible (dark mode, etc.)

### 7. Webhook Payload Examples

**Checkout Completed:**
```json
{
  "type": "checkout.completed",
  "data": {
    "id": "checkout_123",
    "status": "completed",
    "customer": {
      "id": "customer_123",
      "email": "user@example.com"
    },
    "product": {
      "id": "prod_123",
      "name": "VT+"
    },
    "subscription_id": "sub_123"
  }
}
```

**Subscription Created:**
```json
{
  "type": "subscription.created",
  "data": {
    "id": "sub_123",
    "status": "active",
    "customer": {
      "id": "customer_123",
      "email": "user@example.com"
    },
    "current_period_end": "2024-02-15T10:00:00Z"
  }
}
```

### 8. Troubleshooting

**Common Issues:**

1. **Webhook not receiving events**: Check ngrok URL is correctly configured in Creem.io dashboard
2. **Signature verification failed**: Ensure `CREEM_WEBHOOK_SECRET` matches the secret configured in Creem.io
3. **User not found**: Ensure the email in the webhook matches a user in your database
4. **Database update failed**: Check database connection and schema is up to date

**Debug Steps:**

1. Check webhook endpoint is accessible: `curl https://your-ngrok-url.ngrok.io/api/webhook/creem`
2. Review webhook logs in your development console
3. Verify webhook events are being sent from Creem.io dashboard
4. Test with a manual webhook payload using a tool like Postman

### 9. Production Deployment

When deploying to production:

1. Update webhook URL in Creem.io dashboard to your production domain
2. Use production API keys and webhook secrets
3. Enable signature verification in production environment
4. Monitor webhook delivery and error rates

## Security Considerations

- Always verify webhook signatures in production
- Use HTTPS for webhook endpoints
- Rotate webhook secrets regularly
- Monitor for suspicious webhook activity
- Implement rate limiting for webhook endpoints

## Documentation Links

- [Creem.io Webhook Documentation](https://docs.creem.io/learn/webhooks/introduction)
- [Customer Portal Guide](https://docs.creem.io/learn/customers/customer-portal)
