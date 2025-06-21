# Railway Deployment Configuration Guide

## Overview

This guide explains how to properly configure VT for Railway deployment with environment-specific URLs and settings.

## Environment URLs

| Environment             | URL                                             |
| ----------------------- | ----------------------------------------------- |
| **Local Development**   | `http://localhost:3000`                         |
| **Railway Development** | `https://vtchat-web-development.up.railway.app` |
| **Railway Production**  | `https://vtchat-web-production.up.railway.app`  |

## Configuration Files

### 1. Dockerfile

- ✅ **Location**: `/Dockerfile`
- ✅ **Status**: Properly configured for Railway deployment
- ✅ **Features**: Multi-stage build, environment variable support, proper port binding

### 2. Railway Configuration

- ✅ **railway.toml**: Basic Railway configuration
- ✅ **railway.json**: JSON format configuration (alternative)

### 3. Environment Files

#### Local Development

- **File**: `apps/web/.env.local`
- **Purpose**: Local development with `localhost:3000` URLs
- **Usage**: `bun dev` from `apps/web/`

#### Railway Development Environment

- **File**: `.env.railway.development`
- **Purpose**: Template for Railway development environment variables
- **URLs**: All pointing to `https://vtchat-web-development.up.railway.app`
- **Payment**: Sandbox mode (`CREEM_ENVIRONMENT=sandbox`)
- **Auth**: Development mode (`BETTER_AUTH_ENV=development`)

#### Railway Production Environment

- **File**: `.env.railway.production`
- **Purpose**: Template for Railway production environment variables
- **URLs**: All pointing to `https://vtchat-web-production.up.railway.app`
- **Payment**: Production mode (`CREEM_ENVIRONMENT=production`)
- **Auth**: Production mode (`BETTER_AUTH_ENV=production`)

## Setting Up Railway Environments

### Method 1: Railway Dashboard

1. Go to your Railway project dashboard
2. Select the appropriate environment (development/production)
3. Navigate to "Variables" tab
4. Copy variables from the appropriate `.env.railway.*` file

### Method 2: Railway CLI

```bash
# For Development Environment
railway environment development
railway variables --set "BASE_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "BETTER_AUTH_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "NEXT_PUBLIC_BASE_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "NEXT_PUBLIC_APP_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "NEXT_PUBLIC_COMMON_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-development.up.railway.app"
railway variables --set "BETTER_AUTH_ENV=development"
railway variables --set "CREEM_ENVIRONMENT=sandbox"

# For Production Environment
railway environment production
railway variables --set "BASE_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "NEXT_PUBLIC_BASE_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "NEXT_PUBLIC_APP_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "NEXT_PUBLIC_COMMON_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app"
railway variables --set "BETTER_AUTH_ENV=production"
railway variables --set "CREEM_ENVIRONMENT=production"
```

## Critical Environment Variables

### Environment-Specific URLs

These MUST be different for each environment:

```bash
# Development Environment
BASE_URL=https://vtchat-web-development.up.railway.app
BETTER_AUTH_URL=https://vtchat-web-development.up.railway.app
NEXT_PUBLIC_BASE_URL=https://vtchat-web-development.up.railway.app
NEXT_PUBLIC_APP_URL=https://vtchat-web-development.up.railway.app
NEXT_PUBLIC_COMMON_URL=https://vtchat-web-development.up.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-development.up.railway.app

# Production Environment
BASE_URL=https://vtchat-web-production.up.railway.app
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BASE_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_COMMON_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
```

### Environment Configuration

```bash
# Development
BETTER_AUTH_ENV=development
CREEM_ENVIRONMENT=sandbox
LOG_LEVEL=debug

# Production
BETTER_AUTH_ENV=production
CREEM_ENVIRONMENT=production
LOG_LEVEL=info
```

## Security Considerations

### Development Environment

- ✅ Uses test/sandbox API keys
- ✅ Debug logging enabled
- ✅ Lower rate limits for testing

### Production Environment

- ⚠️ **TODO**: Update with production API keys
- ⚠️ **TODO**: Generate secure production secrets
- ⚠️ **TODO**: Configure production database
- ✅ Info-level logging
- ✅ Higher rate limits

## Deployment Steps

### 1. Development Deployment

1. Set environment variables in Railway development environment
2. Deploy from `dev` branch
3. Verify URLs point to development domain
4. Test authentication and payment flows

### 2. Production Deployment

1. Update production secrets and API keys
2. Set environment variables in Railway production environment
3. Deploy from `main` branch
4. Verify URLs point to production domain
5. Test all functionality thoroughly

## Troubleshooting

### Common Issues

1. **502 Errors**: Check that `HOSTNAME="0.0.0.0"` is set in Dockerfile
2. **Auth Issues**: Verify all URL variables point to correct environment
3. **Payment Issues**: Ensure `CREEM_ENVIRONMENT` matches the API keys used
4. **Build Failures**: Check that all required `NEXT_PUBLIC_*` variables are set

### Health Check

- **Endpoint**: `/api/health`
- **Timeout**: 300 seconds
- **Purpose**: Verify deployment is responding correctly

## Next Steps

1. **Set up development environment** using `.env.railway.development` template
2. **Set up production environment** using `.env.railway.production` template
3. **Update production secrets** with actual values (marked with TODO)
4. **Test deployments** in both environments
5. **Monitor logs** for any configuration issues

## Important Notes

- ✅ All environment files are properly gitignored
- ✅ Dockerfile is optimized for Railway deployment
- ✅ Configuration supports multiple environments
- ✅ Health checks are properly configured
- ⚠️ Production credentials need to be updated
- ⚠️ Consider separate Redis instance for production
