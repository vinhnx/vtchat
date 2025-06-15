# Missing Environment Variables Fix Guide

## Current Issue

Your VTChat application is showing warnings about missing environment variables that are required for proper functionality. Here's how to fix them.

## Required Environment Variables Analysis

### ✅ Already Configured

- `DATABASE_URL` - Neon PostgreSQL ✓
- `BETTER_AUTH_SECRET` - Generated ✓
- `BETTER_AUTH_URL` - Set to production URL ✓
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - GitHub OAuth ✓
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth ✓
- `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, `CREEM_PRODUCT_ID` - Payment processing ✓

### ❌ Missing Critical Variables

#### 1. Upstash Redis (REQUIRED for MCP sessions)

Your app uses Redis for Model Context Protocol (MCP) session management. **This is critical for AI functionality.**

**Required Variables:**

```bash
KV_REST_API_URL=https://your-redis-endpoint.upstash.io
KV_REST_API_TOKEN=your-redis-token
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
REDIS_URL=redis://your-redis-connection-string
```

**How to Get These:**

1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Create a new Redis database (or use existing)
3. Copy the REST URL and Token from the database details
4. Use the same values for both `KV_REST_API_*` and `UPSTASH_REDIS_REST_*` variables

#### 2. AI Provider API Keys (BYOK - Bring Your Own Keys)

Your app requires at least one AI provider:

```bash
# At least one of these is required:
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

**How to Get These:**

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google AI**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

## Quick Fix Commands

### Step 1: Update Your Local Environment

```bash
# Navigate to your project
cd /Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat

# Copy the updated template (already done)
# Your .env file has been updated with the missing Redis variables
```

### Step 2: Set Up Upstash Redis

1. **Create Upstash Redis Database:**

   ```bash
   # Open Upstash Console
   open https://console.upstash.com/redis
   ```

2. **Create Database:**
   - Click "Create Database"
   - Choose a name (e.g., "vtchat-redis")
   - Select region closest to your Railway deployment
   - Choose the free tier for testing

3. **Get Connection Details:**
   - Click on your database
   - Copy the "REST URL" and "REST Token"

### Step 3: Update Railway Environment Variables

#### Option A: Using Railway CLI

```bash
# Set Redis variables
railway variables --set KV_REST_API_URL="your-upstash-rest-url"
railway variables --set KV_REST_API_TOKEN="your-upstash-rest-token"
railway variables --set UPSTASH_REDIS_REST_URL="your-upstash-rest-url"
railway variables --set UPSTASH_REDIS_REST_TOKEN="your-upstash-rest-token"
railway variables --set REDIS_URL="your-upstash-redis-url"

# Set AI provider (choose at least one)
railway variables --set OPENAI_API_KEY="your-openai-key"
# OR
railway variables --set ANTHROPIC_API_KEY="your-anthropic-key"
# OR
railway variables --set GOOGLE_AI_API_KEY="your-google-ai-key"
```

#### Option B: Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Go to Variables tab
4. Add the missing variables listed above

### Step 4: Update Both Environments

You have two Railway environments. Make sure to set variables for both:

**Production Environment:**

- Set all variables listed above

**Development Environment:**

- Same variables, can use same Redis instance
- Or create a separate Redis database for dev

### Step 5: Redeploy

```bash
# Redeploy to pick up new environment variables
railway redeploy
```

## Verification

### Check Logs After Deployment

```bash
# Check production logs
railway logs --environment production

# Check development logs
railway logs --environment development
```

### Test Redis Connection

After deployment, your app should no longer show Redis connection errors.

### Test AI Functionality

1. Visit your deployed app
2. Try to start a chat session
3. MCP sessions should now work without errors

## Environment Variable Priority

Your app uses this priority for Redis variables:

1. `KV_REST_API_URL` and `KV_REST_API_TOKEN` (primary)
2. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (fallback)
3. `REDIS_URL` (legacy support)

Set all of them to the same values for maximum compatibility.

## Common Issues & Solutions

### Issue: "Redis connection failed"

- **Solution**: Double-check your Upstash REST URL and Token
- **Check**: Variables are set in the correct Railway environment

### Issue: "AI provider not configured"

- **Solution**: Set at least one AI provider API key
- **Note**: Your app uses BYOK (Bring Your Own Keys) model

### Issue: "Session storage failed"

- **Solution**: Redis is required for MCP session management
- **Action**: Complete the Upstash Redis setup above

## Cost Considerations

- **Upstash Redis**: Free tier includes 10,000 requests/day
- **AI APIs**: Pay-per-use based on your actual usage
- **Railway**: Existing deployment costs remain the same

## Next Steps

1. ✅ Set up Upstash Redis (most critical)
2. ✅ Add at least one AI provider API key
3. ✅ Deploy and test
4. ✅ Monitor logs for any remaining warnings
5. ✅ Test full application flow (auth → AI chat → MCP tools)

After completing these steps, your VTChat application should be fully functional with all integrations working properly.
