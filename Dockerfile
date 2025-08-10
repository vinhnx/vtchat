# Minimal Dockerfile for VT - Deploy pre-built standalone files
# This avoids memory issues during Docker build

FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the entire standalone build to maintain proper directory structure
COPY --chown=nextjs:nodejs apps/web/.next/standalone /app

# Copy static files and public assets to the correct locations
COPY --chown=nextjs:nodejs apps/web/.next/static /app/apps/web/.next/static
COPY --chown=nextjs:nodejs apps/web/public /app/apps/web/public

# Set the working directory to the apps/web directory where server.js expects to run
WORKDIR /app/apps/web

# Switch to non-root user
USER nextjs

# Expose port and set environment
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using the standalone server.js
# This will run from the correct directory with proper module resolution
CMD ["node", "server.js"]