# Environment File Strategy for VTChat

## File Structure

```
apps/web/
├── .env.example      # Template (committed) - safe defaults and documentation
├── .env.local        # Development secrets (gitignored) - your personal dev config
├── .env.build        # Docker build placeholders (committed) - minimal build-time values
└── .env              # Production config (gitignored) - can contain non-sensitive production defaults
```

## File Purposes

### `.env.example` (Committed)

- Template for other developers
- Documents all required environment variables
- Contains safe example values
- Used for onboarding new developers

### `.env.local` (Gitignored) ✅ **Use this for development**

- Your personal development configuration
- Contains real API keys and secrets for local development
- Highest priority in Next.js environment loading order
- Never committed to git

### `.env.build` (Committed)

- Minimal placeholders for Docker build process
- Only contains variables needed at build-time
- Gets copied to `.env.local` during Docker build
- Safe placeholder values that won't break the build

### `.env` (Optional, Gitignored)

- Can contain production defaults for non-sensitive values
- Useful for shared configuration across team
- Lower priority than `.env.local`

## Next.js Environment Loading Order

Next.js loads environment files in this order (higher priority overrides lower):

1. `.env.local` (highest priority) ← **Use this for development**
2. `.env.development` (if NODE_ENV=development)
3. `.env.production` (if NODE_ENV=production)
4. `.env` (lowest priority)

## Recommended Workflow

### For Development

1. Copy `.env.example` to `.env.local`
2. Fill in real values in `.env.local`
3. Keep `.env.local` updated with your personal config
4. Never commit `.env.local`

### For Production

1. Set environment variables directly in Railway dashboard
2. Or use `.env` for non-sensitive defaults (optional)
3. Railway environment variables override all local files

### For Docker Build

1. `.env.build` provides build-time placeholders
2. Gets copied to `.env.local` during build process
3. Railway runtime variables override everything

## Commands to Set Up

```bash
# Set up your development environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your real API keys

# Sync .env.build with any new variables from .env.local (keys only, not values)
# This ensures Docker builds have all required environment variable keys
# with safe placeholder values
```

## Recently Synced ✅

**Environment variable keys are now synchronized between:**

- `.env.local` → Contains your real development values
- `.env.build` → Contains safe placeholder values for Docker builds
- `.env.example` → Contains template documentation

**All files now include the same set of environment variables with appropriate values for their purpose.**
