# Fly.io Deployment Guide

## Overview

This guide explains how to deploy VT (Bun + Next.js 15 + Turborepo) to Fly.io with production-ready configuration.

## Prerequisites

1. Fly.io account ([fly.io](https://fly.io))
2. Fly CLI installed: `curl -L https://fly.io/install.sh | sh`
3. Git repository with your code

## Quick Setup

### 1. Initial Fly.io Setup

```bash
# Install and authenticate
fly auth login

# Initialize your app (creates fly.toml)
fly apps create vtchat-dev --region sin

# Or launch interactively
fly launch
```

### 2. Environment Variables

Use the automated script to set all secrets from your env file:

```bash
# Set secrets from apps/web/.env.build (default)
./deploy-fly-secrets.sh --clean

# Or specify custom env file
./deploy-fly-secrets.sh --clean apps/web/.env.local
```

### 3. Deploy

```bash
fly deploy
```

## Configuration Files

### fly.toml
- ✅ **Configured**: Production settings with proper environment variables
- ✅ **Region**: Singapore (sin) for Asian users
- ✅ **Resources**: 1GB memory, shared CPU
- ✅ **Auto-scaling**: Stop/start machines based on traffic

### Dockerfile
- ✅ **Multi-stage build**: Optimized for production
- ✅ **Bun runtime**: Fast JavaScript runtime
- ✅ **Environment variables**: Proper secret handling
- ✅ **Health checks**: Built-in Next.js health endpoint

## Environment Variables

### Public Variables (in fly.toml [env] section)
```toml
[env]
  BASE_URL = "https://vtchat-dev.fly.dev"
  BETTER_AUTH_URL = "https://vtchat-dev.fly.dev"
  NEXT_PUBLIC_BASE_URL = "https://vtchat-dev.fly.dev"
  NEXT_PUBLIC_APP_URL = "https://vtchat-dev.fly.dev"
  CREEM_ENVIRONMENT = "sandbox"
  BETTER_AUTH_ENV = "production"
```

### Secrets (via fly secrets)
```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  BETTER_AUTH_SECRET="..." \
  CREEM_API_KEY="..." \
  GITHUB_CLIENT_ID="..." \
  GITHUB_CLIENT_SECRET="..."
```

## Monitoring & Logs

```bash
# View application logs
fly logs

# Check app status
fly status

# Open app in browser
fly open

# SSH into running machine
fly ssh console

# Scale app
fly scale count 2

# Check metrics
fly dashboard
```

## Production Checklist

- ✅ **Database**: Neon PostgreSQL configured
- ✅ **Authentication**: Better Auth with OAuth providers
- ✅ **Environment**: Production secrets set
- ✅ **Domain**: Custom domain (optional)
- ✅ **SSL**: Automatic HTTPS via Fly.io
- ✅ **Monitoring**: Built-in Fly.io metrics
- ✅ **Auto-scaling**: Machine management enabled

## Troubleshooting

### Build Issues
```bash
# Check build logs
fly logs --app vtchat-dev

# Force rebuild
fly deploy --no-cache
```

### Runtime Issues
```bash
# Check app health
fly status

# View environment variables
fly ssh console -C "printenv | grep -E '(DATABASE|AUTH|CREEM)'"
```

### Database Issues
```bash
# Test database connection
fly ssh console -C "echo 'SELECT 1;' | psql $DATABASE_URL"
```

## Cost Optimization

- ✅ **Free tier**: Under $5/month usage
- ✅ **Auto-stop**: Machines stop when idle
- ✅ **Shared CPU**: Cost-effective for development
- ✅ **Single region**: Reduces data transfer costs

## Next Steps

1. **Custom Domain**: Add your domain in Fly.io dashboard
2. **Monitoring**: Set up external monitoring (UptimeRobot, etc.)
3. **CI/CD**: Configure GitHub Actions for automatic deployments
4. **Production Environment**: Create separate app for production

## Useful Commands

```bash
# Quick deployment
fly deploy

# Set multiple secrets at once
./deploy-fly-secrets.sh --clean

# Check app logs in real-time
fly logs -f

# Scale to zero (stop all machines)
fly scale count 0

# Scale back up
fly scale count 1

# View app dashboard
fly dashboard vtchat-dev
```
