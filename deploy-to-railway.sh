#!/bin/bash
# Railway Environment Setup and Deployment Script
# Usage: ./deploy-to-railway.sh [development|production]
#
# Status:
# ✅ Development: DEPLOYED and RUNNING at https://vtchat-web-development.up.railway.app
# 🔄 Production: Environment variables set, ready for deployment
#
# Last Updated: June 16, 2025

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 [development|production]"
    echo "Example: $0 development"
    exit 1
fi

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Error: Environment must be 'development' or 'production'"
    exit 1
fi

echo "🚀 Setting up Railway $ENVIRONMENT environment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Install it with: npm install -g @railway/cli"
    exit 1
fi

# Environment file
ENV_FILE=".env.railway.$ENVIRONMENT"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found"
    exit 1
fi

echo "📋 Setting environment variables for $ENVIRONMENT..."

# Function to set a variable if it doesn't contain TODO or placeholder
set_variable() {
    local var_name="$1"
    local var_value="$2"

    # Skip TODO entries and placeholders
    if [[ "$var_value" =~ TODO ]] || [[ "$var_value" =~ your_.*_here ]] || [[ -z "$var_value" ]]; then
        echo "⚠️  Skipping $var_name (contains TODO, placeholder, or empty)"
        return
    fi

    echo "Setting $var_name..."
    # Use correct Railway CLI syntax
    railway variables --set "$var_name=$var_value"
}

# Read the .env file and set variables
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
        continue
    fi

    # Extract variable name and value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        set_variable "$var_name" "$var_value"
    fi
done < "$ENV_FILE"

echo "✅ Environment variables set for $ENVIRONMENT"

# Switch to the correct environment
echo "🔄 Switching to $ENVIRONMENT environment..."
railway environment "$ENVIRONMENT"

# Ask if user wants to deploy
echo ""
read -p "🚀 Do you want to deploy to $ENVIRONMENT now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to $ENVIRONMENT..."
    railway up

    echo "✅ Deployment completed!"
    echo "🌐 Your app should be available at:"

    if [ "$ENVIRONMENT" = "development" ]; then
        echo "   https://vtchat-web-development.up.railway.app"
    else
        echo "   https://vtchat-web-production.up.railway.app"
    fi

    echo ""
    echo "📊 Check deployment status:"
    echo "   railway logs"
    echo "   railway status"
else
    echo "⏸️  Environment variables set. Deploy later with:"
    echo "   railway environment $ENVIRONMENT"
    echo "   railway up"
fi
