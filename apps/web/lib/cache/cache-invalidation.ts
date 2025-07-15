/**
 * Cross-process cache invalidation using Redis pub/sub
 */

import { log } from "@repo/shared/lib/logger";
import { redisCache } from "@/lib/cache/redis-cache";
import { invalidateSessionSubscriptionCache } from "@/lib/subscription-session-cache";

let subscriptionInitialized = false;

const CACHE_INVALIDATION_CHANNEL = "subscription:invalidate";

/**
 * Publishes a cache invalidation message across all processes
 */
export async function publishCacheInvalidation(userId: string): Promise<void> {
    try {
        // Get Redis client for publishing
        const client = redisCache.getClient?.();
        if (!client) {
            log.warn("Redis client not available for cache invalidation broadcast");
            return;
        }

        await client.publish(CACHE_INVALIDATION_CHANNEL, JSON.stringify({ userId, timestamp: Date.now() }));
        log.debug("Published cache invalidation", { userId, channel: CACHE_INVALIDATION_CHANNEL });
    } catch (error) {
        log.error("Failed to publish cache invalidation", { userId, error });
    }
}

/**
 * Subscribes to cache invalidation messages and invalidates local session cache
 */
export async function subscribeToCacheInvalidation(): Promise<void> {
    if (subscriptionInitialized) {
        return;
    }

    try {
        // Get Redis client for subscribing  
        const client = redisCache.getClient?.();
        if (!client) {
            // Use debug level during build time to reduce noise
            const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                               (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL);
            if (isBuildTime) {
                log.debug("Redis client not available for cache invalidation subscription");
            } else {
                log.warn("Redis client not available for cache invalidation subscription");
            }
            return;
        }

        // Subscribe to the channel
        await client.subscribe(CACHE_INVALIDATION_CHANNEL);
        
        // Listen for messages
        client.on("message", (channel, message) => {
            if (channel !== CACHE_INVALIDATION_CHANNEL) return;
            
            try {
                const { userId, timestamp } = JSON.parse(message);
                
                // Invalidate local session cache for this user
                invalidateSessionSubscriptionCache(userId);
                
                log.debug("Received and processed cache invalidation", { 
                    userId, 
                    timestamp,
                    channel: CACHE_INVALIDATION_CHANNEL 
                });
            } catch (error) {
                log.error("Failed to process cache invalidation message", { message, error });
            }
        });

        subscriptionInitialized = true;
        log.info("Subscribed to cache invalidation messages", { channel: CACHE_INVALIDATION_CHANNEL });
    } catch (error) {
        log.error("Failed to subscribe to cache invalidation", { error });
    }
}

/**
 * Invalidates caches both locally and across all processes
 */
export async function invalidateAllCaches(userId: string): Promise<void> {
    // 1. Invalidate local caches immediately
    invalidateSessionSubscriptionCache(userId);
    
    // 2. Invalidate Redis cache
    await redisCache.invalidateSubscription(userId);
    
    // 3. Initialize subscription if not already done (lazy initialization)
    if (!subscriptionInitialized && typeof window === 'undefined') {
        await subscribeToCacheInvalidation();
    }
    
    // 4. Broadcast to other processes
    await publishCacheInvalidation(userId);
    
    log.info("Invalidated all caches for user", { userId });
}
