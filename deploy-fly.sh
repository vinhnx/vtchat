#!/bin/bash

# Single Fly.io Deployment Script
# Sets secrets and deploys in one command

set -e

# Check if git working directory is clean
check_git_status() {
    if [[ -n $(git status --porcelain) ]]; then
        echo "❌ Error: Working directory is not clean!"
        echo "Please commit or stash your changes before deploying."
        git status --short
        exit 1
    fi
    echo "✅ Working directory is clean"
}

# Switch to appropriate git branch and push changes
prepare_git_branch() {
    local target_branch="$1"
    local current_branch=$(git branch --show-current)
    
    echo "🌿 Git branch management"
    echo "Current branch: $current_branch"
    echo "Target branch: $target_branch"
    
    # Switch to target branch if different
    if [[ "$current_branch" != "$target_branch" ]]; then
        echo "Switching to $target_branch branch..."
        git checkout "$target_branch" || {
            echo "❌ Failed to switch to $target_branch branch"
            exit 1
        }
    fi
    
    # Pull latest changes
    echo "Pulling latest changes from origin/$target_branch..."
    git pull origin "$target_branch" || {
        echo "❌ Failed to pull from origin/$target_branch"
        exit 1
    }
    
    # Check if there are any local commits to push
    local commits_ahead=$(git rev-list --count origin/"$target_branch"..HEAD 2>/dev/null || echo "0")
    if [[ "$commits_ahead" -gt 0 ]]; then
        echo "📤 Pushing $commits_ahead local commit(s) to origin/$target_branch..."
        git push origin "$target_branch" || {
            echo "❌ Failed to push to origin/$target_branch"
            exit 1
        }
        echo "✅ Commits pushed successfully"
    else
        echo "ℹ️  No local commits to push"
    fi
}

# Validate semver format
validate_semver() {
    local version=$1
    if [[ ! $version =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+)(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?(\+[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$ ]]; then
        return 1
    fi
    return 0
}

# Prompt for version tag
prompt_version() {
    echo "🏷️  Version tagging for deployment"
    
    # Get latest tag
    local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    echo "Latest tag: $latest_tag"
    
    echo "Enter new version (semver format, e.g., v1.0.0, v1.2.3-beta.1):"
    read -r new_version
    
    # Add 'v' prefix if not present
    if [[ ! $new_version =~ ^v ]]; then
        new_version="v$new_version"
    fi
    
    # Validate semver format
    if ! validate_semver "$new_version"; then
        echo "❌ Invalid semver format. Expected: v1.2.3 or v1.2.3-beta.1"
        exit 1
    fi
    
    # Check if tag already exists
    if git rev-parse "$new_version" >/dev/null 2>&1; then
        echo "❌ Tag $new_version already exists!"
        exit 1
    fi
    
    echo "Creating tag: $new_version"
    echo "Proceed? (y/N):"
    read -r confirm
    
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
    
    # Create and push tag
    git tag -a "$new_version" -m "Release $new_version"
    git push origin "$new_version"
    echo "✅ Tag $new_version created and pushed to origin"
}

# Default values
ENV_FILE=""
FORCE_CLEANUP=false
ENVIRONMENT="dev"
FLY_CONFIG="fly.toml"
FLY_APP="vtchat-dev"
GIT_BRANCH="dev"

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
            FLY_APP="vtchat"
            GIT_BRANCH="main"
            ENV_FILE="${ENV_FILE:-apps/web/.env.production}"
            shift
            ;;
        --dev|--development)
            ENVIRONMENT="dev"
            FLY_CONFIG="fly.toml"
            FLY_APP="vtchat-dev"
            GIT_BRANCH="dev"
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

# Pre-deployment checks
check_git_status

# Git branch management
prepare_git_branch "$GIT_BRANCH"

# Version tagging (only for production)
if [[ "$ENVIRONMENT" == "prod" ]]; then
    prompt_version
fi

echo "🚀 Starting Fly.io deployment for vtchat..."
echo "📋 Using config: $FLY_CONFIG"
echo "🎯 Target app: $FLY_APP"
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
        existing_secrets=$(fly secrets list -a "$FLY_APP" --json 2>/dev/null || echo "[]")
        if [[ "$existing_secrets" != "[]" && "$existing_secrets" != "" ]]; then
            existing_keys=$(echo "$existing_secrets" | jq -r '.[].Name' | tr '\n' ' ')
            if [[ -n "$existing_keys" ]]; then
                echo "🗑️  Clearing existing secrets..."
                fly secrets unset -a "$FLY_APP" $existing_keys
            fi
        fi
    fi

    # Set new secrets
    cmd="fly secrets set -a \"$FLY_APP\""
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
fly deploy -a "$FLY_APP" --config "$FLY_CONFIG"

echo ""
echo "🎉 Deployment complete!"
