# Railway Deployment Quick Reference

## 🚀 TL;DR - Get VTChat Running on Railway

### 1. Deploy (Already Done ✅)

```bash
railway up
```

**Status**: ✅ Live at <https://vtchat-web-production.up.railway.app>

### 2. Critical Environment Variables (Do This Now 🚨)

#### Essential for App to Work

```bash
# Generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
DATABASE_URL=postgresql://... # Add PostgreSQL service or use external
```

#### For AI Chat Functionality

```bash
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
GEMINI_API_KEY=your-key
```

### 3. Set Variables in Railway Dashboard

1. Go to [railway.app](https://railway.app) → Your Project → web service → Variables
2. Add each variable above
3. Click "Deploy"

### 4. Test Your App

- Health: `https://vtchat-web-production.up.railway.app/api/health`
- Chat: `https://vtchat-web-production.up.railway.app/chat`
- Sign up/login to test authentication

---

## 📚 Complete Guides Available

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| `docs/railway-complete-guide.md` | Comprehensive Railway deployment & config | Setting up production environment |
| `docs/local-development-setup.md` | Complete local development setup | Starting development |
| `docs/railway-env-vars-guide.md` | Step-by-step environment variables | Configuring production |
| `docs/railway-deployment-success.md` | Deployment success report | Reference for what was done |

---

## 🔧 Quick Fixes

### App Won't Load

```bash
# Check these variables are set
BETTER_AUTH_SECRET=32+ character string
BETTER_AUTH_URL=https://vtchat-web-production.up.railway.app
DATABASE_URL=postgresql://...
```

### AI Chat Not Working

```bash
# Add API keys for models you want to use
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
```

### Database Issues

```bash
# Add PostgreSQL service in Railway
railway add postgresql
# DATABASE_URL will be auto-set
```

---

## 🎯 Next Steps Priority

1. **🚨 High Priority**: Set critical environment variables above
2. **🔵 Medium Priority**: Add social auth (GitHub, Google OAuth)
3. **🟢 Low Priority**: Payment integration, email service, monitoring

## 📞 Need Help?

- Check Railway logs: `railway logs`
- Review deployment docs: `docs/railway-troubleshooting.md`
- All environment variables: `docs/railway-env-vars-guide.md`

**Current Status**: ✅ Deployed and running, needs environment configuration for full functionality.
