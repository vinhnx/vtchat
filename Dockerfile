# syntax = docker/dockerfile:1

# Production Dockerfile for VT Chat - Optimized for Fly.io deployment  
# Based on Fly.io best practices for Next.js applications with Bun

FROM oven/bun:1-alpine AS base

# Install necessary dependencies for Alpine + build tools for native modules
# Use cache mount for apk packages
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    libc6-compat \
    curl \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    nodejs \
    npm && \
    npm install -g node-gyp

WORKDIR /app

# Dependencies stage  
FROM base AS deps

# Copy workspace config and all package.json files for monorepo
COPY package.json bun.lock ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install all dependencies including workspace packages
# Use cache mount for faster builds and optimize better-sqlite3 compilation
RUN --mount=type=cache,target=/root/.bun/install/cache \
    --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/tmp/better-sqlite3-build \
    export BETTER_SQLITE3_CACHE_DIR=/tmp/better-sqlite3-build && \
    export npm_config_build_from_source=true && \
    export npm_config_cache=/app/node_modules/.cache && \
    bun install --frozen-lockfile --no-verify

# Build stage  
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY . .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_COMMON_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL

# Set build environment variables
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_COMMON_URL=${NEXT_PUBLIC_COMMON_URL}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application with standalone output
# Use cache mount for Next.js build cache
RUN --mount=type=cache,target=/app/apps/web/.next/cache \
    cd apps/web && bun run build

# Production stage - use distroless for smaller image
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

# Copy Next.js standalone build output (distroless runs as non-root by default)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start the Next.js standalone server (distroless uses non-root by default)
CMD ["apps/web/server.js"]
