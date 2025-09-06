# Local Development Environment Setup

## 🎯 Quick Start for Development

This guide helps you set up VT for local development with all the necessary environment variables and services.

## 📋 Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- PostgreSQL (local or cloud)
- Fly CLI (optional, for deployment)

## 🚀 Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd vtchat

# Install dependencies with Bun (recommended)
bun install

# Or with npm/pnpm
npm install
```

### 2. Create Local Environment File

```bash
# Copy the environment template
cp apps/web/.env.example apps/web/.env.local
```

### 3. Configure Environment Variables

Edit `apps/web/.env.local` with your local development values:

```bash
# =================================================================
# LOCAL DEVELOPMENT ENVIRONMENT VARIABLES
# =================================================================

# Better-Auth Configuration (Required)
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=process.env.NEXT_PUBLIC_BASE_URL
BETTER_AUTH_ENV=development
BASE_URL=process.env.NEXT_PUBLIC_BASE_URL

# Next.js Public Variables
NEXT_PUBLIC_COMMON_URL=process.env.NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_BETTER_AUTH_URL=process.env.NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_BASE_URL=process.env.NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_APP_URL=process.env.NEXT_PUBLIC_BASE_URL

# Database Configuration (Choose one option below)
# Option 1: Local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/vtchat_dev

# Option 2: Neon PostgreSQL (recommended for development)
# DATABASE_URL=postgresql://postgres:password@host:port/database

# Option 3: Neon PostgreSQL
# DATABASE_URL=postgresql://username:password@hostname.neon.tech/dbname?sslmode=require

# AI Service Configuration (BYOK - Bring Your Own Key)
# Get these from respective providers:
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
FIREWORKS_API_KEY=fw-your-fireworks-api-key-here

# Social Authentication (Optional for development)
# GitHub OAuth - https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth - https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
# For Better Auth email verification and notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis Configuration - removed (no longer needed)

# Payment Integration (Optional for development)
# Creem.io for subscription management
CREEM_API_KEY=creem_test_your-test-api-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
CREEM_PRODUCT_ID=your-test-product-id
CREEM_ENVIRONMENT=sandbox

# Product Configuration
PRODUCT_NAME=VT+
PRODUCT_DESCRIPTION=For everyday productivity
VT_PLUS_PRICE=5.99  # Monthly subscription price in USD
PRICING_CURRENCY=USD
PRICING_INTERVAL=monthly

# Additional Services (Optional)
RESEND_API_KEY=re_your-resend-api-key
JINA_API_KEY=jina_your-jina-api-key

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Neon Configuration (if using Neon)
NEON_PROJECT_ID=your-neon-project-id
NEON_API_KEY=your-neon-api-key
```

## 🔐 Getting API Keys and Secrets

### Required for Core Functionality

#### 1. Better Auth Secret

```bash
# Generate a secure 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Database Setup

**Option A: Neon PostgreSQL (Recommended)**

```bash
# 1. Go to https://neon.tech and create account
# 2. Create new project: vtchat-dev
# 3. Copy database URL from dashboard
# 4. Add to your .env.local file

DATABASE_URL=postgresql://username:password@hostname.neon.tech/dbname?sslmode=require
```

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb vtchat_dev

# Connection string
DATABASE_URL=postgresql://yourusername@localhost:5432/vtchat_dev
```

**Option C: Neon PostgreSQL**

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it as your `DATABASE_URL`

#### 3. AI Service API Keys (BYOK Required)

**OpenAI API Key**

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key starting with `sk-`

**Anthropic API Key**

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create a new API key
3. Copy the key starting with `sk-ant-`

**Google Gemini API Key**

1. Go to [ai.google.dev/api](https://ai.google.dev/api)
2. Get an API key
3. Copy the key starting with `AIza`

Note: A Gemini API key is required for the Image Generation feature in chat. Without a key, the Generate button shows a helpful tooltip and stays in a limited state.

**Fireworks AI API Key**

1. Go to [app.fireworks.ai/settings/users/api-keys](https://app.fireworks.ai/settings/users/api-keys)
2. Create a new API key
3. Copy the key starting with `fw-`

### Optional for Enhanced Features

#### Social Authentication

**GitHub OAuth**

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Create a new OAuth App
3. Authorization callback URL: `process.env.NEXT_PUBLIC_BASE_URL/api/auth/callback/github`
4. Copy Client ID and Client Secret

**Google OAuth**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Authorized redirect URIs: `process.env.NEXT_PUBLIC_BASE_URL/api/auth/callback/google`
6. Copy Client ID and Client Secret

## 🏃‍♂️ Running the Development Server

### Start the Application

```bash
# Start development server with Bun (recommended)
bun dev

