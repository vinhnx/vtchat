#!/bin/bash

# Railway Environment Setup Helper for VTChat
# This script helps set up environment variables for Railway deployment

set -e

echo "🚄 VTChat Railway Environment Setup Helper"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ You are not logged in to Railway. Please run:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is installed and you are logged in"
echo ""

# Ask which environment to configure
echo "Which environment would you like to configure?"
echo "1) Development (https://vtchat-web-development.up.railway.app)"
echo "2) Production (https://vtchat-web-production.up.railway.app)"
echo -n "Enter your choice (1 or 2): "
read choice

case $choice in
    1)
        ENV="development"
        ENV_FILE=".env.railway.development"
        BASE_URL="https://vtchat-web-development.up.railway.app"
        ;;
    2)
        ENV="production"
        ENV_FILE=".env.railway.production"
        BASE_URL="https://vtchat-web-production.up.railway.app"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🔧 Configuring $ENV environment..."
echo "📄 Using template: $ENV_FILE"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Template file $ENV_FILE not found!"
    exit 1
fi

# Switch to the environment
echo "📡 Switching to $ENV environment..."
railway environment $ENV

# Function to set a variable from the env file
set_variable() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')

    if [ ! -z "$var_value" ]; then
        echo "Setting $var_name..."
        railway variables --set "$var_name=$var_value"
    else
        echo "⚠️  Warning: $var_name not found in $ENV_FILE"
    fi
}

# Set critical environment variables
echo ""
echo "🔑 Setting environment variables..."

# URL variables
set_variable "BASE_URL"
set_variable "BETTER_AUTH_URL"
set_variable "NEXT_PUBLIC_BASE_URL"
set_variable "NEXT_PUBLIC_APP_URL"
set_variable "NEXT_PUBLIC_COMMON_URL"
set_variable "NEXT_PUBLIC_BETTER_AUTH_URL"

# Environment configuration
set_variable "BETTER_AUTH_ENV"
set_variable "CREEM_ENVIRONMENT"
set_variable "LOG_LEVEL"

# Application configuration
set_variable "PRODUCT_NAME"
set_variable "PRODUCT_DESCRIPTION"
set_variable "VT_PLUS_PRICE"
set_variable "PRICING_CURRENCY"
set_variable "PRICING_INTERVAL"
set_variable "FREE_TIER_DAILY_LIMIT"

# External APIs
set_variable "JINA_API_KEY"

# Social auth
set_variable "GITHUB_CLIENT_ID"
set_variable "GITHUB_CLIENT_SECRET"
set_variable "GOOGLE_CLIENT_ID"
set_variable "GOOGLE_CLIENT_SECRET"

# Payment (Creem.io)
set_variable "CREEM_API_KEY"
set_variable "CREEM_WEBHOOK_SECRET"
set_variable "CREEM_PRODUCT_ID"

# Redis/KV
set_variable "KV_URL"
set_variable "KV_REST_API_URL"
set_variable "KV_REST_API_TOKEN"
set_variable "KV_REST_API_READ_ONLY_TOKEN"
set_variable "REDIS_URL"

# Database
set_variable "DATABASE_URL"
set_variable "NEON_PROJECT_ID"
set_variable "NEON_API_KEY"

# Auth secret
set_variable "BETTER_AUTH_SECRET"

echo ""
echo "✅ Environment variables have been set for $ENV environment!"
echo ""
echo "🚀 Next steps:"
echo "1. Verify the variables in Railway dashboard"
echo "2. Deploy your application: railway up"
echo "3. Check the deployment logs for any issues"
echo "4. Test the application at: $BASE_URL"

if [ "$ENV" = "production" ]; then
    echo ""
    echo "⚠️  PRODUCTION ENVIRONMENT NOTES:"
    echo "   - Make sure to update production secrets (database, auth, payment keys)"
    echo "   - Verify all URLs are correct"
    echo "   - Test thoroughly before going live"
fi

echo ""
echo "📖 For more details, see: docs/railway-deployment-configuration.md"
