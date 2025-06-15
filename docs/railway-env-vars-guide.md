# Railway Environment Variables - Production Setup Guide

## 🎯 Overview

This guide provides step-by-step instructions for configuring all environment variables needed for your VTChat app on Railway. After following this guide, your app will have full authentication, AI chat, and subscription functionality.

## 🚨 Critical Variables (App Won't Work Without These)

### 1. Authentication Configuration

**Generate and set these immediately:**

```bash
# Generate a secure secret key (run locally)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

In Railway Dashboard → Variables:

```bash
BETTER_AUTH_SECRET=your-generated-32-char-secret
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
BETTER_AUTH_ENV=production
NODE_ENV=production
```

### 2. Application Base URLs

```bash
BASE_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BASE_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_COMMON_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
```

### 3. Database Connection

**Option A: Railway PostgreSQL (Recommended)**

```bash
# Add PostgreSQL to your Railway project
railway add postgresql

# The DATABASE_URL will be automatically set
# You can view it in Variables tab
```

**Option B: External Database (Neon, etc.)**

```bash
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

## 🤖 AI Service Configuration (Required for Chat)

All chat models in VTChat require API keys (BYOK - Bring Your Own Key). Set the ones you plan to use:

### OpenAI (GPT Models)

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get from: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Anthropic (Claude Models)

```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

Get from: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### Google (Gemini Models)

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

Get from: [ai.google.dev/api](https://ai.google.dev/api)

### Fireworks AI (DeepSeek Models)

```bash
FIREWORKS_API_KEY=fw-your-fireworks-api-key-here
```

Get from: [app.fireworks.ai/settings/users/api-keys](https://app.fireworks.ai/settings/users/api-keys)

## 🔐 Social Authentication (Optional)

### GitHub OAuth

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `https://vtchat-web-production.up.railway.app/api/auth/callback/github`
4. Add to Railway:

```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URIs: `https://vtchat-web-production.up.railway.app/api/auth/callback/google`
4. Add to Railway:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 💳 Payment Integration (Optional)

For VT+ subscription functionality using Creem.io:

```bash
CREEM_API_KEY=creem_live_your-api-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
CREEM_PRODUCT_ID=your-product-id
CREEM_ENVIRONMENT=production

# Product configuration
PRODUCT_NAME=VT+
PRODUCT_DESCRIPTION=For everyday productivity
VT_PLUS_PRICE=9.99
PRICING_CURRENCY=USD
PRICING_INTERVAL=monthly
```

## 📧 Email Configuration (Optional)

For user verification and notifications:

```bash
# Email service (Resend recommended)
RESEND_API_KEY=re_your-resend-api-key

# SMTP configuration (alternative to Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🗄️ Redis/Caching (Optional)

For rate limiting and performance:

### Upstash Redis (Recommended)

```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Alternative Redis URL format

```bash
REDIS_URL=redis://default:password@host:port
```

## 🛠️ Additional Services (Optional)

### Search and Embeddings

```bash
JINA_API_KEY=jina_your-jina-api-key
```

### Analytics

```bash
HOTJAR_ID=your-hotjar-id
```

### Development/Debug

```bash
LOG_LEVEL=info
FREE_TIER_DAILY_LIMIT=50
```

## 📝 Complete Environment Variables List

Here's a complete template for copy-paste into Railway. Replace values with your actual credentials:

```bash
# Authentication (REQUIRED)
BETTER_AUTH_SECRET=your-generated-32-char-secret
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
BETTER_AUTH_ENV=production
NODE_ENV=production

# Application URLs (REQUIRED)
BASE_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BASE_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_COMMON_URL=https://vtchat-web-production.up.railway.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app

# Database (REQUIRED - Railway will set this if you add PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# AI Services (REQUIRED for chat functionality)
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
FIREWORKS_API_KEY=fw-your-fireworks-api-key

# Social Auth (OPTIONAL)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment Integration (OPTIONAL)
CREEM_API_KEY=creem_live_your-api-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
CREEM_PRODUCT_ID=your-product-id
CREEM_ENVIRONMENT=production
PRODUCT_NAME=VT+
PRODUCT_DESCRIPTION=For everyday productivity
VT_PLUS_PRICE=9.99
PRICING_CURRENCY=USD
PRICING_INTERVAL=monthly

# Email Service (OPTIONAL)
RESEND_API_KEY=re_your-resend-api-key

# Redis/Caching (OPTIONAL)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Additional Services (OPTIONAL)
JINA_API_KEY=jina_your-jina-api-key
LOG_LEVEL=info
FREE_TIER_DAILY_LIMIT=50
```

## 🚀 How to Set Variables in Railway

