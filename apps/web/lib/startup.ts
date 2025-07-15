/**
 * Application startup initialization
 */

import { log } from "@repo/shared/lib/logger";
import { subscribeToCacheInvalidation } from "@/lib/cache/cache-invalidation";

let initialized = false;

/**
 * Initialize application-wide services that should run once per process
 */
export async function initializeApp(): Promise<void> {
    if (initialized) {
        return;
    }

    // Skip initialization during build time
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
        log.debug("Skipping Redis cache invalidation setup - no Redis URL in production build");
        initialized = true;
        return;
    }

    // Skip initialization during Next.js build process
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        log.debug("Skipping cache invalidation setup during build phase");
        initialized = true;
        return;
    }

    try {
        // Initialize Redis pub/sub for cross-process cache invalidation (runtime only)
        await subscribeToCacheInvalidation();
        
        initialized = true;
        log.info("Application initialization completed");
    } catch (error) {
        log.error("Failed to initialize application", { error });
        // Don't fail the app if Redis setup fails
        initialized = true;
    }
}

// Don't auto-initialize to avoid build-time issues
// Services will be initialized lazily when needed
