# Self-Hosting VT - Complete Guide

This guide walks you through hosting VT on your own infrastructure with minimal configuration.

## Quick Overview

VT can be self-hosted in **5 minutes** using Docker, or manually if you prefer more control. You need:

- Docker (recommended) OR Node.js/Bun + PostgreSQL
- One AI API key (OpenAI, Anthropic, or Gemini)
- Basic command line knowledge

## Method 1: Docker (Recommended)

### What You'll Get

- Full VT application with all features
- PostgreSQL database (auto-configured)
- Hot reload development
- No complex setup required

### Step-by-Step Setup

1. **Download VT**:
   ```bash
   git clone https://github.com/vinhnx/vtchat.git
   cd vtchat
   ```

2. **Prepare configuration**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Get your AI API key**:
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic**: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   - **Gemini**: [ai.google.dev/api](https://ai.google.dev/api)

4. **Configure environment**:
   ```bash
   # Generate authentication secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Edit apps/web/.env.local and add:
   BETTER_AUTH_SECRET=<output-from-above>
   OPENAI_API_KEY=sk-your-key-here  # or ANTHROPIC_API_KEY or GEMINI_API_KEY
   ```

5. **Start VT**:
   ```bash
   # Optional: validate your setup
   ./validate-setup.sh

   # Start everything
   docker-compose up --build
   ```

6. **Access your VT instance**:
   - Open http://localhost:3000 in your browser
   - Create an account and start chatting!

### Stopping VT

```bash
# Stop containers
docker-compose down

# Stop and delete database (loses all data)
docker-compose down -v
```

## Method 2: Manual Setup

For advanced users who want full control.

### Prerequisites

- **Bun** (JavaScript runtime): `curl -fsSL https://bun.sh/install | bash`
- **PostgreSQL**: Local install or cloud service

### Database Setup

**Option A: Local PostgreSQL**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb vtchat_dev

# Linux
sudo apt install postgresql
sudo -u postgres createdb vtchat_dev
```

**Option B: Docker PostgreSQL**

```bash
docker run -d --name vtchat-postgres \
  -e POSTGRES_DB=vtchat_dev \
  -e POSTGRES_USER=vtchat \
  -e POSTGRES_PASSWORD=vtchat_password \
  -p 5432:5432 postgres:15-alpine
```

### Application Setup

1. **Install dependencies**:
   ```bash
   git clone https://github.com/vinhnx/vtchat.git
   cd vtchat
   bun install
   ```

2. **Configure environment**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local

   # Edit with your values:
   DATABASE_URL=postgresql://vtchat:vtchat_password@localhost:5432/vtchat_dev
   BETTER_AUTH_SECRET=<32-char-secret>
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Setup database**:
   ```bash
   cd apps/web
   bun run generate
   ```

4. **Start VT**:
   ```bash
   bun dev
   ```

## Configuration Options

### Minimal Configuration (Required)

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:port/database

# Authentication
BETTER_AUTH_SECRET=your-32-char-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI (choose one)
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OR
GEMINI_API_KEY=your-key-here
```

### Optional Features

```bash
# Social login
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Payment processing (Creem.io)
CREEM_API_KEY=creem_test_your-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
CREEM_PRODUCT_ID=your-product-id

# Additional AI providers
FIREWORKS_API_KEY=fw-your-key-here
```

## Production Deployment

### Using Fly.io (Recommended)

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy**:
   ```bash
   fly launch
   fly deploy
   ```

### Using Docker in Production

```bash
# Build production image
docker build -f Dockerfile -t vtchat .

# Run with production database
docker run -d \
  --name vtchat-prod \
  -p 3000:3000 \
  --env-file .env.production \
  vtchat
```

## Common Issues & Solutions

### "lobe-icons package does not load"

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
bun install
```

### "OAuth redirect URI errors"

Configure these redirect URIs in your OAuth provider:

- **GitHub**: `http://localhost:3000/api/auth/callback/github`
- **Google**: `http://localhost:3000/api/auth/callback/google`

### "Database connection failed"

```bash
# Check PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v && docker-compose up --build
```

### "Build fails"

```bash
# Clear all caches
docker system prune -f
rm -rf node_modules apps/web/.next

# Rebuild
docker-compose build --no-cache
```

## System Requirements

### Minimum (Development)

- **RAM**: 2GB
- **CPU**: 1 core
- **Storage**: 5GB
- **Network**: Basic internet

### Recommended (Production)

- **RAM**: 4GB
- **CPU**: 2 cores
- **Storage**: 20GB SSD
- **Network**: 100Mbps

## Security Considerations

### For Production

- Use strong `BETTER_AUTH_SECRET` (32+ characters)
- Enable HTTPS with proper SSL certificates
- Configure firewall rules
- Use managed PostgreSQL (Neon, Supabase, etc.)
- Regular security updates
- Monitor logs for suspicious activity

### Environment Variables

- Never commit `.env` files to version control
- Use different secrets for development/production
- Rotate API keys regularly
- Use environment-specific configurations

## Support

### Community Resources

- **GitHub Issues**: [github.com/vinhnx/vtchat/issues](https://github.com/vinhnx/vtchat/issues)
- **Discussions**: [github.com/vinhnx/vtchat/discussions](https://github.com/vinhnx/vtchat/discussions)
- **Documentation**: [docs/](../README.md)

### Getting Help

1. Check this guide first
2. Run `./validate-setup.sh` for configuration issues
3. Search existing GitHub issues
4. Create new issue with:
   - Your setup method (Docker/manual)
   - Error messages/logs
   - Your environment (OS, Docker version, etc.)

## Success!

Once running, VT provides:

- Multiple AI model support (GPT-4, Claude, Gemini, etc.)
- Document processing and analysis
- Web search integration
- Chart generation
- AI image editing (Nano Banana)
- Subscription management (optional)
- Secure authentication
- Responsive design

Enjoy your self-hosted VT instance!
