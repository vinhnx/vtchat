# 🚀 VT (VTChat) - Production Deployment Guide

## 📋 Quick Start

VT is production-ready with automated deployment scripts for both development and production environments.

```bash
# Development deployment
./deploy-fly.sh --dev

# Production deployment  
./deploy-fly.sh --prod

# Clean secrets and deploy
./deploy-fly.sh --clean --prod
```

## 🎯 Prerequisites

1. **Fly.io Account**: [Sign up at fly.io](https://fly.io) and install CLI
2. **Fly CLI**: `curl -L https://fly.io/install.sh | sh`
3. **Environment Files**: Set up your `.env.development` and `.env.production`
4. **Database**: Neon PostgreSQL database with proper schema
5. **API Keys**: GitHub, Google OAuth, Creem.io payment, AI providers
6. **Domain**: Custom domain configuration (vtchat.io.vn)

## Environment Configuration

### Development (`fly.toml`)
- **App**: `vtchat-dev.fly.dev`
- **NODE_ENV**: `development`
- **Resources**: 1GB RAM, 1 CPU
- **Auto-scaling**: Stop when idle (cost-optimized)
- **Health checks**: Every 60s
- **Secrets from**: `apps/web/.env.development`

### Production (`fly.production.toml`)
- **App**: `vtchat` (live at vtchat.io.vn)
- **NODE_ENV**: `production`
- **Resources**: 2GB RAM, 2 CPUs (shared)
- **Auto-scaling**: Suspend when idle, min 1 machine
- **Health checks**: Every 30s at `/api/health`
- **Secrets from**: `apps/web/.env.production`
- **Region**: Singapore (sin) for optimal performance

## File Structure

```
├── fly.toml                    # Development config
├── fly.production.toml         # Production config
├── deploy-fly.sh              # Unified deployment script
└── apps/web/
    ├── .env.development       # Dev secrets (gitignored)
    ├── .env.production        # Prod secrets (gitignored)
    └── .env.example          # Public template
```

## Environment Variables

### Public (in fly.toml [env] section)
- `NODE_ENV`, `BASE_URL`, `NEXT_PUBLIC_*`
- `CREEM_ENVIRONMENT`, `BETTER_AUTH_ENV`
- Product configuration

### Secrets (via fly secrets)
- `DATABASE_URL`, `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`
- `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, `CREEM_PRODUCT_ID`

- `GEMINI_API_KEY` (for free tier models)
- `NEON_PROJECT_ID`, `NEON_API_KEY`

## Commands

```bash
# Deploy development
./deploy-fly.sh --dev

# Deploy production with clean secrets
./deploy-fly.sh --clean --prod

# Monitor logs
fly logs -f --app vtchat-dev
fly logs -f --app vtchat

# Check status
fly status --app vtchat-dev
fly status --app vtchat

# Scale production
fly scale count 2 --app vtchat

# Open apps
fly open --app vtchat-dev
fly open --app vtchat
```

## Health Checks

Both environments have health checks at `/api/health`:
- **Development**: 60s interval
- **Production**: 30s interval

```toml
# Health check configuration (already set in fly.toml files)
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"  # 60s for development
  method = "GET"
  timeout = "5s"
  path = "/api/health"
```

## Deployment Process

1. **Reads** environment-specific secrets
2. **Sets** Fly.io secrets automatically  
3. **Deploys** using Dockerfile
4. **Applies** environment-specific configuration
5. **Reports** deployment status and URLs

## Cost Optimization

- **Development**: Auto-stops when idle, 0 min machines
- **Production**: Suspends when idle, 1 min machine
- **Shared CPU**: Cost-effective for both environments
- **Singapore region**: Optimal for Asian users
