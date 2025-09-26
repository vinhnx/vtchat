#!/bin/bash

# VTChat Docker Setup Validation Script

echo "🔍 VTChat Docker Setup Validator"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "❌ apps/web/.env.local not found. Please copy from apps/web/.env.example"
    exit 1
fi

echo "✅ Environment file exists"

# Check for required environment variables
source apps/web/.env.local

if [ -z "$BETTER_AUTH_SECRET" ] || [ "$BETTER_AUTH_SECRET" = "your-32-character-secret-key-here" ]; then
    echo "❌ BETTER_AUTH_SECRET is not set or using default value"
    exit 1
fi

echo "✅ BETTER_AUTH_SECRET is configured"

# Check for at least one AI API key
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ No AI API key found. Please set at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY"
    exit 1
fi

echo "✅ At least one AI API key is configured"

# Check if required files exist
required_files=("docker-compose.yml" "Dockerfile.dev" "scripts/init-db.sql")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

echo "✅ All required files are present"

echo ""
echo "🎉 Setup validation passed! You can now run:"
echo "   docker-compose up --build"
echo ""
echo "📖 For manual setup instructions, see DOCKER-README.md"