# Dockerfile Server Path Fix

## Issue

The Railway deployment was failing with the error:

```
Cannot find module '/app/server.js'
Error: Cannot find module '/app/server.js'
```

## Root Cause

The Next.js app is configured with `output: 'standalone'` in `next.config.mjs`. When Next.js builds a standalone output, it creates a specific directory structure where the `server.js` file is located at `apps/web/server.js` within the standalone build, not at the root.

The Dockerfile was copying the standalone build correctly:

```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
```

But then trying to run:

```dockerfile
CMD ["sh", "-c", "PORT=${PORT:-3000} node server.js"]
```

This was looking for `/app/server.js` when the file was actually at `/app/apps/web/server.js`.

## Solution

Updated the Dockerfile CMD to use the correct path:

```dockerfile
# Before (incorrect)
CMD ["sh", "-c", "PORT=${PORT:-3000} node server.js"]

# After (correct)
CMD ["sh", "-c", "PORT=${PORT:-3000} node apps/web/server.js"]
```

## Expected Result

The application should now start successfully on Railway without the "Cannot find module" error, and all endpoints including `/api/auth/*` should be accessible.

## Next Steps

1. Verify deployment succeeds in Railway logs
2. Test login functionality and auth endpoints
3. Confirm CORS headers are working correctly
4. Run comprehensive endpoint tests

## Files Modified

- `Dockerfile` - Updated CMD path to `apps/web/server.js`

## Verification Commands

```bash
# Check if server starts (should show success in Railway logs)
curl -I https://vtchat-web-development.up.railway.app/

# Test auth endpoints
curl -I https://vtchat-web-development.up.railway.app/api/auth/session

# Test login page
curl -I https://vtchat-web-development.up.railway.app/login
```
