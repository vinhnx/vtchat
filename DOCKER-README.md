# VTChat - Docker Compose Setup for Local Development

This guide helps you run VTChat locally using Docker Compose with minimal configuration.

## 🚀 Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed
- At least one AI API key (OpenAI, Anthropic, or Google Gemini)

### 1. Clone and Setup

```bash
git clone https://github.com/vinhnx/vtchat.git
cd vtchat
```

### 2. Configure Environment Variables

```bash
# Copy the simplified environment file
cp apps/web/.env.example apps/web/.env.local

# Edit with your AI API key (required)
# At minimum, you need:
# - BETTER_AUTH_SECRET (generate a random 32-char key)
# - At least one AI API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY)
```

### 3. Generate Better Auth Secret

```bash
# Generate a secure 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output to BETTER_AUTH_SECRET in your .env.local
```

### 4. Validate Setup (Optional but Recommended)

```bash
# Run the setup validator
./validate-setup.sh
```

### 5. Start with Docker Compose

```bash
# Start PostgreSQL + VTChat app
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 6. Access the Application

- **App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🔧 Manual Setup (Without Docker)

If you prefer not to use Docker:

### Local PostgreSQL Setup

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb vtchat_dev

# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://yourusername@localhost:5432/vtchat_dev
```

### Install Dependencies & Run

```bash
bun install
cd apps/web
bun dev
```

## 📋 Minimal Required Environment Variables

For basic functionality without Creem payments:

```bash
# Required
DATABASE_URL=postgresql://vtchat:vtchat_password@localhost:5432/vtchat_dev
BETTER_AUTH_SECRET=your-32-char-random-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# At least one AI provider
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OR
GEMINI_API_KEY=your-key-here
```

## 🐛 Troubleshooting

### Setup Validation

Before troubleshooting, run the setup validator:

```bash
./validate-setup.sh
```

This will check for common configuration issues.

### Lobe-icons Issue

If you encounter lobe-icons build issues:

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/web/node_modules package-lock.json
bun install
```

### OAuth Redirect URIs

For social authentication, use these redirect URIs:

- **GitHub**: `http://localhost:3000/api/auth/callback/github`
- **Google**: `http://localhost:3000/api/auth/callback/google`

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs vtchat
```

### Build Issues

If the Docker build fails:

```bash
# Clear Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache
```

### Port Conflicts

If port 5432 or 3000 are already in use:

```bash
# Stop conflicting services
docker-compose down

# Or change ports in docker-compose.yml
# ports:
#   - "5433:5432"  # Change host port for PostgreSQL
#   - "3001:3000"  # Change host port for VTChat
```

## 🛑 Stopping Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

## 📁 Files Overview

- `docker-compose.yml` - Container orchestration
- `Dockerfile.dev` - Development container setup
- `apps/web/.env.example` - Environment template
- `scripts/init-db.sql` - Database initialization
