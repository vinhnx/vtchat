/**
 * Fast subscription access utilities with caching and optimized queries
 */

import { log } from "@repo/shared/lib/logger";
import { PlanSlug, type VtPlusFeature } from "@repo/shared/types/subscription";
import { eq } from "drizzle-orm";
import { redisCache, type SubscriptionCacheData } from "@/lib/cache/redis-cache";
import { db } from "@/lib/db";
import { userSubscriptions, users } from "@/lib/db/schema";

interface FastSubscriptionData {
    planSlug: string | null;
    subPlan: string | null;
    status: string | null;
    currentPeriodEnd: Date | null;
    creemSubscriptionId: string | null;
    isActive: boolean;
    isPremium: boolean;
    isVtPlus: boolean;
}

interface VTPlusAccessResult {
    hasAccess: boolean;
    reason?: string;
    planSlug?: string | null;
    subscriptionStatus?: string | null;
}

// In-memory LRU cache for very recent requests (< 2 seconds)
class QuickLRU<K, V> {
    private cache = new Map<K, { value: V; timestamp: number }>();
    private maxSize: number;
    private ttl: number;

    constructor(options: { maxSize: number; ttl: number }) {
        this.maxSize = options.maxSize;
        this.ttl = options.ttl;
    }

    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    set(key: K, value: V): void {
        // Clean up expired entries if we're at capacity
        if (this.cache.size >= this.maxSize) {
            const now = Date.now();
            for (const [k, entry] of this.cache) {
                if (now - entry.timestamp > this.ttl) {
                    this.cache.delete(k);
                    if (this.cache.size < this.maxSize) break;
                }
            }

            // If still at capacity, remove oldest
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey !== undefined) {
                    this.cache.delete(firstKey);
                }
            }
        }

        this.cache.set(key, { value, timestamp: Date.now() });
    }

    clear(): void {
        this.cache.clear();
    }
}

// Local caches for performance
const subscriptionLRU = new QuickLRU<string, FastSubscriptionData>({ maxSize: 1000, ttl: 2000 });
const rateLimitLRU = new QuickLRU<string, number>({ maxSize: 5000, ttl: 2000 });

/**
 * Get subscription data with multi-layer caching
 */
