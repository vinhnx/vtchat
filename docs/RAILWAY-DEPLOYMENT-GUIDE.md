# Railway Deployment Guide - VTChat

## 🎯 Current Status Analysis

Your Railway project is set up with both **development** and **production** environments, but there are critical configuration issues that need to be fixed for proper deployment.

### ❌ Issues Found in Your Production Environment

1. **Wrong Better Auth URL**: Still pointing to `localhost:3000` instead of production domain
2. **Wrong Better Auth Environment**: Set to `development` instead of `production`
3. **Missing AI API Keys**: No OpenAI, Anthropic, Gemini, or Fireworks keys
4. **Missing Base URLs**: No application base URLs configured
5. **Missing Upstash Redis**: No rate limiting configuration

## 🚀 Step-by-Step Fix Guide

### 1. Fix Production Environment Variables

Switch to production and fix the critical authentication variables:

```bash
# Switch to production environment
railway environment production
railway service vtchat

# Fix authentication URLs and environment
railway variables set BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
railway variables set BETTER_AUTH_ENV=production
railway variables set BASE_URL=https://vtchat-web-production.up.railway.app
railway variables set NEXT_PUBLIC_APP_URL=https://vtchat-web-production.up.railway.app
railway variables set NEXT_PUBLIC_BASE_URL=https://vtchat-web-production.up.railway.app
railway variables set NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
```

### 2. Add Required AI API Keys (Choose Your Providers)

Add API keys for the AI models you want to use:

```bash
# OpenAI (for GPT models) - Get from: https://platform.openai.com/api-keys
railway variables set OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic (for Claude models) - Get from: https://console.anthropic.com/settings/keys
railway variables set ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google Gemini - Get from: https://ai.google.dev/api
railway variables set GEMINI_API_KEY=your-gemini-key-here

# Fireworks (for DeepSeek models) - Get from: https://app.fireworks.ai/settings/users/api-keys
railway variables set FIREWORKS_API_KEY=fw-your-fireworks-key-here
```

### 3. Add Upstash Redis for Rate Limiting (Recommended)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the connection details and add:

```bash
railway variables set UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
railway variables set UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 4. Fix Development Environment

Switch to development and fix the NODE_ENV:

```bash
# Switch to development environment
railway environment development
railway service vtchat

# Fix NODE_ENV for development
railway variables set NODE_ENV=development
railway variables set BETTER_AUTH_URL=https://vtchat-web-development.up.railway.app
```

### 5. Deploy Your Changes

After setting all variables, redeploy:

```bash
# Make sure your code is committed and pushed to GitHub
git add .
git commit -m "Fix environment configuration for Railway deployment"
git push origin main

# Deploy to both environments
railway environment production
railway up

railway environment development
railway up
```

## 🔧 Environment File Strategy (Local Development)

For **local development**, continue using `.env.local`:

```bash
# Copy template to your local development file
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local with your real API keys and localhost URLs
```

### Key Points

- **`.env.local`** → Use this for local development (gitignored)
- **`.env.build`** → Used for Docker builds (committed with placeholders)
- **Railway Variables** → Override everything in production (set via CLI or dashboard)

## 🧪 Testing Your Deployment

After fixing the variables:

1. **Test Production**: Visit `https://vtchat-web-production.up.railway.app`
2. **Test Development**: Visit `https://vtchat-web-development.up.railway.app`
3. **Check Authentication**: Try signing up/logging in
4. **Test AI Chat**: Send a message to verify AI integration
5. **Test Payments**: Try the subscription flow (if configured)

## 📝 Quick Commands Reference

```bash
# Check current environment and service
railway status

# Switch environments
railway environment production
railway environment development

# Connect to service
railway service vtchat

# View all variables
railway variables

# Set a variable
railway variables set KEY=value

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open
```

## 🚨 Critical Next Steps

1. **Fix production auth URLs** (most important)
2. **Add at least one AI API key** (for chat functionality)
3. **Redeploy both environments**
4. **Test the production deployment**
5. **Set up Upstash Redis** (for better rate limiting)

## ✅ Success Checklist

- [ ] Production `BETTER_AUTH_URL` points to production domain
- [ ] Production `BETTER_AUTH_ENV` is set to `production`
- [ ] At least one AI API key is configured
- [ ] Base URLs are configured for production
- [ ] Development `NODE_ENV` is set to `development`
- [ ] Both environments deployed successfully
- [ ] Authentication works on production
- [ ] AI chat works on production

## 🔗 Useful Links

- **Production App**: <https://vtchat-web-production.up.railway.app>
- **Development App**: <https://vtchat-web-development.up.railway.app>
- **Railway Dashboard**: <https://railway.app/dashboard>
- **Environment Files Guide**: See `ENV-STRATEGY.md`
