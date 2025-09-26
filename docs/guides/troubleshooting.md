# VT Troubleshooting Guide

Quick solutions to common VT setup and runtime issues.

## Setup Issues

### Docker Setup Fails

**Error**: `docker-compose: command not found`

```bash
# Install Docker Desktop (macOS/Windows)
# OR install Docker Compose separately
brew install docker-compose  # macOS
sudo apt install docker-compose  # Linux
```

**Error**: `validate-setup.sh: command not found`

```bash
chmod +x validate-setup.sh
./validate-setup.sh
```

**Error**: `BETTER_AUTH_SECRET is not set`

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to BETTER_AUTH_SECRET in apps/web/.env.local
```

### Manual Setup Fails

**Error**: `bun: command not found`

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
# Restart terminal or run: source ~/.bashrc
```

**Error**: `psql: command not found`

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Runtime Issues

### VT Won't Start

**Error**: `Port 3000 already in use`

```bash
# Find process using port
lsof -i :3000
kill -9 <PID>

# OR change port in docker-compose.yml
# ports: ["3001:3000"]
```

**Error**: `Database connection failed`

```bash
# Check PostgreSQL status
docker-compose ps

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v && docker-compose up -d postgres
```

### Authentication Issues

**Error**: `Invalid redirect URI`
Configure OAuth provider with correct callback URLs:

- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

**Error**: `Session expired`

```bash
# Clear browser cookies/localStorage
# Hard refresh: Cmd+Shift+R (macOS) or Ctrl+F5 (Windows)
```

### AI Chat Issues

**Error**: `API key invalid`

```bash
# Check API key format
# OpenAI: starts with sk-
# Anthropic: starts with sk-ant-
# Gemini: alphanumeric string
```

**Error**: `Model not available`

```bash
# Check if you have access to the model
# Some models require special access or paid plans
```

## Build Issues

### lobe-icons Package Issues

```bash
# Clear all caches
rm -rf node_modules apps/web/node_modules package-lock.json bun.lock

# Reinstall
bun install

# If still failing, try:
npm cache clean --force
bun pm cache rm
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf apps/web/.next apps/web/tsconfig.tsbuildinfo

# Regenerate types
cd apps/web && bun run typegen

# Restart dev server
bun dev
```

### Database Migration Issues

```bash
# Regenerate schema
cd apps/web
bun run generate

# Reset database (loses data)
docker-compose down -v
docker-compose up --build
```

## Network Issues

### Can't Access http://localhost:3000

**Docker setup**:

```bash
# Check container status
docker-compose ps

# View app logs
docker-compose logs vtchat

# Restart services
docker-compose restart
```

**Manual setup**:

```bash
# Check if dev server is running
ps aux | grep "next dev"

# Restart dev server
bun dev
```

### CORS Errors

```bash
# Check NEXT_PUBLIC_BASE_URL in .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Clear browser cache
# Hard refresh: Cmd+Shift+R
```

## Performance Issues

### Slow Startup

```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Use Turbopack for faster builds
bun dev --turbopack
```

### High Memory Usage

```bash
# Monitor Docker containers
docker stats

# Limit container resources in docker-compose.yml
# deploy:
#   resources:
#     limits:
#       memory: 2G
#       cpus: '1.0'
```

## Diagnostic Commands

### Check System Status

```bash
# Docker containers
docker-compose ps

# Running processes
ps aux | grep -E "(node|bun|next)"

# Port usage
lsof -i :3000
lsof -i :5432

# Disk space
df -h
```

### View Logs

```bash
# Docker logs
docker-compose logs vtchat
docker-compose logs postgres

# Application logs (manual setup)
tail -f apps/web/logs/*.log
```

### Environment Check

```bash
# Validate setup
./validate-setup.sh

# Check Node/Bun version
node --version
bun --version

# Check environment variables
cd apps/web && cat .env.local | grep -v PASSWORD
```

## Emergency Recovery

### Complete Reset (⚠️ Loses all data)

```bash
# Stop everything
docker-compose down -v

# Clear all caches
rm -rf node_modules apps/web/node_modules apps/web/.next .next

# Clean Docker
docker system prune -f
docker volume prune -f

# Restart fresh
bun install
docker-compose up --build
```

### Backup Database (Before reset)

```bash
# Export data
docker exec vtchat-postgres pg_dump -U vtchat vtchat_dev > backup.sql

# Import later
docker exec -i vtchat-postgres psql -U vtchat vtchat_dev < backup.sql
```

## Getting Help

### Quick Checks

1. Run `./validate-setup.sh`
2. Check `docker-compose ps`
3. View logs with `docker-compose logs`
4. Clear browser cache and hard refresh

### Community Support

- **GitHub Issues**: [github.com/vinhnx/vtchat/issues](https://github.com/vinhnx/vtchat/issues)
- **Discussions**: [github.com/vinhnx/vtchat/discussions](https://github.com/vinhnx/vtchat/discussions)

### When Reporting Issues

Include:

- Your setup method (Docker/manual)
- OS and versions (`docker --version`, `bun --version`)
- Full error messages
- Steps to reproduce
- `docker-compose logs` output
