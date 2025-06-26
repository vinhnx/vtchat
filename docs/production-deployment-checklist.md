# Production Deployment Checklist

## Pre-Deployment Verification

### Environment Variables ✅
- [ ] `BETTER_AUTH_SECRET` - 32-character production secret generated
- [ ] `BETTER_AUTH_URL` - Set to production domain
- [ ] `BETTER_AUTH_ENV` - Set to "production"
- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `NEXT_PUBLIC_APP_URL` - Production domain URL
- [ ] `NEXT_PUBLIC_BASE_URL` - Production base URL
- [ ] `BASE_URL` - Server-side production URL

### AI Service Configuration ✅
- [ ] `OPENAI_API_KEY` - Valid OpenAI API key with sufficient credits
- [ ] `ANTHROPIC_API_KEY` - Valid Anthropic API key
- [ ] `GEMINI_API_KEY` - Valid Google Gemini API key
- [ ] `FIREWORKS_API_KEY` - Valid Fireworks API key
- [ ] `JINA_API_KEY` - Valid Jina API key for embeddings

### Payment Integration (Optional) ✅
- [ ] `CREEM_API_KEY` - Production Creem API key
- [ ] `CREEM_PRODUCT_ID` - Production product ID
- [ ] `CREEM_ENVIRONMENT` - Set to "production"

### OAuth Configuration (Optional) ✅
- [ ] `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- [ ] `GITHUB_CLIENT_SECRET` - GitHub OAuth app secret
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] Google Auth published (not in test mode)

## Database Verification ✅
- [ ] Database connection test successful
- [ ] All migrations applied
- [ ] Database backup created
- [ ] Connection pooling configured
- [ ] Performance monitoring enabled

## Security Checklist ✅
- [ ] All secrets properly stored (not in code)
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Authentication flows tested

## Performance & Monitoring ✅
- [ ] Monitoring dashboard configured
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Performance metrics collection
- [ ] Log aggregation setup
- [ ] Health checks configured
- [ ] Uptime monitoring active

## Testing Verification ✅
- [ ] All core features tested in production environment
- [ ] Authentication flows verified
- [ ] AI model integrations tested
- [ ] Payment flows tested (if enabled)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

## Domain & DNS ✅
- [ ] Domain purchased and configured (vtchat.io.vn)
- [ ] DNS records properly set
- [ ] SSL certificate active
- [ ] CDN configured (if applicable)
- [ ] Redirect rules configured

## Deployment Platform ✅
- [ ] Build process verified
- [ ] Auto-deployment configured
- [ ] Health checks passing
- [ ] Resource limits appropriate
- [ ] Scaling rules configured
- [ ] Backup strategy implemented

## Post-Deployment ✅
- [ ] Smoke tests completed
- [ ] User acceptance testing
- [ ] Performance benchmarks met
- [ ] Error rates within acceptable limits
- [ ] Team notification sent
- [ ] Documentation updated

## Rollback Plan ✅
- [ ] Previous version tagged
- [ ] Rollback procedure documented
- [ ] Database rollback strategy
- [ ] Emergency contacts defined
- [ ] Incident response plan ready

---

**Deployment Date:** _____
**Deployed By:** _____
**Version:** _____
**Sign-off:** _____
