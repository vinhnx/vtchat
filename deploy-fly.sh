#!/bin/bash

# Single Fly.io Deployment Script
# Sets secrets and deploys in one command

set -e

# Default values
ENV_FILE=""
FORCE_CLEANUP=false
ENVIRONMENT="dev"
FLY_CONFIG="fly.toml"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            FORCE_CLEANUP=true
            shift
            ;;
        --prod|--production)
            ENVIRONMENT="prod"
            FLY_CONFIG="fly.production.toml"
            ENV_FILE="${ENV_FILE:-apps/web/.env.production}"
            shift
            ;;
        --dev|--development)
            ENVIRONMENT="dev"
            FLY_CONFIG="fly.toml"
            ENV_FILE="${ENV_FILE:-apps/web/.env.development}"
            shift
            ;;
        -*)
            echo "❌ Unknown option: $1"
            echo "Usage: $0 [--clean] [--dev|--prod] [env-file-path]"
            exit 1
            ;;
        *)
            ENV_FILE="$1"
            shift
            ;;
    esac
done

# Set default env file based on environment if not specified
if [[ -z "$ENV_FILE" ]]; then
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        ENV_FILE="apps/web/.env.production"
    else
        ENV_FILE="apps/web/.env.development"
    fi
fi

echo "🚀 Starting Fly.io deployment for vtchat..."
echo "📋 Using config: $FLY_CONFIG"
echo "🔧 Processing environment from: $ENV_FILE"

# Check if env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Error: Environment file '$ENV_FILE' not found!"
    echo "Usage: $0 [--clean] [--dev|--prod] [env-file-path]"
    echo "Expected files:"
    echo "  Development: apps/web/.env.development"
    echo "  Production:  apps/web/.env.production"
    exit 1
fi

# Process env file for secrets only
secrets=()
while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
        value=$(echo "$value" | sed 's|https://vtchat-web-development\.up\.railway\.app|https://vtchat-dev.fly.dev|g')

        # Only process secrets (not public env vars)
        if [[ ! "$key" =~ ^NEXT_PUBLIC_ ]] && [[ ! "$key" =~ ^(BASE_URL|BETTER_AUTH_URL|CREEM_ENVIRONMENT|BETTER_AUTH_ENV|PRODUCT_NAME|PRODUCT_DESCRIPTION|PRICING_CURRENCY|PRICING_INTERVAL)$ ]]; then
            secrets+=("$key=$value")
        fi
    fi
done < "$ENV_FILE"

# Set secrets if any exist
if [[ ${#secrets[@]} -gt 0 ]]; then
    echo "🔒 Setting secrets..."

    # Clear existing secrets if requested
    if [[ $FORCE_CLEANUP == true ]]; then
        existing_secrets=$(fly secrets list --json 2>/dev/null || echo "[]")
        if [[ "$existing_secrets" != "[]" && "$existing_secrets" != "" ]]; then
            existing_keys=$(echo "$existing_secrets" | jq -r '.[].Name' | tr '\n' ' ')
            if [[ -n "$existing_keys" ]]; then
                echo "🗑️  Clearing existing secrets..."
                fly secrets unset $existing_keys
            fi
        fi
    fi

    # Set new secrets
    cmd="fly secrets set"
    for secret in "${secrets[@]}"; do
        cmd="$cmd \"$secret\""
    done
    eval "$cmd"
    echo "✅ Secrets configured!"
else
    echo "ℹ️  No secrets to set"
fi

# Deploy using Dockerfile with specific config
echo "🐳 Deploying with Dockerfile..."
fly deploy --config "$FLY_CONFIG"

echo ""
echo "🎉 Deployment complete!"
