# Railway Deployment & Configuration Complete Guide

## 🎯 Overview

This guide provides a complete setup for deploying VTChat (Bun + Next.js 15 + Turborepo) to Railway with best practices for both development and production environments.

## 📋 Prerequisites

1. Railway account ([railway.app](https://railway.app))
2. Railway CLI installed: `npm install -g @railway/cli`
3. Git repository connected to Railway
4. Docker knowledge (basic)

## 🚀 Quick Start Deployment

### 1. Initial Railway Setup

```bash
# Login to Railway
railway login

# Link your project (run in project root)
railway link

# Deploy your project
railway up
```

### 2. Set Builder to Dockerfile

In Railway dashboard → Project → Service → Settings:

- **Builder**: Select "Dockerfile"
- **Root Directory**: Leave empty (uses project root)
- **Dockerfile Path**: `Dockerfile`

## 🏗️ Project Structure for Railway

Your project structure is optimized for Railway deployment:

```
vtchat/
├── Dockerfile                 # ✅ Railway deployment config
├── railway.toml              # ✅ Railway service configuration
├── .env.railway             # ✅ Environment variables template
├── apps/web/                # Next.js application
├── packages/                # Shared packages
└── docs/                    # Documentation
```

## 🔧 Environment Configuration

### Development vs Production Environments

#### Option 1: Single Environment (Recommended for MVP)

- Use one Railway service for production
- Test locally with `.env.local`

#### Option 2: Multiple Environments

- **Development**: `vtchat-dev` Railway project
- **Production**: `vtchat-prod` Railway project

### Setting Up Environment Variables

#### 1. Critical Variables (Required for app to work)

```bash
# Authentication (MUST HAVE)
BETTER_AUTH_SECRET=generate-32-char-secret
BETTER_AUTH_URL=https://your-app.up.railway.app
BETTER_AUTH_ENV=production

# Database (MUST HAVE)
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Application Base
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
BASE_URL=https://your-app.up.railway.app
```

#### 2. AI Service Keys (For chat functionality)

```bash
# All models are BYOK (Bring Your Own Key)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
FIREWORKS_API_KEY=your-fireworks-key
```

#### 3. Social Authentication (Optional)

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 4. Payment Integration (Optional)

```bash
# Creem.io for subscriptions
CREEM_API_KEY=your-creem-api-key
CREEM_WEBHOOK_SECRET=your-creem-webhook-secret
CREEM_PRODUCT_ID=your-product-id
```

#### 5. Additional Services (Optional)

```bash
# Redis for caching
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Email service
RESEND_API_KEY=your-resend-key

# Search/embeddings
JINA_API_KEY=your-jina-key
```

### Environment Variables Setup Methods

#### Method 1: Railway Dashboard (Recommended)

1. Go to Railway dashboard → Your project → Service
2. Click **Variables** tab
3. Add variables one by one
4. Click **Deploy** after adding all variables

#### Method 2: Railway CLI

```bash
# Set single variable
railway variables --set BETTER_AUTH_SECRET=your-secret

# Set multiple variables from file
railway variables --set --file .env.railway
```

#### Method 3: Bulk Import

Create `.env.railway` locally (DO NOT COMMIT), then:

```bash
railway variables --set $(cat .env.railway | grep -v '^#' | xargs)
```

## 🔐 Security Best Practices

### Secret Generation

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use Railway's secret generation
railway variables --set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
```

### Environment Variable Security

1. **Never commit** `.env` files with real values
2. **Use Railway's encrypted storage** for secrets
3. **Rotate secrets** regularly
4. **Use different secrets** for development/production
5. **Audit access** regularly

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL (Recommended)

```bash
# Add PostgreSQL service to your Railway project
railway add postgresql

# Get database URL
railway variables get DATABASE_URL
```

### Option 2: Neon PostgreSQL (Alternative)

1. Create database at [neon.tech](https://neon.tech)
2. Copy connection string
3. Set in Railway: `DATABASE_URL=postgresql://...`

### Database Migration

```bash
# Run migrations on deployment
# This is handled automatically by your Next.js build process
# Database migrations are in: apps/web/migration_better_auth.sql
```

## 🚢 Deployment Configuration

### railway.toml Optimization

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Optional: Custom domains
# [environments.production.domains]
# custom = ["yourdomain.com"]
```

### Dockerfile Best Practices

Your current Dockerfile is optimized for:

- ✅ **Bun for package management** (faster installs)
- ✅ **npm for builds** (better compatibility)
- ✅ **Alpine Linux** (smaller image size)
- ✅ **Multi-stage builds** (optimized layers)
- ✅ **Non-root user** (security)

### Build Performance Tips

1. **Layer caching**: Dependencies installed before code copy
2. **Ignore files**: Use `.dockerignore`
3. **Minimize rebuilds**: Only copy necessary files
4. **Health checks**: Ensure app is ready before traffic

## 🔄 Development Workflow

### Local Development Setup

1. **Copy environment template**:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. **Fill in local values**:

   ```bash
   # Development values
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_ENV=development
   DATABASE_URL=your-local-or-dev-db
   ```

3. **Start development server**:

   ```bash
   bun dev
   ```

### Testing Production Builds Locally

```bash
# Build production version
bun run build

# Test production build locally
bun start

# Or test with Docker (exactly like Railway)
docker build -t vtchat .
docker run -p 3000:3000 vtchat
```

### Deployment Workflow

1. **Make changes** in your local environment
2. **Test locally** with `bun dev`
3. **Commit & push** to your repository
4. **Railway auto-deploys** from your main branch
5. **Monitor deployment** in Railway dashboard
6. **Test production** at your Railway URL

## 🎛️ Multiple Environment Setup

### Development Environment

```bash
# Create development project
railway login
railway init vtchat-dev

# Set development variables
BETTER_AUTH_ENV=development
BETTER_AUTH_URL=https://vtchat-dev.up.railway.app
NODE_ENV=development
```

### Production Environment

```bash
# Create production project
railway init vtchat-prod

# Set production variables
BETTER_AUTH_ENV=production
BETTER_AUTH_URL=https://vtchat-prod.up.railway.app
NODE_ENV=production
```

### Branch-based Deployment

```toml
# railway.toml
[environments.development]
branch = "development"
variables = { NODE_ENV = "development" }

[environments.production]
branch = "main"
variables = { NODE_ENV = "production" }
```

## 📊 Monitoring & Maintenance

### Health Monitoring

Your app includes a health check endpoint:

- **URL**: `https://your-app.up.railway.app/api/health`
- **Response**: `{"status": "ok"}`
- **Used by**: Railway health checks

### Logs & Debugging

```bash
# View live logs
railway logs

# View specific service logs
railway logs --service web

# Follow logs in real-time
railway logs --follow
```

### Performance Monitoring

1. **Railway metrics**: Built-in CPU, memory, network usage
2. **Application logs**: Check for errors in Railway dashboard
3. **Health checks**: Monitor endpoint availability
4. **User feedback**: Monitor authentication and chat functionality

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Build Failures

```bash
# Issue: Native dependencies fail
# Solution: Use --ignore-scripts flag (already in Dockerfile)

# Issue: Memory errors during build
# Solution: Increase build resources in Railway settings
```

#### Runtime Issues

```bash
# Issue: Authentication not working
# Check: BETTER_AUTH_SECRET and BETTER_AUTH_URL are set

# Issue: Database connection fails
# Check: DATABASE_URL format and network access

# Issue: AI chat not working
# Check: API keys are set and valid
```

#### Environment Variable Issues

```bash
# Issue: Variables not updating
# Solution: Redeploy after setting variables

# Issue: Variables with special characters
# Solution: Wrap in quotes: VARIABLE="value with spaces"
```

### Debug Commands

```bash
# Check current variables
railway variables list

# Check deployment status
railway status

# Force redeploy
railway up --detach
```

## 💰 Cost Optimization

### Railway Pricing Considerations

1. **Starter Plan**: $5/month - suitable for development
2. **Usage-based**: Pay for actual resource consumption
3. **Sleep mode**: Apps sleep after inactivity (saves costs)
4. **Resource limits**: Set appropriate CPU/memory limits

### Cost-Saving Tips

1. **Use sleep mode** for development environments
2. **Optimize Docker image** size (already done)
3. **Monitor resource usage** in Railway dashboard
4. **Use appropriate instance sizes**
5. **Clean up** unused environments

## 📚 Additional Resources

### Documentation Links

- [Railway Documentation](https://docs.railway.app/)
- [Better Auth Documentation](https://www.better-auth.com/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Bun Documentation](https://bun.sh/docs)

### Support Channels

- Railway Discord
- GitHub Issues
- Railway Support Email

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API keys validated
- [ ] Health check endpoint working
- [ ] Local production build tested

### Post-Deployment

- [ ] Application accessible at Railway URL
- [ ] Authentication flow working
- [ ] AI chat functionality working
- [ ] Database operations working
- [ ] Health check passing
- [ ] Logs showing no critical errors

### Production Ready

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented
- [ ] Scaling parameters configured

---

**🎉 Success!** Your VTChat app is now successfully deployed on Railway with a robust configuration for both development and production environments.

**Live URL**: <https://vtchat-web-production.up.railway.app>

**Next Steps**: Configure environment variables and test all functionality as outlined in this guide.
