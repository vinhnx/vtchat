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
    exit 1
fi

# Set environment variables for Next.js standalone server
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Start the Next.js standalone server
echo "Starting server on ${HOSTNAME}:${PORT}..."
exec node apps/web/server.js
