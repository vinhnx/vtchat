# Railway Deployment Troubleshooting

## 🔧 Current Configuration Status

### ✅ FIXED: Railway detecting Dockerfile instead of Nixpacks

- **Problem**: Railway was showing "Using Detected Dockerfile" in build logs
- **Root Cause**: Railway prioritizes Dockerfile over Nixpacks when both are present
- **Solution**:
  1. Removed all Dockerfile files from project root
  2. Configured `railway.toml` to explicitly use `builder = "NIXPACKS"`
  3. Updated `nixpacks.toml` with explicit Bun provider configuration

### ✅ FIXED: npm ci Issue (Bun Provider Detection)

- **Problem**: Railway Nixpacks was detecting project as npm and running `npm ci`
- **Solution**: Configured `.nixpacks` file to force Bun provider and updated configuration files

### ❌ CURRENT ISSUE: Nixpacks "/app" Directory Conflict

- **Problem**: Nixpacks uses `/app` as its internal working directory, but Next.js projects have an `app/` folder
- **Error**: `Error: Writing app - Caused by: Is a directory (os error 21)`
- **Root Cause**: Nixpacks cannot create `/app` because it conflicts with the Next.js `app/` directory
- **Attempted Solutions**:
  1. ✗ Temporary directory renaming during build phases
  2. ✗ Using `onlyIncludeFiles` to exclude app directory
  3. ✗ Alternative working directory configuration
  4. ✗ Custom Dockerfile approach
  5. ✗ Minimal Nixpacks configuration

### Known Working Solutions

According to Railway community and research:

1. **Use Custom Dockerfile** (most reliable)
   - Railway supports Dockerfiles and will use them instead of Nixpacks
   - Avoids the `/app` directory conflict entirely
   - Allows full control over build process

2. **Move Next.js app directory** (requires code changes)
   - Rename `apps/web/app` to `apps/web/src/app`
   - Update Next.js configuration to use new structure
   - Not ideal as it requires significant project restructuring

3. **Use different build strategy**
   - Some projects successfully use Vercel or Netlify for similar monorepos
   - Consider alternative deployment platforms

### Files Configured

- ✅ `railway.toml` - Build and deploy commands with explicit Nixpacks builder
- ✅ `nixpacks.toml` - Minimal configuration to force Node provider
- ✅ `.nixpacks` - Force Node provider detection (bun auto-detected)
- ✅ `.bunfig.toml` - Bun configuration
- ✅ Health check endpoint at `/api/health`
- ✅ No Dockerfile present (removed to force Nixpacks)

## 🚀 Current Deployment Status

**PROGRESS**: Implementing Docker-based deployment to bypass Nixpacks `/app` directory conflict

Current approach:

- ✅ **Dockerfile Strategy**: Created multi-stage Dockerfile using Bun 1.1.19 Alpine
- ✅ **Railway Configuration**: Updated `railway.toml` to use `DOCKERFILE` builder
- ✅ **Lock File Fix**: Corrected Dockerfile to use `bun.lock` instead of `bun.lockb`
- 🔄 **Build In Progress**: Currently deploying with Docker approach
- ⚠️ **Local Build Issues**: React error in static generation (may not affect Railway build)

**Recent Changes**:

- Switched from Nixpacks to Dockerfile due to `/app` directory conflict
- Fixed Drizzle ORM version conflict with temporary workaround
- Updated Next.js config to move `outputFileTracingRoot` to root level
- Created optimized multi-stage Docker build for Railway

**Next Steps**:

1. Monitor current Docker-based deployment
2. If successful, verify health check endpoint
3. Test application functionality
4. Set environment variables in Railway dashboard
5. Document successful configuration for future deployments

## 🔄 **CURRENT DEPLOYMENT ITERATION:**

**Docker Build Progress**:

- ✅ **Package Installation Fix**: Resolved Alpine Linux `libc6-compat` conflict
- 🔄 **Dependency Installation**: Build progressing through `bun install --frozen-lockfile`
- ⚠️ **Potential Issue**: Large dependency tree may cause timeouts

**Build Logs Observations**:

```
[5/6] RUN bun install --frozen-lockfile
bun install v1.1.19 (11084935)
[16.45ms] migrated lockfile from package-lock.json
Resolving dependencies
Deploy failed
```

**Current Status**: Build failing during dependency resolution - investigating timeout/memory issues

## 📊 Monitoring Commands

```bash
# Check deployment status
railway status

# View logs
railway logs --tail

# Get service URL
railway domain

# Check variables
railway variables
```

## 🔧 Environment Variables Needed

Set these in Railway dashboard:

```bash
DATABASE_URL="postgresql://..."  # Auto-generated
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="https://your-app.up.railway.app"
OPENAI_API_KEY="your-key"
ANTHROPIC_API_KEY="your-key"
CREEM_API_KEY="your-key"
CREEM_WEBHOOK_SECRET="your-secret"
CREEM_PRODUCT_ID="your-product-id"
CREEM_ENVIRONMENT="sandbox"
NODE_ENV="production"
```

## 🐛 Common Issues & Fixes

### 1. Railway Detects Dockerfile Instead of Nixpacks

**Symptoms**: Build logs show "Using Detected Dockerfile" instead of Nixpacks
**Fix**:

```bash
# Remove any Dockerfile from project root
rm -f Dockerfile*

# Verify no Dockerfile exists
find . -name "Dockerfile*" -type f

# Force Nixpacks in railway.toml
[build]
builder = "NIXPACKS"
nixpacksConfigPath = "nixpacks.toml"
```

### 2. Build Fails with npm ci

- **Fixed**: Force Bun provider with `.nixpacks` file
- **Config**: `{"providers": ["bun"]}`

### 2. Dependencies Not Found

- **Check**: `bun.lockb` exists and is committed
- **Fix**: Run `bun install` locally and commit lockfile

### 3. Build Times Out

- **Cause**: Large dependency installation
- **Fix**: Optimize dependencies, remove unused packages

### 4. Runtime Errors

- **Check**: Environment variables are set
- **Check**: Database connection string is correct
- **Check**: Health check endpoint responds

## 🎯 Success Indicators

✅ Upload completes successfully
✅ Build logs show "Using Detected Bun"
✅ Dependencies install with Bun
✅ Build completes without errors
✅ Service starts on port 3000
✅ Health check returns 200

## 📞 Next Steps

1. Monitor build progress in Railway dashboard
2. Check build logs for any errors
3. Set environment variables once deployed
4. Test the health check endpoint
5. Update `BETTER_AUTH_URL` with actual domain

Build logs: <https://railway.com/project/53e4c95c-c373-40af-ae40-7ab20e87b85e/service/f72a404d-bf00-4c78-b4eb-aeb80df91dd7>
