/**
 * Subscription Cache Management
 * Handles caching of subscription status to minimize database calls
 */

import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { logger } from '@repo/shared/logger';

export interface CachedSubscriptionStatus {
    plan: PlanSlug;
    status: SubscriptionStatusEnum;
    isPlusSubscriber: boolean;
    currentPeriodEnd?: Date;
    hasSubscription: boolean;
    subscriptionId?: string;
    cachedAt: Date;
    expiresAt: Date; // When this cache entry expires
}

// In-memory cache - in production, consider using Redis
const subscriptionCache = new Map<string, CachedSubscriptionStatus>();

// Cache duration: 1 hour for active subscriptions, 5 minutes for free tier
const CACHE_DURATION_ACTIVE = 60 * 60 * 1000; // 1 hour
const CACHE_DURATION_FREE = 5 * 60 * 1000; // 5 minutes

/**
 * Get cache key for user subscription
 */
function getCacheKey(userId: string): string {
    return `subscription:${userId}`;
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(cached: CachedSubscriptionStatus): boolean {
    const now = new Date();

    // Cache expired
    if (now > cached.expiresAt) {
        return false;
    }

    // If subscription has an end date and we're past it, invalidate cache
    if (cached.currentPeriodEnd && now > cached.currentPeriodEnd) {
        return false;
    }

    return true;
}

/**
 * Get cached subscription status
 */
export function getCachedSubscriptionStatus(userId: string): CachedSubscriptionStatus | null {
    const cacheKey = getCacheKey(userId);
    const cached = subscriptionCache.get(cacheKey);

    if (!cached) {
        return null;
    }

    if (!isCacheValid(cached)) {
        subscriptionCache.delete(cacheKey);
        return null;
    }

    return cached;
}

/**
 * Cache subscription status
 */
export function cacheSubscriptionStatus(
    userId: string,
    status: Omit<CachedSubscriptionStatus, 'cachedAt' | 'expiresAt'>
): CachedSubscriptionStatus {
    const now = new Date();
    const cacheDuration = status.isPlusSubscriber ? CACHE_DURATION_ACTIVE : CACHE_DURATION_FREE;

    const cached: CachedSubscriptionStatus = {
        ...status,
        cachedAt: now,
        expiresAt: new Date(now.getTime() + cacheDuration),
    };

    const cacheKey = getCacheKey(userId);
    subscriptionCache.set(cacheKey, cached);

    return cached;
}

/**
 * Invalidate subscription cache for a user
 */
export function invalidateSubscriptionCache(userId: string): void {
    const cacheKey = getCacheKey(userId);
    subscriptionCache.delete(cacheKey);
    console.log(`[Subscription Cache] Invalidated cache for user ${userId}`);
}
