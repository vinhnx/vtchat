# Local Development Environment Setup

This guide covers both **Docker setup** (recommended) and **manual setup** for VT development.

## Docker Setup (Recommended - 5 minutes)

### Prerequisites

- Docker & Docker Compose installed
- At least one AI API key

### Quick Start

1. **Clone repository**:
   ```bash
   git clone https://github.com/vinhnx/vtchat.git
   cd vtchat
   ```

2. **Setup environment**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Configure required variables**:
   ```bash
   # Generate authentication secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy output to BETTER_AUTH_SECRET in .env.local

   # Add your AI API key (choose one)
   OPENAI_API_KEY=sk-your-key-here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   # OR
   GEMINI_API_KEY=your-key-here
   ```

4. **Validate & run**:
   ```bash
   ./validate-setup.sh
   docker-compose up --build
   ```

5. **Access VT**: http://localhost:3000

### What Docker Setup Includes

- PostgreSQL 15 database with automatic initialization
- VT application with hot reload development
- All dependencies pre-installed
- Health checks and proper startup sequencing
- Volume persistence for database data

### Docker Commands

```bash
# Start services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs vtchat
docker-compose logs postgres

# Stop services
docker-compose down

# Reset everything (deletes database)
docker-compose down -v
```

---

## Manual Setup (Advanced)

For developers who prefer manual control over their environment.

### Prerequisites

- **Bun** v1.1.19+ (primary runtime)
- **Node.js** 18+ (for compatibility)
- **PostgreSQL** 15+ (local or cloud)
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/vinhnx/vtchat.git
cd vtchat
bun install
```

### 2. Database Setup

#### Option A: Local PostgreSQL (macOS)

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb vtchat_dev

# Connection string for .env.local
DATABASE_URL=postgresql://yourusername@localhost:5432/vtchat_dev
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d --name vtchat-postgres \
  -e POSTGRES_DB=vtchat_dev \
  -e POSTGRES_USER=vtchat \
  -e POSTGRES_PASSWORD=vtchat_password \
  -p 5432:5432 postgres:15-alpine

# Connection string for .env.local
DATABASE_URL=postgresql://vtchat:vtchat_password@localhost:5432/vtchat_dev
```

#### Option C: Cloud PostgreSQL (Neon, Supabase, etc.)

```bash
# Use your cloud database URL
DATABASE_URL=postgresql://user:pass@host:port/database
```

### 3. Environment Configuration

```bash
cp apps/web/.env.example apps/web/.env.local
```

**Required variables** (edit `apps/web/.env.local`):

```bash
# Database
DATABASE_URL=postgresql://vtchat:vtchat_password@localhost:5432/vtchat_dev

# Authentication
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Provider (at least one required)
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OR
GEMINI_API_KEY=your-key-here
```

### 4. Database Migration

```bash
cd apps/web
bun run generate
```

### 5. Start Development

```bash
# From project root
bun dev

# Or from apps/web directory
cd apps/web
bun dev
```

---

## Development Workflow

### Daily Development

```bash
# Start development server
bun dev

# Code changes auto-reload
# Edit files → see changes instantly
```

### Database Changes

```bash
# After schema changes
cd apps/web
bun run generate

# Restart server if needed
bun dev
```

### Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run fmt

# Check formatting
bun run fmt:check
```

### Testing

```bash
# Run all tests
bun test

# Run with coverage
bun test:coverage

# Watch mode
bun test --watch
```

---

## Getting API Keys

### AI Providers

#### OpenAI

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

#### Anthropic

1. Visit [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create new API key
3. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

#### Google Gemini

1. Visit [ai.google.dev/api](https://ai.google.dev/api)
2. Get API key
3. Add to `.env.local`: `GEMINI_API_KEY=...`

### Social Authentication (Optional)

#### GitHub OAuth

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Create OAuth App
3. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

#### Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
4. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## Troubleshooting

### Setup Validation

Run the validation script first:

```bash
./validate-setup.sh
```

This checks for common configuration issues.

### Docker Issues

```bash
# Check Docker status
docker --version
docker-compose --version

# Clear Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Check container logs
docker-compose logs vtchat
docker-compose logs postgres
```

### Build Issues

```bash
# Clear all caches
rm -rf node_modules apps/web/node_modules apps/web/.next .next

# Reinstall dependencies
bun install

# Clear Bun cache
bun pm cache rm
```

### Database Issues

```bash
# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# Reset Docker database
docker-compose down -v
docker-compose up --build
```

### Authentication Issues

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Clear browser data
# Hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Linux/Windows)
```

### Port Conflicts

If ports 3000 or 5432 are in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :5432

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
# ports:
#   - "3001:3000"  # Change VT port
#   - "5433:5432"  # Change PostgreSQL port
```

---

## Additional Resources

- **[Main README](../README.md)** - Quick overview
- **[Docker Guide](../DOCKER-README.md)** - Detailed Docker instructions
- **[Architecture](ARCHITECTURE.md)** - System design
- **[Features](FEATURES.md)** - Complete feature list
- **[Security](SECURITY.md)** - Security implementation
