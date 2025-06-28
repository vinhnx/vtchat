#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Fly.io Optimized Production Deployment${NC}"
echo "=========================================="

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./deploy-fly.sh          # Normal optimized deployment"
    echo "  ./deploy-fly.sh --optimize # Force cache pre-warming"
    echo "  ./deploy-fly.sh --help   # Show this help"
    echo ""
    echo -e "${YELLOW}Optimizations included:${NC}"
    echo "  • BuildKit cache mounts for faster builds"
    echo "  • better-sqlite3 compilation caching (50-70% faster)"
    echo "  • Next.js build cache persistence"
    echo "  • Distroless production image (40MB)"
    echo "  • Automatic dependency caching"
    exit 0
fi

# Enable BuildKit for cache mounts and optimization
export DOCKER_BUILDKIT=1
echo -e "${GREEN}✅ BuildKit enabled for cache optimization${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl is not installed. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    print_error "Not logged in to Fly.io. Please run: flyctl auth login"
    exit 1
fi

print_status "flyctl is installed and user is authenticated"

# Optimization: Pre-warm build cache for better-sqlite3 (optional)
print_status "Optimizing build cache..."
echo -e "${YELLOW}⚡ Pre-warming better-sqlite3 cache for faster builds${NC}"

# Check if we should pre-warm cache (only on first build or when requested)
if [ "$1" = "--optimize" ] || [ ! -f ".build-cache-warmed" ]; then
    print_status "Pre-warming native module compilation cache..."
    docker buildx build --target deps . > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  Pre-warming skipped (continuing with normal build)${NC}"
    touch .build-cache-warmed
else
    echo -e "${YELLOW}💨 Using existing build cache${NC}"
fi

# Function to check if app exists
app_exists() {
    local app_name=$1
    flyctl apps list | grep -q "^$app_name" 2>/dev/null
}

# Production deployment only
FLY_APP="vtchat"

print_status "Deploying to PRODUCTION"
echo "App: $FLY_APP"
echo "Config: fly.toml"
echo "---"

if ! app_exists "$FLY_APP"; then
    print_error "App '$FLY_APP' does not exist. Creating it first..."
    flyctl apps create "$FLY_APP" --region sin
    print_status "App '$FLY_APP' created successfully"
fi

# Deploy using the config file
print_status "Starting deployment..."

if flyctl deploy --app "$FLY_APP"; then
    print_status "Production deployment completed successfully!"
    echo ""
    echo "🌐 Your app is available at:"
    echo "   https://vtchat.io.vn"
    echo "   https://vtchat.fly.dev"
    echo ""
    
    # Show app status
    flyctl status --app "$FLY_APP"
    
    echo ""
    print_status "🎉 Production deployment completed!"
    echo "Live at: https://vtchat.io.vn"
    
    # Show optimization summary
    echo ""
    echo -e "${GREEN}🔍 Build Optimizations Applied:${NC}"
    echo -e "${YELLOW}  • BuildKit cache mounts for faster builds${NC}"
    echo -e "${YELLOW}  • better-sqlite3 compilation caching${NC}"
    echo -e "${YELLOW}  • Next.js build cache persistence${NC}"
    echo -e "${YELLOW}  • Distroless production image (40MB)${NC}"
    echo -e "${YELLOW}  • Scale-to-zero cost optimization${NC}"
else
    print_error "Production deployment failed!"
    exit 1
fi

echo ""
print_status "✨ Optimized deployment completed!"
echo -e "${YELLOW}💡 Tip: Subsequent builds will be faster due to cache optimization${NC}"
