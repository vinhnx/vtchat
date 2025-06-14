# Creem.io Webhook Setup Guide

This guide explains how to set up webhooks for Creem.io payment processing in development and production environments.

## Overview

VTChat uses Creem.io webhooks to handle real-time payment events like:

- Successful checkouts
- Subscription creation/updates/cancellation
- Payment failures
- Refunds

## Current Implementation

The webhook endpoint is implemented at `/app/api/webhook/creem/route.ts` and handles:

- `checkout.completed` - When a payment is successfully processed
- `subscription.created` - When a new subscription is created
- `subscription.updated` - When subscription details change
- `subscription.cancelled` - When a subscription is cancelled

## Development Environment Setup

### 1. Local Webhook Endpoint

The webhook endpoint is already implemented at:

```
http://localhost:3000/api/webhook/creem
```

### 2. Expose Local Endpoint with ngrok

Since Creem.io needs to reach your local development server, you need to create a public tunnel:

1. Install ngrok if you haven't already:

   ```bash
   # macOS
   brew install ngrok

   # Or download from https://ngrok.com/download
   ```

2. Start your local development server:

   ```bash
   npm run dev
   ```

3. In a new terminal, create a tunnel to your local server:

   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (something like `https://abc123.ngrok.io`)

### 3. Register Webhook in Creem.io Dashboard

1. Go to the Creem.io dashboard (test environment)
2. Navigate to the Developers/Webhooks section
3. Add a new webhook endpoint:
   - URL: `https://your-ngrok-url.ngrok.io/api/webhook/creem`
   - Events: Select the events you want to listen for:
     - `checkout.completed`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.cancelled`

### 4. Set Environment Variables

Make sure your `.env.local` has the webhook secret:

```env
# Webhook secret from Creem.io dashboard
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Your ngrok URL for local development
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
```

### 5. Test the Webhook

1. Create a test payment using the Creem.io test environment
2. Check your local server logs to see if the webhook events are received
3. The webhook handler will log events and update the database accordingly

## Production Environment Setup

### 1. Deploy Your Application

Deploy your application to your production environment (Vercel, Railway, etc.)

### 2. Register Production Webhook

1. Go to the Creem.io live dashboard
2. Navigate to the Developers/Webhooks section
3. Add a new webhook endpoint:
   - URL: `https://your-production-domain.com/api/webhook/creem`
   - Events: Same as development setup

### 3. Update Production Environment Variables

```env
# Production webhook secret from Creem.io live dashboard
CREEM_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Your production URL
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Switch to live API key
CREEM_API_KEY=creem_live_your_live_api_key
```

## Webhook Security

The webhook handler includes security measures:

1. **Signature Verification**: Verifies the webhook signature using the webhook secret
2. **HTTPS Only**: Only accepts webhooks over HTTPS
3. **Event Validation**: Validates the webhook payload structure using Zod schemas

## Debugging Webhooks

### Check Webhook Logs

The webhook handler logs all incoming events:

```typescript
console.log('[Creem Webhook] Event received:', event.type, event.data);
```

### Webhook Dashboard

Creem.io provides a webhook dashboard where you can:

- View webhook delivery attempts
- See response status codes
- Retry failed webhooks
- View payload details

### Local Development Logs

When running locally, check the console output for:

- Webhook environment configuration
- Incoming webhook events
- Database update results
- Any errors or warnings

## Common Issues

### 1. ngrok URL Changes

ngrok URLs change every time you restart ngrok. Remember to:

- Update the webhook URL in Creem.io dashboard
- Update `NEXT_PUBLIC_APP_URL` in your `.env.local`

### 2. Webhook Secret Mismatch

If webhook verification fails:

- Check that `CREEM_WEBHOOK_SECRET` matches the one in Creem.io dashboard
- Ensure no extra spaces or characters in the secret

### 3. Database Connection Issues

If webhook events aren't updating the database:

- Check database connection configuration
- Verify database schema is up to date
- Check user session and subscription table structures

## Next Steps

1. ✅ Webhook endpoint is implemented
2. ✅ Environment variables are configured
3. 🔄 **YOU NEED TO DO**: Set up ngrok tunnel and register webhook in Creem.io dashboard
4. 🔄 **YOU NEED TO DO**: Test with a sample payment
5. 🔄 **YOU NEED TO DO**: Register production webhook when deploying

## Resources

- [Creem.io Webhook Documentation](https://docs.creem.io/learn/webhooks/introduction)
- [ngrok Documentation](https://ngrok.com/docs)
- [Webhook Event Types](https://docs.creem.io/learn/webhooks/event-types)