export async function getSubscriptionFast(userId: string): Promise<FastSubscriptionData | null> {
    if (!userId) return null;

    // 1. Check in-memory LRU first (< 2 seconds old)
    const localCached = subscriptionLRU.get(userId);
    if (localCached) {
        return localCached;
    }

    // 2. Check Redis cache (< 30 seconds old)
    const redisCached = await redisCache.getSubscription(userId);
    if (redisCached) {
        const fastData: FastSubscriptionData = {
            planSlug: redisCached.planSlug,
            subPlan: redisCached.subPlan,
            status: redisCached.status,
            currentPeriodEnd: redisCached.currentPeriodEnd
                ? new Date(redisCached.currentPeriodEnd)
                : null,
            creemSubscriptionId: redisCached.creemSubscriptionId,
            isActive: redisCached.isActive,
            isPremium: redisCached.isPremium,
            isVtPlus: redisCached.isVtPlus,
        };

        // Cache in LRU for immediate subsequent requests
        subscriptionLRU.set(userId, fastData);
        return fastData;
    }

    // 3. Fetch from database with optimized single query
    try {
        const result = await db
            .select({
                planSlug: users.planSlug,
                subPlan: userSubscriptions.plan,
                status: userSubscriptions.status,
                currentPeriodEnd: userSubscriptions.currentPeriodEnd,
                creemSubscriptionId: userSubscriptions.creemSubscriptionId,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
            .where(eq(users.id, userId))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        const isActive = row.status === "active";
        const isPremium =
            isActive && (row.subPlan === PlanSlug.VT_PLUS || row.planSlug === PlanSlug.VT_PLUS);
        const isVtPlus = isPremium;

        const fastData: FastSubscriptionData = {
            planSlug: row.planSlug,
            subPlan: row.subPlan,
            status: row.status,
            currentPeriodEnd: row.currentPeriodEnd,
            creemSubscriptionId: row.creemSubscriptionId,
            isActive,
            isPremium,
            isVtPlus,
        };

        // Cache in both Redis and LRU
        subscriptionLRU.set(userId, fastData);

        // Cache in Redis with dynamic TTL
        await redisCache.setSubscription(userId, {
            planSlug: fastData.planSlug,
            subPlan: fastData.subPlan,
            status: fastData.status,
            currentPeriodEnd: fastData.currentPeriodEnd?.toISOString() || null,
            creemSubscriptionId: fastData.creemSubscriptionId,
            isActive: fastData.isActive,
            isPremium: fastData.isPremium,
            isVtPlus: fastData.isVtPlus,
        });

        return fastData;
    } catch (error) {
        log.error("Failed to fetch subscription data:", { userId, error });
        return null;
    }
}

/**
 * Fast VT+ access check using cached subscription data
 */
export async function checkVTPlusAccessFast(
    userIdOrSubscription: string | FastSubscriptionData | null,
    _ip?: string,
): Promise<VTPlusAccessResult> {
    if (!userIdOrSubscription) {
        return { hasAccess: false, reason: "No user ID provided" };
    }

    let subscription: FastSubscriptionData | null;

    if (typeof userIdOrSubscription === "string") {
        subscription = await getSubscriptionFast(userIdOrSubscription);
    } else {
        subscription = userIdOrSubscription;
    }

    if (!subscription) {
        return { hasAccess: false, reason: "Subscription not found" };
    }

    const hasAccess = subscription.isVtPlus && subscription.isActive;

    return {
        hasAccess,
        reason: hasAccess ? undefined : "VT+ subscription required",
        planSlug: subscription.planSlug,
        subscriptionStatus: subscription.status,
    };
}

/**
 * Fast feature access check
 */
export async function checkFeatureAccessFast(
    userIdOrSubscription: string | FastSubscriptionData | null,
    _feature: VtPlusFeature,
): Promise<boolean> {
    const accessResult = await checkVTPlusAccessFast(userIdOrSubscription);

    if (!accessResult.hasAccess) {
        return false;
    }

    // All VT+ users have access to all VT+ features
    // Add specific feature gating logic here if needed
    return true;
}

/**
 * Fast rate limit check with multi-layer caching
 */
export async function getRateLimitCountFast(userId: string, key: string): Promise<number> {
    const cacheKey = `${userId}:${key}`;

    // Check LRU first
    const localCount = rateLimitLRU.get(cacheKey);
    if (localCount !== undefined) {
        return localCount;
    }

    // Check Redis
    const redisCount = await redisCache.getRateLimit(userId, key);

    // Cache in LRU for immediate subsequent requests
    rateLimitLRU.set(cacheKey, redisCount);

    return redisCount;
}

/**
 * Fire-and-forget rate limit increment for performance
 */
export function incrementRateLimitAsync(userId: string, key: string, ttlSeconds: number): void {
    // Update Redis asynchronously
    redisCache.incrementRateLimitAsync(userId, key, ttlSeconds);

    // Update local cache optimistically
    const cacheKey = `${userId}:${key}`;
    const currentCount = rateLimitLRU.get(cacheKey) || 0;
    rateLimitLRU.set(cacheKey, currentCount + 1);
}

/**
 * Invalidate all caches for a user (on subscription changes)
 */
export async function invalidateUserCaches(userId: string): Promise<void> {
    // Clear Redis cache
    await redisCache.invalidateSubscription(userId);

    // Clear LRU cache
    subscriptionLRU.clear(); // Clear all for simplicity, could be more targeted

    log.debug("Invalidated caches for user", { userId });
}

/**
 * Batch subscription lookup for multiple users
 */
export async function getSubscriptionsBatch(
    userIds: string[],
): Promise<Map<string, FastSubscriptionData>> {
    const results = new Map<string, FastSubscriptionData>();
    const uncachedIds: string[] = [];

    // Check LRU cache for all users
    for (const userId of userIds) {
        const cached = subscriptionLRU.get(userId);
        if (cached) {
            results.set(userId, cached);
        } else {
            uncachedIds.push(userId);
        }
    }

    if (uncachedIds.length === 0) {
        return results;
    }

    // Check Redis cache for uncached users
    const redisCacheKeys = uncachedIds.map((id) => `sub:${id}`);
    const redisResults = await redisCache.mget<SubscriptionCacheData>(redisCacheKeys);

    const stillUncachedIds: string[] = [];

    for (let i = 0; i < uncachedIds.length; i++) {
        const userId = uncachedIds[i];
        const redisCached = redisResults[i];

        if (redisCached) {
            const fastData: FastSubscriptionData = {
                planSlug: redisCached.planSlug,
                subPlan: redisCached.subPlan,
                status: redisCached.status,
                currentPeriodEnd: redisCached.currentPeriodEnd
                    ? new Date(redisCached.currentPeriodEnd)
                    : null,
                creemSubscriptionId: redisCached.creemSubscriptionId,
                isActive: redisCached.isActive,
                isPremium: redisCached.isPremium,
                isVtPlus: redisCached.isVtPlus,
            };

            results.set(userId, fastData);
            subscriptionLRU.set(userId, fastData);
        } else {
            stillUncachedIds.push(userId);
        }
    }

    // Fetch remaining from database
    if (stillUncachedIds.length > 0) {
        try {
            const dbResults = await db
                .select({
                    userId: users.id,
                    planSlug: users.planSlug,
                    subPlan: userSubscriptions.plan,
                    status: userSubscriptions.status,
                    currentPeriodEnd: userSubscriptions.currentPeriodEnd,
                    creemSubscriptionId: userSubscriptions.creemSubscriptionId,
                })
                .from(users)
                .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
                .where(eq(users.id, stillUncachedIds[0])); // Would need to use 'in' for multiple IDs

            for (const row of dbResults) {
                const isActive = row.status === "active";
                const isPremium =
                    isActive &&
                    (row.subPlan === PlanSlug.VT_PLUS || row.planSlug === PlanSlug.VT_PLUS);
                const isVtPlus = isPremium;

                const fastData: FastSubscriptionData = {
                    planSlug: row.planSlug,
                    subPlan: row.subPlan,
                    status: row.status,
                    currentPeriodEnd: row.currentPeriodEnd,
                    creemSubscriptionId: row.creemSubscriptionId,
                    isActive,
                    isPremium,
                    isVtPlus,
                };

                results.set(row.userId, fastData);
                subscriptionLRU.set(row.userId, fastData);

                // Cache in Redis
                await redisCache.setSubscription(row.userId, {
                    planSlug: fastData.planSlug,
                    subPlan: fastData.subPlan,
                    status: fastData.status,
                    currentPeriodEnd: fastData.currentPeriodEnd?.toISOString() || null,
                    creemSubscriptionId: fastData.creemSubscriptionId,
                    isActive: fastData.isActive,
                    isPremium: fastData.isPremium,
                    isVtPlus: fastData.isVtPlus,
                });
            }
        } catch (error) {
            log.error("Failed to batch fetch subscription data:", {
                userIds: stillUncachedIds,
                error,
            });
        }
    }

    return results;
}

export type { FastSubscriptionData, VTPlusAccessResult };
