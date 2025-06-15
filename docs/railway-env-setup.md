# Railway Environment Variables Setup

## Quick Setup Guide

Now that the VTChat app is deployed and running, you need to configure the environment variables for full functionality.

## Access Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Navigate to your VTChat project
3. Click on the **web** service
4. Go to the **Variables** tab

## Required Environment Variables

### 1. Authentication (CRITICAL - App won't work without these)

```bash
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
```

**Generate a secret key:**

```bash
# Run this locally to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Database Connection

```bash
DATABASE_URL=your-database-connection-string
```

### 3. AI Service Keys (for chat functionality)

```bash
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
```

### 4. Social Authentication (Optional)

#### Google OAuth

```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

#### GitHub OAuth

```bash
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
```

### 5. Redis (Optional - for caching)

```bash
REDIS_URL=redis://your-redis-connection-string
```

## Setting Variables in Railway

1. **One by one**: Click "Add Variable" and enter each key-value pair
2. **Bulk import**: Use the "Raw Editor" to paste all variables at once

### Raw Editor Format

```
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-openai-key
```

## After Setting Variables

1. **Deploy**: Railway will automatically redeploy with new environment variables
2. **Check logs**: Monitor the deployment logs for any errors
3. **Test**: Visit your app and test authentication and chat functionality

## Verification Commands

Run these in Railway's environment to verify setup:

```bash
# Check if auth secret is set
echo $BETTER_AUTH_SECRET

# Check if database is accessible
echo $DATABASE_URL

# Test the app health
curl https://vtchat-web-production.up.railway.app/api/health
```

## Troubleshooting

### Common Issues

1. **Auth not working**: Verify `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are set correctly
2. **Database errors**: Check `DATABASE_URL` format and connectivity
3. **AI chat not working**: Verify at least one AI service key is configured
4. **Social login fails**: Check OAuth app settings and callback URLs

### Getting Help

1. Check Railway logs: `railway logs --tail`
2. Review error messages in the Railway dashboard
3. Test individual API endpoints for specific functionality

## Security Notes

- Never commit environment variables to git
- Use Railway's encrypted variable storage
- Rotate secrets regularly
- Use least-privilege access for API keys

---

**Next**: Once variables are set, your VTChat app should be fully functional! 🚀
