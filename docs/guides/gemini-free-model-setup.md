# Gemini 2.5 Flash Lite Preview - Free Model Setup

This guide covers the implementation of the free Gemini 2.5 Flash Lite Preview model with rate limiting for registered users.

## Overview

The free model implementation includes:
- **Rate limiting**: 10 requests per day **per user account**, 1 request per minute per user
- **Authentication requirement**: Users must be registered to access
- **UI indicators**: Real-time usage tracking in model selection and settings
- **Upgrade prompts**: Encourages users to upgrade to VT+ for unlimited access

## Technical Implementation

### 1. Model Configuration

The model is defined in `packages/ai/models.ts`:
```typescript
{
    id: ModelEnum.GEMINI_2_5_FLASH_LITE,
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    maxTokens: 64_000,
    contextWindow: 1_000_000,
    isFree: true,
}
```

### 2. Database Schema

Rate limiting uses the `user_rate_limits` table:
```sql
CREATE TABLE user_rate_limits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    daily_request_count TEXT NOT NULL DEFAULT '0',
    minute_request_count TEXT NOT NULL DEFAULT '0',
    last_daily_reset TIMESTAMP NOT NULL DEFAULT NOW(),
    last_minute_reset TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. Rate Limiting Logic

Located in `apps/web/lib/services/rate-limit.ts`:

#### Rate Limits (Per User Account)
- **Daily**: 10 requests per 24-hour period per user (resets at 00:00 UTC)
- **Per-minute**: 1 request per minute per user

#### Functions
- `checkRateLimit()`: Validates if user can make a request
- `recordRequest()`: Records successful requests
- `getRateLimitStatus()`: Returns current usage for UI display

### 4. API Integration

The main completion API (`/api/completion`) includes:
- Pre-request rate limit validation
- Authentication requirement for free model
- Request recording after successful completion
- Detailed error responses with upgrade prompts

### 5. UI Components

#### Model Selection
- Shows rate limit info in dropdown: "Free model • 10 requests/day per account • 1 request/minute"
- Real-time usage indicator for authenticated users showing their personal usage
- Gift icon to indicate free availability

#### Settings Page
- `RateLimitMeter` component shows:
  - Personal daily usage progress bar
  - Personal remaining requests counter
  - Reset time information
  - Warning messages when user's limits are approached

## Environment Setup

### Required Environment Variables

Set the following environment variable in your deployment:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Fly.io Deployment

Add the secret to your Fly.io app:

```bash
# For development
flyctl secrets set GEMINI_API_KEY=your_key_here -a vtchat-dev

# For production  
flyctl secrets set GEMINI_API_KEY=your_key_here -a vtchat-prod
```

## User Experience

### For Non-Authenticated Users
- Cannot access the free model
- Redirected to login with message: "Please register to use the free Gemini 2.5 Flash Lite model"

### For Registered Users
- Can use the free model within rate limits
- See real-time usage tracking
- Receive clear error messages when limits are exceeded
- Prompted to upgrade when approaching limits

### For VT+ Users
- Unlimited access to all models
- Rate limiting does not apply
- Can still see free model option but not subject to restrictions

## Rate Limit Behavior

### Daily Reset
- Occurs at 00:00 UTC every day
- Resets `daily_request_count` to 0
- Updates `last_daily_reset` timestamp

### Per-Minute Reset
- Occurs every minute
- Resets `minute_request_count` to 0
- Updates `last_minute_reset` timestamp

### Error Responses

#### Daily Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached your daily limit for the free Gemini model. Upgrade to VT+ for unlimited access.",
  "limitType": "daily_limit_exceeded",
  "remainingDaily": 0,
  "remainingMinute": 1,
  "resetTime": "2024-01-02T00:00:00.000Z",
  "upgradeUrl": "/plus"
}
```

#### Per-Minute Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded", 
  "message": "You have reached your per-minute limit for the free Gemini model. Upgrade to VT+ for unlimited access.",
  "limitType": "minute_limit_exceeded",
  "remainingDaily": 5,
  "remainingMinute": 0,
  "resetTime": "2024-01-01T12:35:00.000Z",
  "upgradeUrl": "/plus"
}
```

## Testing

Run the rate limiting tests:

```bash
bun test apps/web/app/tests/rate-limit.test.ts
```

## Monitoring

### Database Queries
Monitor the `user_rate_limits` table for:
- High usage patterns
- Users approaching limits
- System performance impact

### API Metrics
Track:
- 429 error rates
- Conversion from rate limit hits to upgrades
- Free model usage patterns

## Future Enhancements

1. **Analytics Dashboard**: Track free model usage and conversion rates
2. **Dynamic Limits**: Adjust limits based on system capacity
3. **Grace Periods**: Allow temporary limit increases for special cases
4. **Notification System**: Email users when they approach limits
5. **A/B Testing**: Test different limit configurations

## Security Considerations

1. **API Key Protection**: Ensure `GEMINI_API_KEY` is properly secured
2. **Rate Limit Bypass**: Prevent manipulation of rate limit records
3. **Authentication**: Validate user sessions for all requests
4. **Input Validation**: Sanitize all user inputs in rate limiting logic

## Troubleshooting

### Common Issues

1. **Rate limits not enforcing**: Check database connection and schema
2. **UI not updating**: Verify rate limit API endpoint and hooks
3. **Authentication errors**: Confirm session handling and user ID extraction
4. **Environment variables**: Ensure `GEMINI_API_KEY` is set in deployment

### Debug Tools

Use the rate limit status API for debugging:
```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-app.fly.dev/api/rate-limit/status?model=gemini-2.5-flash-lite-preview-06-17"
```
