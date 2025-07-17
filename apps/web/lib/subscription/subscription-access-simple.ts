/**
 * Simplified subscription access - reduced complexity while maintaining critical functionality
 */

import { log } from "@repo/shared/lib/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import type { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import { hasSubscriptionAccess } from "@repo/shared/utils/subscription-grace-period";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { redisCache } from "@/lib/cache/redis-cache";
import { db } from "@/lib/database";
import { userSubscriptions, users } from "@/lib/database/schema";

interface SubscriptionData {
    planSlug: string | null;
    subPlan: string | null;
    status: string | null;
    currentPeriodEnd: Date | null;
    creemSubscriptionId: string | null;
    isActive: boolean;
    isPremium: boolean;
    isVtPlus: boolean;
}

/**
 * Core subscription query with proper ordering
 */
async function fetchSubscriptionFromDB(userId: string): Promise<SubscriptionData | null> {
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
            .orderBy(
                // Prioritize active/valid subscriptions first
                sql`CASE 
                    WHEN user_subscriptions.status IN ('active','trialing','past_due') THEN 0
                    WHEN user_subscriptions.status IN ('canceled','cancelled') THEN 1
                    ELSE 2
                END`,
                desc(userSubscriptions.currentPeriodEnd),
                desc(userSubscriptions.updatedAt),
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];

        // Use centralized grace period logic
        const isActive = hasSubscriptionAccess({
            status: row.status as SubscriptionStatusEnum,
            currentPeriodEnd: row.currentPeriodEnd,
        });

        const isPremium =
            isActive && (row.subPlan === PlanSlug.VT_PLUS || row.planSlug === PlanSlug.VT_PLUS);
        const isVtPlus = isPremium;

        return {
            planSlug: row.planSlug,
            subPlan: row.subPlan,
            status: row.status,
            currentPeriodEnd: row.currentPeriodEnd,
            creemSubscriptionId: row.creemSubscriptionId,
            isActive,
            isPremium,
            isVtPlus,
        };
    } catch (error) {
        log.error("Failed to fetch subscription data:", { userId, error });
        return null;
    }
}

/**
 * Get subscription with Redis cache (simplified - removed LRU layer)
 */
export async function getSubscription(userId: string): Promise<SubscriptionData | null> {
    if (!userId) return null;

    // Check Redis cache first
    const cached = await redisCache.getSubscription(userId);
    if (cached) {
        return {
            planSlug: cached.planSlug,
            subPlan: cached.subPlan,
            status: cached.status,
            currentPeriodEnd: cached.currentPeriodEnd ? new Date(cached.currentPeriodEnd) : null,
            creemSubscriptionId: cached.creemSubscriptionId,
            isActive: cached.isActive,
            isPremium: cached.isPremium,
            isVtPlus: cached.isVtPlus,
        };
    }

    // Fetch from database
    const subscription = await fetchSubscriptionFromDB(userId);
    if (!subscription) return null;

    // Cache in Redis
    await redisCache.setSubscription(userId, {
        planSlug: subscription.planSlug,
        subPlan: subscription.subPlan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
        creemSubscriptionId: subscription.creemSubscriptionId,
        isActive: subscription.isActive,
        isPremium: subscription.isPremium,
        isVtPlus: subscription.isVtPlus,
    });

    return subscription;
}

/**
 * Check VT+ access - simplified interface
 */
export async function hasVTPlusAccess(userId: string): Promise<boolean> {
    if (!userId) return false;

    const subscription = await getSubscription(userId);
    return (subscription?.isVtPlus && subscription?.isActive) || false;
}

/**
 * Batch subscription lookup - simplified but correct
 */
export async function getSubscriptionsBatch(
    userIds: string[],
): Promise<Map<string, SubscriptionData>> {
    const results = new Map<string, SubscriptionData>();

    if (userIds.length === 0) return results;

    // Check Redis for all users
    const cacheKeys = userIds.map((id) => `sub:${id}`);
    const cachedResults = await redisCache.mget(cacheKeys);

    const uncachedIds: string[] = [];

    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const cached = cachedResults[i];

        if (cached) {
            results.set(userId, {
                planSlug: cached.planSlug,
                subPlan: cached.subPlan,
                status: cached.status,
                currentPeriodEnd: cached.currentPeriodEnd
                    ? new Date(cached.currentPeriodEnd)
                    : null,
                creemSubscriptionId: cached.creemSubscriptionId,
                isActive: cached.isActive,
                isPremium: cached.isPremium,
                isVtPlus: cached.isVtPlus,
            });
        } else {
            uncachedIds.push(userId);
        }
    }

    // Fetch uncached from database
    if (uncachedIds.length > 0) {
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
                .where(inArray(users.id, uncachedIds))
                .orderBy(
                    sql`CASE 
                        WHEN user_subscriptions.status IN ('active','trialing','past_due') THEN 0
                        WHEN user_subscriptions.status IN ('canceled','cancelled') THEN 1
                        ELSE 2
                    END`,
                    desc(userSubscriptions.currentPeriodEnd),
                    desc(userSubscriptions.updatedAt),
                );

            // Process results and deduplicate by user (take first = highest priority)
            const userDataMap = new Map<string, (typeof dbResults)[0]>();
            for (const row of dbResults) {
                if (!userDataMap.has(row.userId)) {
                    userDataMap.set(row.userId, row);
                }
            }

            // Convert to subscription data and cache
            for (const [userId, row] of userDataMap) {
                const isActive = hasSubscriptionAccess({
                    status: row.status as SubscriptionStatusEnum,
                    currentPeriodEnd: row.currentPeriodEnd,
                });

                const isPremium =
                    isActive &&
                    (row.subPlan === PlanSlug.VT_PLUS || row.planSlug === PlanSlug.VT_PLUS);
                const isVtPlus = isPremium;

                const subscription: SubscriptionData = {
                    planSlug: row.planSlug,
                    subPlan: row.subPlan,
                    status: row.status,
                    currentPeriodEnd: row.currentPeriodEnd,
                    creemSubscriptionId: row.creemSubscriptionId,
                    isActive,
                    isPremium,
                    isVtPlus,
                };

                results.set(userId, subscription);

                // Cache in Redis
                await redisCache.setSubscription(userId, {
                    planSlug: subscription.planSlug,
                    subPlan: subscription.subPlan,
                    status: subscription.status,
                    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
                    creemSubscriptionId: subscription.creemSubscriptionId,
                    isActive: subscription.isActive,
                    isPremium: subscription.isPremium,
                    isVtPlus: subscription.isVtPlus,
                });
            }
        } catch (error) {
            log.error("Failed to batch fetch subscription data:", { userIds: uncachedIds, error });
        }
    }

    return results;
}

/**
 * Invalidate cache for user
 */
export async function invalidateSubscriptionCache(userId: string): Promise<void> {
    await redisCache.invalidateSubscription(userId);
    log.debug("Invalidated subscription cache", { userId });
}

export type { SubscriptionData };