# Or with npm/pnpm
npm run dev
pnpm dev
```

### Access the Application

- **Main App**: [process.env.NEXT_PUBLIC_BASE_URL](process.env.NEXT_PUBLIC_BASE_URL)
- **Chat Interface**: [process.env.NEXT_PUBLIC_BASE_URL/chat](process.env.NEXT_PUBLIC_BASE_URL/chat)
- **Health Check**: [process.env.NEXT_PUBLIC_BASE_URL/api/health](process.env.NEXT_PUBLIC_BASE_URL/api/health)

## 🧪 Testing Your Setup

### 1. Basic Application Test

- [ ] App loads at `process.env.NEXT_PUBLIC_BASE_URL`
- [ ] No console errors
- [ ] Health check returns `{"status": "ok"}`

### 2. Authentication Test

- [ ] Sign up/login forms work
- [ ] Social authentication works (if configured)
- [ ] User session persists

### 3. Database Test

- [ ] User registration saves to database
- [ ] Database connection is stable
- [ ] No database errors in logs

### 4. AI Chat Test

- [ ] Chat interface loads
- [ ] Model selection dropdown works
- [ ] API key validation works
- [ ] Chat responses generate (if API keys configured)

## 🔧 Development Workflow

### Daily Development

```bash
# Start development
bun dev

# Make changes to code
# Files auto-reload on save

# Run tests (if available)
bun test

# Build for production testing
bun run build

# Preview production build
bun start
```

### Database Migrations

```bash
# If you make database schema changes
# Migration files are in: apps/web/migration_better_auth.sql
# These run automatically on app start
```

### Package Management

```bash
# Add new dependencies
bun add package-name

# Add dev dependencies
bun add -d package-name

# Update dependencies
bun update

# Clean install
rm -rf node_modules && bun install
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if database is running
pg_isready -h localhost

# Check connection string format
# Should be: postgresql://user:password@host:port/database
```

#### Environment Variables Not Loading

```bash
# Ensure file is named correctly
apps/web/.env.local

# Check for syntax errors
# No spaces around = sign
# No quotes unless needed for special characters
```

#### API Key Issues

```bash
# Verify API keys are correct
# Check for extra spaces or characters
# Test keys directly with provider's API
```

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 bun dev
```

### Debug Logs

```bash
# Enable debug logging
LOG_LEVEL=debug bun dev

# Check console for errors
# Check browser dev tools
# Check terminal output
```

## 📁 File Structure for Development

```
vtchat/
├── apps/web/
│   ├── .env.local              # ← Your local environment file
│   ├── .env.example            # ← Template to copy from
│   ├── app/                    # Next.js app directory
│   └── ...
├── packages/                   # Shared packages
├── docs/                      # Documentation
└── ...
```

## 🔄 Syncing with Production

### Environment Parity

Keep your local environment similar to production:

```bash
# Use similar Node.js version
node --version  # Should match Fly.io (Node 20+)

# Use same package manager
bun --version   # Preferred for this project

# Test production builds locally
bun run build && bun start
```

### Database Syncing

```bash
# If using Neon database for development
# Use Neon console or psql with connection string

# If using local database, occasionally sync schema
# with production migrations
```

## ✅ Development Checklist

### Initial Setup

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment file created
- [ ] Database connected
- [ ] App runs locally

### Feature Development

- [ ] Authentication works
- [ ] AI chat functionality works
- [ ] Database operations work
- [ ] All features tested locally

### Before Committing

- [ ] Code builds successfully
- [ ] No console errors
- [ ] Environment secrets not committed
- [ ] Tests pass (if available)

---

**🎉 Success!** Your local development environment is now set up and ready for VT development!

**Next**: Start building features, test locally, then deploy to Fly.io following the deployment guide.

## 🚀 Deployment

Once your local development is working:

```bash
# Deploy to development environment
./deploy-fly.sh --dev

# Deploy to production environment
./deploy-fly.sh --prod
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.
