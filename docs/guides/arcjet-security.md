# Arcjet Security Integration

This guide explains how Arcjet application security is integrated into VTChat to provide comprehensive protection against common threats.

## Overview

Arcjet provides multiple layers of security:
- **Rate limiting** with various algorithms (sliding window, fixed window, token bucket)
- **Bot protection** with configurable allow/deny lists  
- **Email validation** to block disposable and invalid emails
- **Shield WAF** protection against common attacks (SQL injection, XSS, etc.)
- **IP analysis** including VPN/proxy detection and geolocation

## Configuration

### Environment Setup

Add your Arcjet API key to the environment:

```bash
# Get your key from https://app.arcjet.com
ARCJET_KEY=your_arcjet_api_key_here
```

### Arcjet Instances

VTChat uses specialized Arcjet configurations for different use cases:

- **`arcjetChat`** - For chat endpoints with sliding window rate limiting
- **`arcjetAuth`** - For authentication with strict rate limits and email validation  
- **`arcjetAPI`** - For general API endpoints with token bucket algorithm
- **`arcjetFeedback`** - For feedback forms with very conservative limits
- **`arcjetDefault`** - Fallback configuration for other routes

## Implementation

### Better Auth Integration

VTChat uses an enhanced Better Auth + Arcjet integration pattern that provides:

- **User-specific rate limiting** using authenticated user IDs
- **Specialized signup protection** with email validation
- **Intelligent fallback** to IP-based limiting for unauthenticated users
- **Context-aware protection** for different auth operations

```typescript
// Enhanced auth route with Arcjet protection
export async function POST(request: NextRequest) {
    const decision = await protect(request);
    
    if (decision?.isDenied()) {
        if (decision.reason.isEmail()) {
            // Provide user-friendly email error messages
            if (decision.reason.emailTypes.includes('DISPOSABLE')) {
                return NextResponse.json(
                    { message: 'We do not allow disposable email addresses.' },
                    { status: 400 }
                );
            }
        }
    }
    
    return authHandlers.POST(request);
}
```

### Middleware Protection

Global protection is applied via Next.js middleware for all API routes:

```typescript
// middleware.ts
if (pathname.startsWith('/api/')) {
    const arcjetInstance = getArcjetForRoute(pathname);
    
    if (arcjetInstance) {
        const decision = await arcjetInstance.protect(request);
        const denial = handleArcjetDecision(decision);
        
        if (denial) {
            return NextResponse.json(denial.body, { status: denial.status });
        }
    }
}
```

### Route-Specific Protection

Individual API routes can also apply Arcjet protection:

```typescript
// Example API route
export async function POST(req: NextRequest) {
    if (arcjetFeedback) {
        const decision = await arcjetFeedback.protect(req, {
            email: body?.email, // For email validation
        });
        
        const denial = handleArcjetDecision(decision);
        if (denial) {
            return NextResponse.json(denial.body, { status: denial.status });
        }
    }
    
    // Your API logic here
}
```

## Rate Limiting Configurations

### Chat Endpoints
- **Algorithm**: Sliding Window
- **Limit**: 50 requests per hour
- **Characteristics**: User ID + IP address

### Authentication (Better Auth Enhanced)
- **Algorithm**: Sliding Window for auth attempts
- **Limit**: 5 requests per 2 minutes
- **Characteristics**: User ID (if authenticated) or IP address
- **Features**: 
  - Email validation for signup routes
  - Bot protection for all auth operations
  - User-specific rate limiting
  - Specialized `protectSignup` for user registration

### API Endpoints
- **Algorithm**: Token Bucket
- **Capacity**: 100 tokens
- **Refill**: 50 tokens per minute
- **Characteristics**: IP address

### Feedback Forms
- **Algorithm**: Sliding Window
- **Limit**: 5 requests per 10 minutes
- **Characteristics**: IP address
- **Features**: Email validation enabled

## Bot Protection

### Default Configuration
- **Allowed**: Search engines (Google, Bing, etc.)
- **Blocked**: All other automated clients
- **Mode**: LIVE (blocking enabled)

### Custom Bot Rules
```typescript
detectBot({
    mode: 'LIVE',
    allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
        'CATEGORY:MONITOR',       // Uptime monitoring
        // Add specific bots as needed
    ],
})
```

## Email Validation

Blocks problematic email addresses:
- **Disposable** emails (temporary email services)
- **Invalid** email formats
- **No MX Records** (domains without mail servers)
- **Free** emails (optional, not enabled by default)

## Error Handling

Arcjet denials return structured responses:

```json
{
    "error": "Rate limit exceeded",
    "type": "RATE_LIMIT_EXCEEDED", 
    "retryAfter": "3600"
}
```

### Error Types
- `BOT_DENIED` - Bot traffic blocked (403)
- `RATE_LIMIT_EXCEEDED` - Rate limit hit (429)
- `EMAIL_INVALID` - Email validation failed (400)
- `SHIELD_BLOCKED` - WAF protection triggered (403)
- `GENERAL_DENIED` - Other security rule violated (403)

## Testing

### Manual Testing
```bash
# Test rate limiting
curl -I http://localhost:3000/api/chat/rag

# Test bot protection
curl -I http://localhost:3000/api/feedback

# Test auth protection
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"disposable@temp-mail.org","password":"test123"}'
```

### Automated Testing
```bash
# Run Arcjet integration tests
bun test tests/arcjet-integration.test.ts

# Run Better Auth + Arcjet tests
bun test tests/better-auth-arcjet.test.ts
```

### Monitoring
- Check Arcjet dashboard at https://app.arcjet.com
- Monitor server logs for protection events
- Review decision IDs for detailed analysis

## Best Practices

1. **Graceful Degradation**: Continue operation if Arcjet fails
2. **User Experience**: Provide clear error messages for legitimate users
3. **Rate Limits**: Balance security with usability  
4. **Monitoring**: Regularly review protection effectiveness
5. **Testing**: Verify rules don't block legitimate traffic

## Advanced Features

### User-Specific Rate Limiting
```typescript
const decision = await arcjet.protect(req, {
    userId: session?.user?.id,
    requested: 5, // Token bucket: consume 5 tokens
});
```

### IP Analysis
```typescript
if (decision.ip.isVpn() || decision.ip.isProxy()) {
    // Handle VPN/proxy traffic
}

if (decision.ip.hasCountry() && !allowedCountries.includes(decision.ip.country)) {
    // Geographic restrictions
}
```

### Custom Characteristics
```typescript
arcjet({
    characteristics: ['userId', 'ip.src', 'apiKey'],
    // Rate limit by multiple factors
})
```

## Troubleshooting

### Common Issues
1. **Missing API Key**: Ensure `ARCJET_KEY` is set in environment
2. **Rate Limits Too Strict**: Adjust limits in `arcjet-config.ts`
3. **Bot Detection Issues**: Review allowed bot categories
4. **Email Validation**: Check email validation rules

### Debug Mode
Set Arcjet rules to `DRY_RUN` mode for testing:
```typescript
shield({ mode: 'DRY_RUN' }) // Logs but doesn't block
```

## Security Considerations

- Never log or expose the Arcjet API key
- Monitor for false positives in bot detection
- Regularly review and update rate limits
- Consider user feedback about blocked requests
- Implement proper error handling and fallbacks

## Resources

- [Arcjet Documentation](https://docs.arcjet.com)
- [Arcjet Dashboard](https://app.arcjet.com)
- [Next.js Integration Guide](https://docs.arcjet.com/reference/nextjs)
- [VTChat Arcjet Configuration](../packages/shared/lib/arcjet-config.ts)
