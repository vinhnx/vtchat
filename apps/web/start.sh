#!/bin/bash

# Production startup script for Fly.io deployment
set -e

echo "Starting VT Chat server..."
echo "PORT: ${PORT:-3000}"
echo "HOSTNAME: ${HOSTNAME:-0.0.0.0}"
echo "NODE_ENV: ${NODE_ENV}"

# Verify server.js exists
if [ ! -f "apps/web/server.js" ]; then
    echo "Error: server.js not found at apps/web/server.js"
    echo "Contents of current directory:"
    ls -la
    echo "Contents of apps/web/:"
    ls -la apps/web/ || echo "apps/web directory not found"
    exit 1
fi

# Set environment variables for Next.js standalone server
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Debug output
echo "=== SERVER START DEBUG ==="
echo "Current directory: $(pwd)"
echo "Server file location: $(ls -la apps/web/server.js 2>/dev/null || echo 'NOT FOUND')"
echo "PORT: ${PORT}"
echo "HOSTNAME: ${HOSTNAME}"
echo "NODE_ENV: ${NODE_ENV}"
echo "=========================="

# Start the Next.js standalone server with explicit hostname binding
echo "Starting server on ${HOSTNAME}:${PORT}..."
exec node apps/web/server.js
