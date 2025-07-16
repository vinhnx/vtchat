#!/bin/bash

# Script to optimize Next.js development performance and reduce filesystem warnings
# Usage: ./scripts/optimize-dev.sh

set -e

echo "🚀 Optimizing VT Chat development environment..."

# Navigate to project root
cd "$(dirname "$0")/.."

# 1. Clear Next.js cache
echo "📁 Clearing Next.js cache..."
rm -rf apps/web/.next/cache
rm -rf apps/web/.next/trace
echo "✅ Cache cleared"

# 2. Clean node_modules if they're too large
NODE_MODULES_SIZE=$(du -sm node_modules 2>/dev/null | cut -f1 || echo "0")
if [ "$NODE_MODULES_SIZE" -gt 1000 ]; then
    echo "📦 node_modules is ${NODE_MODULES_SIZE}MB, consider cleaning..."
    echo "   Run: bun install --force to refresh dependencies"
fi

# 3. Check for and exclude common performance-affecting directories from Time Machine
if command -v tmutil >/dev/null 2>&1; then
    echo "⏰ Optimizing Time Machine exclusions..."
    tmutil addexclusion "$(pwd)/node_modules" 2>/dev/null || true
    tmutil addexclusion "$(pwd)/apps/web/.next" 2>/dev/null || true
    tmutil addexclusion "$(pwd)/.turbo" 2>/dev/null || true
    tmutil addexclusion "$(pwd)/dist" 2>/dev/null || true
    echo "✅ Time Machine exclusions updated"
fi

# 4. Set optimal file limits for development
echo "⚙️ Checking system file limits..."
CURRENT_LIMIT=$(ulimit -n)
if [ "$CURRENT_LIMIT" -lt 65536 ]; then
    echo "   Current file descriptor limit: $CURRENT_LIMIT"
    echo "   Consider increasing it: ulimit -n 65536"
    echo "   Add this to your ~/.zshrc: ulimit -n 65536"
fi

# 5. Check disk space
echo "💾 Checking disk space..."
AVAILABLE_SPACE=$(df -h . | tail -1 | awk '{print $4}')
echo "   Available space: $AVAILABLE_SPACE"

# 6. Create/update .env.local with performance optimizations
ENV_FILE="apps/web/.env.local"
echo "🔧 Updating environment variables..."

# Backup existing .env.local
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
fi

# Add performance optimizations to .env.local
cat << 'EOF' >> "$ENV_FILE"

# Next.js Performance Optimizations
NEXT_TELEMETRY_DISABLED=1
NEXT_CACHE_HANDLER=filesystem
# Disable webpack cache in development to reduce filesystem I/O
NEXT_WEBPACK_CACHE=false
# Use SWC instead of Babel for faster builds
NEXT_COMPILE_WITH_SWC=true
EOF

echo "✅ Environment variables updated"

# 7. Show filesystem performance tips
echo ""
echo "📋 Additional Performance Tips:"
echo "   1. Consider using Turbopack: bun dev --turbo"
echo "   2. Exclude project from antivirus real-time scanning"
echo "   3. Close unnecessary applications during development"
echo "   4. Use an SSD if possible"
echo "   5. Ensure you have at least 4GB free disk space"
echo ""

# 8. Test the setup
echo "🧪 Testing Next.js configuration..."
cd apps/web
if node -c next.config.mjs; then
    echo "✅ Next.js configuration is valid"
else
    echo "❌ Next.js configuration has errors"
    exit 1
fi

echo ""
echo "🎉 Development environment optimized!"
echo "   Next time you run 'bun dev', performance should be improved."
echo "   If you still see filesystem warnings, consider the additional tips above."
