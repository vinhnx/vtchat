# Logging Best Practices with Pino

This guide covers the implementation and best practices for using Pino logging in the VTChat application.

## Overview

We use [Pino](https://github.com/pinojs/pino) as our structured logging solution with automatic PII redaction, request tracing, and Next.js compatibility.

## Features

### ✅ Automatic PII Redaction

- Sensitive fields like email, password, tokens are automatically redacted
- Works for nested objects and arrays
- Configurable redaction paths

### ✅ Next.js Compatibility

- Optimized configuration that avoids worker thread issues
- Works seamlessly with Next.js bundling
- No pino-pretty transport in production to avoid errors

### ✅ Request Tracing

- Built-in request ID generation and tracking
- Child logger support for scoped logging
- Performance timing utilities

### ✅ Environment-Specific Configuration

- Development: Pretty printing (when not in Next.js)
- Production: Structured JSON logging
- Test: Silent mode

## Usage

### Basic Logging

```typescript
import { log } from '@repo/shared/logger';

// Basic log levels
log.info('Application started');
log.warn('Memory usage high');
log.error({ error: err }, 'Database connection failed');

// Structured logging with context
log.info(
    {
        userId: '12345',
        action: 'login',
        ip: '192.168.1.1', // Will be redacted automatically
    },
    'User login attempt'
);
```

### Request Scoped Logging

```typescript
import { withRequestId } from '@repo/shared/logger';

// Create request-scoped logger
const requestLogger = withRequestId('req-abc123');
requestLogger.info('Processing request');
requestLogger.error({ error }, 'Request failed');
```

### API Route Integration

```typescript
import { withLogging } from '@repo/shared/logger';

const handler = async (req, res) => {
    req.log.info('Processing API request');

    try {
        const result = await processRequest();
        req.log.info({ result }, 'Request successful');
        res.json(result);
    } catch (error) {
        req.log.error({ error }, 'Request failed');
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default withLogging(handler);
```

### Child Loggers

```typescript
import { createChildLogger, log } from '@repo/shared/logger';

// Create child logger with persistent context
const userLogger = createChildLogger({
    userId: '12345',
    service: 'auth',
});

userLogger.info('User logged in');
// Output: {"userId":"12345","service":"auth","msg":"User logged in",...}
```

### Performance Timing

```typescript
import { createTimer } from '@repo/shared/logger';

const timer = createTimer('database-query');

// ... perform operation

timer.end({
    query: 'SELECT * FROM users',
    recordCount: 150,
});
// Output: {"duration":45,"timer":"database-query","query":"SELECT * FROM users","recordCount":150,...}
```

## PII Redaction

The following fields are automatically redacted:

- `email`, `password`, `token`
- `apiKey`, `api_key`, `accessToken`, `access_token`
- `refreshToken`, `refresh_token`, `sessionId`, `session_id`
- `userId`, `user_id`, `ip`, `ipAddress`, `ip_address`
- `phoneNumber`, `phone_number`, `phone`
- `ssn`, `socialSecurityNumber`
- `creditCard`, `credit_card`, `ccNumber`, `cc_number`
- `authorization`, `Authorization`, `cookie`, `Cookie`

### Nested Object Redaction

```typescript
log.info(
    {
        user: {
            email: 'user@example.com', // Will be redacted
            name: 'John Doe', // Will be visible
        },
        headers: {
            authorization: 'Bearer token123', // Will be redacted
        },
        publicData: 'This is safe', // Will be visible
    },
    'User data logged'
);

// Output:
// {
//   "user": {"email": "[REDACTED]", "name": "John Doe"},
//   "headers": {"authorization": "[REDACTED]"},
//   "publicData": "This is safe",
//   "msg": "User data logged"
// }
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set log level (debug, info, warn, error, fatal, silent)
- `NODE_ENV`: Affects default log level and formatting

### Development vs Production

**Development:**

- Default level: `debug`
- Pretty printing (when not in Next.js)
- Colorized output

**Production:**

- Default level: `info`
- Structured JSON output
- Optimized for log aggregation

**Test:**

- Level: `silent`
- No output to avoid test noise

## Best Practices

### 1. Use Structured Logging

```typescript
// ❌ Avoid string interpolation
log.info(`User ${userId} performed ${action}`);

// ✅ Use structured objects
log.info({ userId, action }, 'User action performed');
```

### 2. Include Context

```typescript
// ❌ Minimal context
log.error('Database error');

// ✅ Rich context
log.error(
    {
        error: err.message,
        stack: err.stack,
        query: 'SELECT * FROM users',
        params: { limit: 50 },
        duration: 1234,
    },
    'Database query failed'
);
```

### 3. Use Child Loggers for Scoping

```typescript
// ❌ Repeating context
log.info({ requestId: 'req-123' }, 'Starting process');
log.info({ requestId: 'req-123' }, 'Process completed');

// ✅ Child logger with persistent context
const requestLogger = createChildLogger({ requestId: 'req-123' });
requestLogger.info('Starting process');
requestLogger.info('Process completed');
```

### 4. Leverage Performance Timing

```typescript
// ❌ Manual timing
const start = Date.now();
await operation();
const duration = Date.now() - start;
log.info({ duration }, 'Operation completed');

// ✅ Built-in timer
const timer = createTimer('operation');
await operation();
timer.end({ operationDetails: 'additional context' });
```

### 5. Handle Errors Properly

```typescript
// ❌ Losing error context
log.error('Something went wrong');

// ✅ Include full error context
log.error(
    {
        err: error, // Uses Pino's error serializer
        context: 'user-registration',
        userId: '12345',
    },
    'User registration failed'
);
```

### Traffic Monitoring (Privacy-Safe)

```typescript
// middleware.ts - Privacy-safe geographic monitoring
export default async function middleware(request: NextRequest) {
    // Privacy-safe traffic monitoring - only aggregate region stats, no IPs or personal data
    const flyRegion = request.headers.get('Fly-Region') || 'unknown';
    console.log(`[Traffic] Region: ${flyRegion}`);

    // Rest of middleware logic...
}
```

**Privacy Compliance:**

- ✅ **GDPR Safe**: Region codes are not personal data
- ✅ **No PII**: Only 3-letter region codes (sin, iad, ams)
- ✅ **Aggregate Only**: Cannot identify individual users
- ✅ **Ephemeral**: Logs rotate automatically
- ✅ **Legitimate Interest**: Infrastructure optimization

**Analysis:**

```bash
# View traffic distribution
fly logs | grep "\[Traffic\]" | sort | uniq -c

# Example output:
# 45 [Traffic] Region: sin
# 12 [Traffic] Region: iad
# 8 [Traffic] Region: ams
```

**Scaling Decisions:**

- Add `iad` region when seeing consistent US traffic
- Add `ams` region when seeing consistent EU traffic
- Use data to optimize global infrastructure placement

## Integration Examples

### Database Queries

```typescript
const queryLogger = createChildLogger({ service: 'database' });

const timer = createTimer('user-query');
try {
    const users = await db.query('SELECT * FROM users WHERE active = ?', [true]);
    timer.end({ recordCount: users.length });
    queryLogger.info({ recordCount: users.length }, 'Users fetched successfully');
    return users;
} catch (error) {
    timer.end({ error: error.message });
    queryLogger.error({ err: error, query: 'users-active' }, 'Database query failed');
    throw error;
}
```

### API Middleware

```typescript
// middleware/logging.ts
export function loggingMiddleware(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') || generateRequestId();

    // Add request logger to headers for downstream use
    req.headers.set('x-request-logger', JSON.stringify({ requestId }));

    const requestLogger = withRequestId(requestId);
    requestLogger.info(
        {
            method: req.method,
            url: req.url,
            userAgent: req.headers.get('user-agent'),
            ip: req.ip,
        },
        'Request started'
    );

    return NextResponse.next();
}
```

## Security Considerations

1. **PII Redaction**: Sensitive data is automatically redacted
2. **No Log Injection**: All objects are safely serialized
3. **Performance**: Minimal overhead in production
4. **Error Handling**: Logs never throw or crash the application

## Performance

- **~2% overhead** for standard operations
- **Automatic buffering** in async mode
- **Child loggers** have minimal performance impact
- **Built on fast-json-stringify** for optimal JSON serialization

## Troubleshooting

### Common Issues

1. **Worker thread errors in Next.js**: Use our simplified configuration
2. **PII not redacted**: Check field names against the redaction list
3. **Performance issues**: Ensure using structured logging, not string interpolation
4. **Missing logs**: Check log level configuration

### Debug Mode

```typescript
// Temporarily increase log level for debugging
process.env.LOG_LEVEL = 'debug';

// Or create a debug logger
const debugLogger = createChildLogger({ debug: true });
debugLogger.debug('Detailed debug information');
```
