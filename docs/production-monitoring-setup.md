# Production Monitoring & Logging Setup

## Overview

This document outlines the monitoring and logging strategy for VT (VTChat) production deployment. The setup includes error tracking, performance monitoring, uptime monitoring, and comprehensive logging.

## Error Tracking & Monitoring

### Recommended Services

#### Option 1: Sentry (Recommended)
```bash
# Install Sentry SDK
bun add @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  silent: true,
  org: "vtchat",
  project: "vtchat-web",
});
```

#### Option 2: LogRocket
```bash
# Alternative: LogRocket for session replay
bun add logrocket logrocket-react
```

### Environment Variables
```env
# Sentry Configuration
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=vtchat
SENTRY_PROJECT=vtchat-web
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Environment
NODE_ENV=production
BETTER_AUTH_ENV=production
```

### Sentry Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Adjust based on traffic
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

## Performance Monitoring

### Next.js Built-in Analytics
```typescript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/utils': '@sentry/utils/esm',
      };
    }
    return config;
  },
};
```

### Custom Performance Tracking
```typescript
// lib/analytics.ts
export const trackPerformance = (name: string, duration: number) => {
  if (typeof window !== 'undefined') {
    // Track to your analytics service
    console.log(`Performance: ${name} took ${duration}ms`);
  }
};

// Usage in components
const startTime = performance.now();
// ... operation
trackPerformance('ai-response', performance.now() - startTime);
```

## Uptime Monitoring

### Recommended Services

#### Option 1: UptimeRobot (Free tier available)
- Monitor: https://vtchat.io.vn
- Check interval: 5 minutes
- Alert methods: Email, Slack, Discord

#### Option 2: Railway Built-in Health Checks
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    // Check AI service availability
    // Check authentication service
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        auth: 'up',
        ai: 'up'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
```

### Health Check Configuration
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Application Logs

### Structured Logging Setup
```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ['req.headers.authorization', 'password', 'token'],
});

export default logger;
```

### Log Integration
```typescript
// API routes logging
import logger from '@/lib/logger';

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Your API logic
    logger.info({
      method: 'POST',
      path: '/api/completion',
      duration: Date.now() - startTime,
      status: 200
    }, 'API request completed');
    
  } catch (error) {
    logger.error({
      method: 'POST',
      path: '/api/completion',
      duration: Date.now() - startTime,
      error: error.message,
      stack: error.stack
    }, 'API request failed');
    
    throw error;
  }
}
```

## Database Monitoring

### Neon Database Monitoring
```sql
-- Create monitoring queries
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation 
FROM pg_stats 
WHERE schemaname = 'public';

-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Database Health Check
```typescript
// lib/db-health.ts
import { db } from '@/lib/db';

export async function checkDatabaseHealth() {
  try {
    await db.execute('SELECT 1');
    return { status: 'healthy' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}
```

## AI Service Monitoring

### Model Response Tracking
```typescript
// lib/ai-monitoring.ts
export const trackAIUsage = async (provider: string, model: string, tokens: number, latency: number) => {
  logger.info({
    provider,
    model,
    tokens,
    latency,
    timestamp: new Date().toISOString()
  }, 'AI model usage');
  
  // Track to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
  }
};
```

### Rate Limit Monitoring
```typescript
// middleware.ts - Rate limit monitoring
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  return NextResponse.next().then(response => {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      duration,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || 'unknown'
    }, 'Request processed');
    
    return response;
  });
}
```

## Alerting Strategy

### Critical Alerts (Immediate)
- Application down (5xx errors > 10%)
- Database connection failures
- Authentication service failures
- High error rates (>5% in 5 minutes)

### Warning Alerts (15-30 minutes)
- High response times (>2s average)
- Memory usage >80%
- Disk usage >85%
- High CPU usage >80%

### Info Alerts (1 hour)
- Unusual traffic patterns
- AI service rate limits approaching
- Low conversion rates

## Notification Channels

### Slack Integration
```typescript
// lib/alerts.ts
const sendSlackAlert = async (message: string, severity: 'critical' | 'warning' | 'info') => {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `[${severity.toUpperCase()}] VTChat: ${message}`,
      channel: '#alerts',
      username: 'VTChat Monitor'
    })
  });
};
```

### Email Alerts
- Use Railway's built-in alerting
- Configure email notifications for deployment failures
- Set up Sentry email alerts for errors

## Metrics Dashboard

### Key Metrics to Track
1. **Performance Metrics**
   - Page load times
   - API response times
   - AI model latency
   - Database query performance

2. **Business Metrics**
   - Active users
   - Subscription conversions
   - Feature usage
   - Retention rates

3. **Technical Metrics**
   - Error rates
   - Uptime percentage
   - Memory/CPU usage
   - Database connections

### Dashboard Tools
- **Grafana** (Open source)
- **Railway Analytics** (Built-in)
- **Sentry Performance** (Error tracking + performance)
- **Custom Dashboard** (Next.js admin panel)

## Security Monitoring

### Security Events to Track
```typescript
// lib/security-monitor.ts
export const trackSecurityEvent = (event: string, details: any) => {
  logger.warn({
    event,
    details,
    timestamp: new Date().toISOString(),
    severity: 'security'
  }, 'Security event detected');
  
  // Send to security monitoring service
};

// Usage
trackSecurityEvent('failed_login_attempt', {
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  email: attemptedEmail
});
```

### Rate Limiting Alerts
```typescript
// Track rate limit violations
export const trackRateLimit = (ip: string, endpoint: string) => {
  logger.warn({
    ip,
    endpoint,
    event: 'rate_limit_exceeded',
    timestamp: new Date().toISOString()
  }, 'Rate limit exceeded');
};
```

## Implementation Checklist

### Phase 1: Essential Monitoring ✅
- [ ] Set up error tracking (Sentry)
- [ ] Configure health checks
- [ ] Set up uptime monitoring
- [ ] Basic logging implementation

### Phase 2: Performance Monitoring ✅
- [ ] Performance metrics collection
- [ ] Database monitoring
- [ ] AI service monitoring
- [ ] Custom analytics

### Phase 3: Advanced Alerting ✅
- [ ] Slack integration
- [ ] Email alerts
- [ ] Custom dashboards
- [ ] Security monitoring

## Environment Variables Summary

```env
# Monitoring & Alerting
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=vtchat
SENTRY_PROJECT=vtchat-web
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Monitoring Settings
LOG_LEVEL=info
ENABLE_PERFORMANCE_TRACKING=true
ENABLE_SECURITY_MONITORING=true
```

## Next Steps

1. **Choose monitoring services** based on budget and requirements
2. **Set up basic error tracking** with Sentry or similar
3. **Configure health checks** for Railway deployment
4. **Implement structured logging** throughout the application
5. **Set up alerting** for critical issues
6. **Create monitoring dashboard** for key metrics

This monitoring setup ensures comprehensive visibility into the application's health, performance, and security in production.
