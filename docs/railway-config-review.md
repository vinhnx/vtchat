# Railway Configuration Review & Optimization

## Overview
This document reviews the current Railway configuration for VTChat and provides recommendations for optimal development and production deployment settings.

## Current Configuration Status ✅

### Railway Services
- **Production**: `vtchat` service (current production deployment)
- **Development**: `vtchat-development` service (dedicated dev environment)
- **Database**: Shared `Postgres` service across environments

### Configuration Files
- `railway.toml` - Railway configuration in TOML format
- `railway.json` - Railway configuration in JSON format (with schema validation)
- `.env.railway` - Environment variables template (safe to commit)
- `.env.railway.development` & `.env.railway.production` - Actual env files (gitignored)

## Optimized Configuration Settings

### Build Configuration
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"
```

**✅ Current Status**: Properly configured
- Uses Docker for consistent builds across environments
- Dockerfile is optimized with multi-stage builds for production

### Health Check Configuration
```toml
[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

**✅ Current Status**: Properly configured
- Health check endpoint `/api/health` exists and returns JSON response
- 300s timeout for production (5 minutes)
- 180s timeout for development (3 minutes - faster feedback)
- Restart policy set to `ON_FAILURE` for reliability

### Environment-Specific Settings

#### Development Environment
```toml
[environments.development]
[environments.development.deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 180
restartPolicyType = "ON_FAILURE"
```

**Optimizations Applied**:
- ✅ Shorter healthcheck timeout (180s vs 300s) for faster feedback
- ✅ Same restart policy for consistency
- ✅ Dedicated build configuration per environment

#### Production Environment
```toml
[environments.production]
[environments.production.deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

**Optimizations Applied**:
- ✅ Standard 300s healthcheck timeout for stability
- ✅ Consistent restart policy
- ✅ Production-optimized settings

## Resource Configuration (Railway Dashboard Settings)

### Current Development Environment Settings
Based on your Railway service, the following settings are recommended:

#### Compute Resources
- **CPU**: 2 vCPU (current)
- **Memory**: 1GB RAM (current)
- **Disk**: 1GB (ephemeral storage)

#### Networking
- **Port**: Auto-detected from `PORT` environment variable
- **Custom Domain**: Optional for development
- **Public Networking**: Enabled

#### Scaling & Availability
- **Serverless**: Enabled (good for development cost optimization)
- **Replicas**: 1 (default for development)
- **Auto-scaling**: Disabled for development (predictable costs)

### Recommended Production Settings
When deploying to production:

#### Compute Resources
- **CPU**: 2-4 vCPU (depending on traffic)
- **Memory**: 2-4GB RAM (for better performance)
- **Disk**: 1GB (ephemeral storage)

#### Scaling & Availability
- **Serverless**: Consider disabling for consistent performance
- **Replicas**: 1-2 (for high availability)
- **Auto-scaling**: Enable based on CPU/memory usage

## Environment Variables Configuration

### Required Variables (Set in Railway Dashboard)
```bash
# Application URLs (environment-specific)
BASE_URL=https://vtchat-development.up.railway.app  # or production URL
BETTER_AUTH_URL=${BASE_URL}
NEXT_PUBLIC_BASE_URL=${BASE_URL}
NEXT_PUBLIC_APP_URL=${BASE_URL}
NEXT_PUBLIC_COMMON_URL=${BASE_URL}
NEXT_PUBLIC_BETTER_AUTH_URL=${BASE_URL}

# Environment Configuration
BETTER_AUTH_ENV=development  # or production
CREEM_ENVIRONMENT=sandbox    # or production
NODE_ENV=production          # Always production for Railway builds

# Database (Railway provides these automatically)
DATABASE_URL=${DATABASE_URL}
DIRECT_URL=${DATABASE_URL}

# External API Keys
JINA_API_KEY=your_jina_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
PRODUCT_NAME=VT+
PRODUCT_DESCRIPTION=For everyday productivity
VT_PLUS_PRICE=9.99
PRICING_CURRENCY=USD
PRICING_INTERVAL=month
LOG_LEVEL=info
```

### Setting Variables via Railway CLI
```bash
# Switch to development environment
railway environment development

# Set environment-specific variables
railway variables set BASE_URL=https://vtchat-development.up.railway.app
railway variables set BETTER_AUTH_ENV=development
railway variables set CREEM_ENVIRONMENT=sandbox

# Set API keys (same for both environments)
railway variables set JINA_API_KEY=your_key
railway variables set GITHUB_CLIENT_ID=your_id
railway variables set GITHUB_CLIENT_SECRET=your_secret
```

## Build & Deployment Process

### Current Dockerfile Optimization ✅
Your Dockerfile is well-optimized with:
- Multi-stage builds for size optimization
- Bun for fast package management
- Proper caching layers
- Security best practices (non-root user)

### Build Commands
Railway automatically detects and runs:
```dockerfile
# Build stage
RUN bun run build

# Start command
CMD ["bun", "run", "start"]
```

### Port Configuration
Railway automatically sets the `PORT` environment variable. Your Next.js app should listen on:
```javascript
const port = process.env.PORT || 3000
```

## Monitoring & Logging

### Health Check Endpoint
Your `/api/health` endpoint is properly configured:
```typescript
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'vtchat',
    }, { status: 200 });
}
```

### Logging Configuration
- `LOG_LEVEL=info` set for appropriate verbosity
- Railway automatically captures stdout/stderr
- Consider structured logging for production

## Security Configuration ✅

### Environment Variables Security
- ✅ All `.env.railway.*` files are gitignored
- ✅ Only template `.env.railway` is committed (safe)
- ✅ Secrets are set via Railway Dashboard/CLI
- ✅ No hardcoded credentials in codebase

### HTTPS & Security Headers
- ✅ Railway provides HTTPS by default
- ✅ Next.js security headers should be configured
- ✅ CORS properly configured for API routes

## Next Steps & Recommendations

### Immediate Actions Required
1. **Set Environment Variables**: Configure all required environment variables in Railway Dashboard for development environment
2. **Test Deployment**: Deploy dev branch to development environment and verify health check
3. **Monitor Performance**: Check logs and metrics after first deployment

### Optional Optimizations
1. **Custom Domain**: Set up custom domain for production
2. **CDN Configuration**: Consider Railway's edge functions for static assets
3. **Database Optimization**: Configure connection pooling for production
4. **Monitoring**: Set up external monitoring (Sentry, LogRocket, etc.)

### Cost Optimization for Development
- ✅ Serverless enabled (pay-per-use)
- ✅ Smaller resource allocation
- ✅ Shorter healthcheck timeouts
- Consider sleep/wake policies for inactive periods

## Configuration Validation Checklist

- [x] Railway config files (`railway.toml`, `railway.json`) are valid
- [x] Health check endpoint exists and returns 200 status
- [x] Environment variables template is documented
- [x] Dockerfile is optimized for Railway deployment
- [x] Build and start commands are properly configured
- [x] Security best practices are followed
- [x] Environment-specific settings are differentiated
- [x] GitHub Actions workflows are configured for automated deployment

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Dockerfile syntax and dependency versions
2. **Health Check Failures**: Verify `/api/health` endpoint returns 200 status
3. **Environment Variables**: Ensure all required variables are set in Railway
4. **Port Binding**: Verify app listens on `process.env.PORT`

### Debug Commands
```bash
# Check Railway service status
railway status

# View logs
railway logs

# Test deployment locally
railway run bun run dev

# Validate configuration
railway config
```

---

**Status**: Configuration review complete ✅  
**Last Updated**: Current  
**Environment**: Development & Production Ready
