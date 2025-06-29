# Production Dockerfile for VT - Fly.io deployment
# Use multi-stage build for better optimization

# Stage 1: Base image with dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl bash python3 make g++ ca-certificates

# Install Bun and disable corepack to avoid conflicts
RUN corepack disable && \
    curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/ \
    && chmod +x /usr/local/bin/bun

# Stage 2: Dependencies
FROM base AS deps

# Copy workspace configuration and all package files
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN bun install --ignore-scripts

# Stage 3: Build
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY . .

# Accept build-time environment variables from Fly.io
# NOTE: NODE_ENV is automatically set by Next.js (development for dev, production for build)
ARG BASE_URL
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_ENV
ARG LOG_LEVEL

# Public URLs (needed at build time for Next.js)
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_COMMON_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL

# Payment Configuration
ARG PRODUCT_NAME
ARG PRODUCT_DESCRIPTION
ARG VT_PLUS_PRICE
ARG PRICING_CURRENCY
ARG PRICING_INTERVAL

# API Keys
ARG JINA_API_KEY
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

# Redis/KV Configuration - removed

# Database Configuration
ARG DATABASE_URL
ARG NEON_PROJECT_ID
ARG NEON_API_KEY

# Creem.io Configuration
ARG CREEM_API_KEY
ARG CREEM_WEBHOOK_SECRET
ARG CREEM_PRODUCT_ID
ARG CREEM_ENVIRONMENT

# Remove NODE_ENV override - let Next.js manage it automatically
# ENV NODE_ENV=${NODE_ENV}
ENV BASE_URL=${BASE_URL}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_ENV=${BETTER_AUTH_ENV}
ENV LOG_LEVEL=${LOG_LEVEL}

# Public variables (required at build time)
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_COMMON_URL=${NEXT_PUBLIC_COMMON_URL}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}

# Payment Configuration
ENV PRODUCT_NAME=${PRODUCT_NAME}
ENV PRODUCT_DESCRIPTION=${PRODUCT_DESCRIPTION}
ENV VT_PLUS_PRICE=${VT_PLUS_PRICE}
ENV PRICING_CURRENCY=${PRICING_CURRENCY}
ENV PRICING_INTERVAL=${PRICING_INTERVAL}

# API Keys
ENV JINA_API_KEY=${JINA_API_KEY}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Redis/KV Configuration - removed

# Database Configuration
ENV DATABASE_URL=${DATABASE_URL}
ENV NEON_PROJECT_ID=${NEON_PROJECT_ID}
ENV NEON_API_KEY=${NEON_API_KEY}

# Creem.io Configuration
ENV CREEM_API_KEY=${CREEM_API_KEY}
ENV CREEM_WEBHOOK_SECRET=${CREEM_WEBHOOK_SECRET}
ENV CREEM_PRODUCT_ID=${CREEM_PRODUCT_ID}
ENV CREEM_ENVIRONMENT=${CREEM_ENVIRONMENT}

# Build the application with environment variables
# Set a placeholder DATABASE_URL for build time (actual value is set at runtime via secrets)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

RUN cd apps/web && \
    echo "=== BUILD ENVIRONMENT DEBUG ===" && \
    echo "BASE_URL: $BASE_URL" && \
    echo "NEXT_PUBLIC_BASE_URL: $NEXT_PUBLIC_BASE_URL" && \
    echo "CREEM_ENVIRONMENT: $CREEM_ENVIRONMENT" && \
    echo "DATABASE_URL: [PLACEHOLDER - actual value set at runtime]" && \
    echo "NODE_ENV will be automatically set by Next.js build process" && \
    echo "==============================" && \
    bun run build

# Stage 4: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/start.sh ./apps/web/start.sh

# Make start script executable
RUN chmod +x ./apps/web/start.sh

# Switch to non-root user
USER nextjs

# Expose port and set environment
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using the custom startup script
CMD ["./apps/web/start.sh"]