#!/bin/bash

# Fly.io Secrets Deployment Script
# Automatically reads from .env file and sets secrets

set -e

# Parse command line arguments
FORCE_CLEANUP=false
ENV_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean|--cleanup)
            FORCE_CLEANUP=true
            shift
            ;;
        -*)
            echo "❌ Unknown option: $1"
            echo "Usage: $0 [--clean] [env-file-path]"
            echo "  --clean: Force cleanup of existing secrets without prompting"
            echo "Example: $0 --clean apps/web/.env.build"
            exit 1
            ;;
        *)
            ENV_FILE="$1"
            shift
            ;;
    esac
done

# Default env file if not specified
ENV_FILE="${ENV_FILE:-apps/web/.env.build}"

# Check if env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Error: Environment file '$ENV_FILE' not found!"
    echo "Usage: $0 [--clean] [env-file-path]"
    echo "  --clean: Force cleanup of existing secrets without prompting"
    echo "Example: $0 --clean apps/web/.env.build"
    exit 1
fi

echo "🔧 Reading environment variables from: $ENV_FILE"
echo "🚀 Setting Fly.io secrets for vtchat-dev..."

# Arrays to store secrets and non-secrets
declare -a secrets=()
declare -a public_vars=()

# Read and process env file
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Extract key=value pairs
    if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
        
        # Replace Railway URLs with Fly.io URLs
        value=$(echo "$value" | sed 's|https://vtchat-web-development\.up\.railway\.app|https://vtchat-dev.fly.dev|g')
        
        # Categorize variables (public vars go in fly.toml, secrets via fly secrets)
        if [[ "$key" =~ ^NEXT_PUBLIC_ ]] || [[ "$key" =~ ^(BASE_URL|BETTER_AUTH_URL|CREEM_ENVIRONMENT|BETTER_AUTH_ENV|PRODUCT_NAME|PRODUCT_DESCRIPTION|PRICING_CURRENCY|PRICING_INTERVAL)$ ]]; then
            public_vars+=("$key=$value")
        else
            secrets+=("$key=$value")
        fi
    fi
done < "$ENV_FILE"

# Check existing secrets
echo "🔍 Checking existing secrets..."
existing_secrets=$(fly secrets list --json 2>/dev/null || echo "[]")

if [[ "$existing_secrets" != "[]" && "$existing_secrets" != "" ]]; then
    echo "📝 Found existing secrets:"
    echo "$existing_secrets" | jq -r '.[].Name' | while read -r name; do
        echo "  - $name"
    done
    
    echo ""
    if [[ $FORCE_CLEANUP == true ]]; then
        echo "🗑️  Force cleanup enabled - clearing existing secrets..."
        cleanup_secrets=true
    else
        read -p "🧹 Do you want to clear all existing secrets first? (y/N): " -n 1 -r
        echo
        cleanup_secrets=false
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cleanup_secrets=true
        fi
    fi
    
    if [[ $cleanup_secrets == true ]]; then
        echo "🗑️  Clearing existing secrets..."
        existing_keys=$(echo "$existing_secrets" | jq -r '.[].Name' | tr '\n' ' ')
        if [[ -n "$existing_keys" ]]; then
            fly secrets unset $existing_keys
            echo "✅ Existing secrets cleared!"
        fi
    fi
fi

# Set secrets
if [[ ${#secrets[@]} -gt 0 ]]; then
    echo "🔒 Setting secrets..."
    
    # Extract keys from secrets array to check for duplicates
    seen_keys=""
    unique_secrets=()
    
    for secret in "${secrets[@]}"; do
        key="${secret%%=*}"
        if [[ ! " $seen_keys " =~ " $key " ]]; then
            seen_keys="$seen_keys $key"
            unique_secrets+=("$secret")
            echo "  - $key"
        else
            echo "  ⚠️  Skipping duplicate key: $key"
        fi
    done
    
    if [[ ${#unique_secrets[@]} -gt 0 ]]; then
        # Build the fly secrets set command
        cmd="fly secrets set"
        for secret in "${unique_secrets[@]}"; do
            cmd="$cmd \"$secret\""
        done
        
        # Execute the command
        eval "$cmd"
        echo "✅ Secrets set successfully!"
    else
        echo "ℹ️  No unique secrets to set."
    fi
else
    echo "ℹ️  No secrets to set."
fi

# Display public variables (these should be in fly.toml [env] section)
if [[ ${#public_vars[@]} -gt 0 ]]; then
    echo ""
    echo "📋 Public variables (should be in fly.toml [env] section):"
    for var in "${public_vars[@]}"; do
        key="${var%%=*}"
        value="${var#*=}"
        echo "  $key = '$value'"
    done
fi

echo ""
echo "🎉 Configuration complete!"
echo "📝 Next steps:"
echo "   1. Review fly.toml [env] section for public variables"
echo "   2. Run: fly deploy"
echo "   3. Run: fly apps restart vtchat-dev (if needed)"
