#!/bin/bash

# Environment Configuration Verification Script for VTChat Railway Deployment

echo "🔍 VTChat Railway Deployment Configuration Verification"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📁 Checking configuration files..."

# Check Dockerfile
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile exists"
    if grep -q "HOSTNAME=\"0.0.0.0\"" Dockerfile; then
        echo "✅ Dockerfile has proper hostname configuration"
    else
        echo "⚠️  Warning: Dockerfile may need HOSTNAME=0.0.0.0 for Railway"
    fi
else
    echo "❌ Dockerfile missing"
fi

# Check Railway configuration
if [ -f "railway.toml" ]; then
    echo "✅ railway.toml exists"
else
    echo "⚠️  railway.toml missing"
fi

if [ -f "railway.json" ]; then
    echo "✅ railway.json exists (alternative format)"
fi

# Check environment files
echo ""
echo "📄 Checking environment files..."

if [ -f "apps/web/.env.local" ]; then
    echo "✅ Local development env file: apps/web/.env.local"
    if grep -q "localhost:3000" apps/web/.env.local; then
        echo "✅ Local env uses localhost URLs"
    fi
else
    echo "❌ Local development env file missing: apps/web/.env.local"
fi

if [ -f ".env.railway.development" ]; then
    echo "✅ Railway development template: .env.railway.development"
    if grep -q "vtchat-web-development.up.railway.app" .env.railway.development; then
        echo "✅ Development env uses correct URLs"
    fi
else
    echo "❌ Railway development env template missing"
fi

if [ -f ".env.railway.production" ]; then
    echo "✅ Railway production template: .env.railway.production"
    if grep -q "vtchat-web-production.up.railway.app" .env.railway.production; then
        echo "✅ Production env uses correct URLs"
    fi
else
    echo "❌ Railway production env template missing"
fi

# Check for required environment variables in templates
echo ""
echo "🔧 Checking critical environment variables..."

REQUIRED_VARS=(
    "BASE_URL"
    "BETTER_AUTH_URL"
    "NEXT_PUBLIC_BASE_URL"
    "NEXT_PUBLIC_APP_URL"
    "BETTER_AUTH_ENV"
    "CREEM_ENVIRONMENT"
)

for env_file in ".env.railway.development" ".env.railway.production"; do
    if [ -f "$env_file" ]; then
        echo "Checking $env_file:"
        for var in "${REQUIRED_VARS[@]}"; do
            if grep -q "^$var=" "$env_file"; then
                echo "  ✅ $var"
            else
                echo "  ❌ $var missing"
            fi
        done
    fi
done

# Summary
echo ""
echo "📋 Summary"
echo "=========="
echo "Environment URLs configured:"
echo "  Local:       http://localhost:3000"
echo "  Development: https://vtchat-web-development.up.railway.app"
echo "  Production:  https://vtchat-web-production.up.railway.app"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway dashboard/CLI using templates"
echo "2. Deploy to development environment first for testing"
echo "3. Update production secrets before production deployment"
echo "4. Test authentication and payment flows in each environment"
echo ""
echo "📖 Full guide: docs/railway-deployment-configuration.md"