### Method 1: Railway Dashboard (Recommended)

1. Go to [railway.app](https://railway.app)
2. Navigate to your VTChat project
3. Click on the **web** service
4. Go to the **Variables** tab
5. Click **+ New Variable**
6. Add each variable name and value
7. Click **Deploy** after adding all variables

### Method 2: Railway CLI

```bash
# Set individual variables
railway variables --set BETTER_AUTH_SECRET=your-secret
railway variables --set BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app

# Or set multiple at once
railway variables --set \
  BETTER_AUTH_SECRET=your-secret \
  BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app \
  NODE_ENV=production
```

### Method 3: Environment File Import

1. Create a temporary `.env.railway` file locally (don't commit this):

```bash
# Copy the template above and fill in your values
BETTER_AUTH_SECRET=actual-secret-here
# ... etc
```

2. Import using Railway CLI:

```bash
# Set all variables from file
railway variables --set $(cat .env.railway | grep -v '^#' | grep -v '^$' | xargs)

# Clean up the file after import
rm .env.railway
```

## ✅ Testing Your Configuration

After setting all variables, test your deployment:

### 1. Basic Health Check

Visit: `https://vtchat-web-production.up.railway.app/api/health`

Should return: `{"status": "ok"}`

### 2. Application Access

Visit: `https://vtchat-web-production.up.railway.app`

- Should load without errors
- No console errors in browser dev tools

### 3. Authentication Test

1. Try to sign up/log in
2. Test social authentication (if configured)
3. Check user session persistence

### 4. AI Chat Test

1. Go to `/chat`
2. Select a model from dropdown
3. Test if API key prompt appears
4. Add an API key and test chat

### 5. Database Test

1. Sign up for a new account
2. Check that user is saved in database
3. Create a chat thread and verify it persists

## 🐛 Troubleshooting

### Common Issues

**App won't load / 500 errors**

- Check `BETTER_AUTH_SECRET` is set and 32+ characters
- Verify `BETTER_AUTH_URL` matches your Railway domain
- Check Railway logs for specific error messages

**Authentication not working**

- Verify `BETTER_AUTH_SECRET` is properly set
- Check `BETTER_AUTH_URL` matches your actual domain
- Ensure callback URLs in OAuth providers match your domain

**Database errors**

- Check `DATABASE_URL` is properly formatted
- Verify database is accessible from Railway
- Check database permissions

**AI chat not working**

- Verify API keys are correct and have sufficient credits
- Check API key format (OpenAI: `sk-`, Anthropic: `sk-ant-`, etc.)
- Test API keys directly with provider APIs

**Environment variables not updating**

- Click "Deploy" after changing variables in Railway dashboard
- Wait for deployment to complete
- Clear browser cache/hard refresh

### Debug Commands

```bash
# View current variables
railway variables list

# Check deployment logs
railway logs

# Force redeploy
railway up --detach
```

## 🔄 Variable Management Best Practices

### Security

1. **Use Railway's built-in encryption** for all secrets
2. **Never commit** real environment variables to git
3. **Rotate secrets** regularly (especially auth secrets)
4. **Use least-privilege** API keys when possible

### Organization

1. **Group related variables** (auth, database, AI, etc.)
2. **Use consistent naming** conventions
3. **Document purposes** of custom variables
4. **Keep development and production** variables separate

### Maintenance

1. **Regular audits** of active variables
2. **Remove unused** variables
3. **Monitor API usage** and costs
4. **Update documentation** when adding new variables

---

**🎉 Success!** Your Railway environment is now fully configured!

**Next Steps:**

1. Test all functionality with the checklist above
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up automated backups
5. Monitor costs and usage

**Live App**: <https://vtchat-web-production.up.railway.app>

## 🚨 URGENT: Missing Redis Configuration

**⚠️ Your current deployment is failing because Redis is not configured!**

Your app uses Upstash Redis for MCP (Model Context Protocol) session management, which is critical for AI functionality. Without Redis, the following features won't work:

- AI chat sessions
- MCP tool integrations
- Session persistence

### Fix This Now

1. **Create Upstash Redis Database:**
   - Go to [Upstash Console](https://console.upstash.com/redis)
   - Create new database: "vtchat-redis"
   - Choose region closest to Railway (US East recommended)
   - Use free tier (10k requests/day)

2. **Add These Variables to Railway:**

   ```bash
   KV_REST_API_URL=https://your-endpoint.upstash.io
   KV_REST_API_TOKEN=your-upstash-token
   UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-upstash-token
   REDIS_URL=redis://default:your-password@your-endpoint.upstash.io:6379
   ```

3. **Redeploy:**

   ```bash
   railway redeploy
   ```
