#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Fly.io Production Deployment Script${NC}"
echo "=============================="

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
else
    print_error "Production deployment failed!"
    exit 1
fi

echo ""
print_status "✨ Deployment script completed!"
