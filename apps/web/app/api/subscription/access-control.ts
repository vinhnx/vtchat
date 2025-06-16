/**
 * Subscription Access Control Service
 *
 * Replaces the credit-based system with subscription-based access control
 * for VT+ features and capabilities
 */

import { auth } from '@/lib/auth';
import { VTPlusAccess } from '@repo/shared/config/vt-plus-features';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { NextRequest } from 'next/server';

/**
 * Get comprehensive subscription status for a user
 * Uses dynamic import to avoid build-time dependency issues
 */
async function getComprehensiveSubscriptionStatus(userId: string) {
    try {
        // Import dynamically to avoid build-time issues with drizzle
        const subscriptionSync = await import(
            '../../../../../packages/shared/utils/subscription-sync'
        );
        return await subscriptionSync.getComprehensiveSubscriptionStatus(userId);
    } catch (importError) {
        console.warn(
            'Could not import subscription-sync, falling back to direct database query:',
            importError
        );

        try {
            // Fallback: direct database query if import fails
            const { db } = await import('@/lib/database');
            const { users, userSubscriptions } = await import('@/lib/database/schema');
            const { eq } = await import('drizzle-orm');

            // Get user's current plan from database
            const userResult = await db
                .select({ planSlug: users.planSlug })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (userResult.length === 0) {
                // User not found, default to free plan
                return {
                    plan: PlanSlug.VT_BASE,
                    isActive: true,
                    expiresAt: null,
                    source: 'default' as const,
                    hasDbSubscription: false,
                    userPlanSlug: null,
                    needsSync: false,
                };
            }

            const userPlanSlug = userResult[0].planSlug;

            // Check for active subscription
            const subscriptionResult = await db
                .select()
                .from(userSubscriptions)
                .where(eq(userSubscriptions.userId, userId))
                .limit(1);

            const subscription = subscriptionResult.length > 0 ? subscriptionResult[0] : null;

            // Determine if user has active VT+ access
            let isActive = false;
            let plan = PlanSlug.VT_BASE;

            if (subscription) {
                // Check if subscription is active and not expired
                isActive =
                    subscription.status === SubscriptionStatusEnum.ACTIVE &&
                    (!subscription.currentPeriodEnd || new Date() <= subscription.currentPeriodEnd);
                plan =
                    isActive && subscription.plan === PlanSlug.VT_PLUS
                        ? PlanSlug.VT_PLUS
                        : PlanSlug.VT_BASE;
            } else if (userPlanSlug === PlanSlug.VT_PLUS) {
                // Fallback to user plan if no subscription record
                plan = PlanSlug.VT_PLUS;
                isActive = true;
            } else {
                // Default to free plan
                plan = PlanSlug.VT_BASE;
                isActive = true; // Free tier is always "active"
            }

            return {
                plan,
                isActive,
                expiresAt: subscription?.currentPeriodEnd || null,
                source: subscription ? 'subscription' : ('user_plan' as const),
                hasDbSubscription: !!subscription,
                userPlanSlug,
                needsSync: false,
            };
        } catch (dbError) {
            console.error('Database query failed, using fallback:', dbError);
            // Ultimate fallback - assume free tier access
            return {
                plan: PlanSlug.VT_BASE,
                isActive: true,
                expiresAt: null,
                source: 'fallback' as const,
                hasDbSubscription: false,
                userPlanSlug: null,
                needsSync: false,
            };
        }
    }
}

export interface AccessCheckResult {
    hasAccess: boolean;
    reason?: string;
    subscriptionStatus?: SubscriptionStatusEnum;
    planSlug?: PlanSlug;
}

export interface RequestIdentifier {
    userId?: string;
    ip?: string;
}

/**
 * Check if user has access to VT+ features
 */
export async function checkVTPlusAccess(identifier: RequestIdentifier): Promise<AccessCheckResult> {
    const { userId } = identifier;

    // If no user ID, they're anonymous and have no VT+ access
    if (!userId) {
        return {
            hasAccess: false,
            reason: 'Authentication required for VT+ features',
            subscriptionStatus: SubscriptionStatusEnum.NONE,
            planSlug: PlanSlug.VT_BASE,
        };
    }

    try {
        // Get comprehensive subscription status from database
        const subscriptionStatus = await getComprehensiveSubscriptionStatus(userId);

        const hasVTPlus =
            subscriptionStatus.plan === PlanSlug.VT_PLUS && subscriptionStatus.isActive;

        return {
            hasAccess: hasVTPlus,
            reason: hasVTPlus ? undefined : 'VT+ subscription required',
            subscriptionStatus: hasVTPlus
                ? SubscriptionStatusEnum.ACTIVE
                : SubscriptionStatusEnum.NONE,
            planSlug: subscriptionStatus.plan,
        };
    } catch (error) {
        console.error('Failed to check VT+ access:', error);
        return {
            hasAccess: false,
            reason: 'Failed to verify subscription status',
            subscriptionStatus: SubscriptionStatusEnum.NONE,
            planSlug: PlanSlug.VT_BASE,
        };
    }
}

/**
 * Check access to specific VT+ feature
 */
export async function checkFeatureAccess(
    identifier: RequestIdentifier,
    featureId: string
): Promise<AccessCheckResult> {
    const baseAccess = await checkVTPlusAccess(identifier);

    if (!baseAccess.hasAccess) {
        return baseAccess;
    }

    // Check if the specific feature is enabled
    const hasFeatureAccess = VTPlusAccess.getAccessibleFeatures(true).some(
        (feature: { id: string }) => feature.id === featureId
    );

    return {
        ...baseAccess,
        hasAccess: hasFeatureAccess,
        reason: hasFeatureAccess ? undefined : `Feature '${featureId}' not available`,
    };
}

/**
 * Middleware function to enforce VT+ access on API routes
 */
export async function enforceVTPlusAccess(request: NextRequest): Promise<{
    success: boolean;
    response?: Response;
    userId?: string;
    accessResult?: AccessCheckResult;
}> {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id;

        const accessResult = await checkVTPlusAccess({ userId });

        if (!accessResult.hasAccess) {
            return {
                success: false,
                response: new Response(
                    JSON.stringify({
                        error: 'VT+ subscription required',
                        reason: accessResult.reason,
                        subscriptionStatus: accessResult.subscriptionStatus,
                    }),
                    {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    }
                ),
                userId,
                accessResult,
            };
        }

        return {
            success: true,
            userId,
            accessResult,
        };
    } catch (error) {
        console.error('VT+ access enforcement failed:', error);
        return {
            success: false,
            response: new Response(
                JSON.stringify({
                    error: 'Failed to verify subscription access',
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            ),
        };
    }
}

/**
 * Get user's accessible VT+ features
 */
export async function getUserAccessibleFeatures(userId?: string) {
    if (!userId) {
        return [];
    }

    const accessResult = await checkVTPlusAccess({ userId });

    if (!accessResult.hasAccess) {
        return [];
    }

    return VTPlusAccess.getAccessibleFeatures(true);
}

/**
 * Rate limiting for free tier users (base plan)
 * Uses Redis for persistent rate limiting across deployments
 */
export async function checkRateLimit(
    identifier: RequestIdentifier
): Promise<{ allowed: boolean; remaining?: number; resetTime?: Date }> {
    const { userId, ip } = identifier;

    // Check if user has VT+ subscription
    const accessResult = await checkVTPlusAccess(identifier);

    // VT+ users have unlimited usage
    if (accessResult.hasAccess) {
        return { allowed: true };
    }

    // For free tier users, implement Redis-based rate limiting
    const dailyLimit = process.env.FREE_TIER_DAILY_LIMIT
        ? parseInt(process.env.FREE_TIER_DAILY_LIMIT, 10)
        : 10; // Default to 10 requests per day

    try {
        // Try to use Redis for rate limiting if available
        const Redis = await import('@upstash/redis').then(m => m.Redis);

        // Use either KV_REST_API_* or UPSTASH_REDIS_REST_* variables
        const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
        const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

        if (redisUrl && redisToken) {
            const redis = new Redis({
                url: redisUrl,
                token: redisToken,
            });

            // Create rate limit key based on user ID or IP
            const rateLimitKey = userId
                ? `rate_limit:user:${userId}`
                : `rate_limit:ip:${ip || 'unknown'}`;

            const now = new Date();
            const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
            const fullKey = `${rateLimitKey}:${today}`;

            // Get current usage count
            const current = await redis.get(fullKey);
            const currentCount = current ? parseInt(current.toString(), 10) : 0;

            if (currentCount >= dailyLimit) {
                // Rate limit exceeded
                const resetTime = new Date(now);
                resetTime.setDate(resetTime.getDate() + 1);
                resetTime.setHours(0, 0, 0, 0); // Reset at midnight

                return {
                    allowed: false,
                    remaining: 0,
                    resetTime,
                };
            }

            // Increment usage count
            await redis.incr(fullKey);

            // Set expiration to end of day if this is the first request
            if (currentCount === 0) {
                const endOfDay = new Date(now);
                endOfDay.setDate(endOfDay.getDate() + 1);
                endOfDay.setHours(0, 0, 0, 0);
                const ttlSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
                await redis.expire(fullKey, ttlSeconds);
            }

            const resetTime = new Date(now);
            resetTime.setDate(resetTime.getDate() + 1);
            resetTime.setHours(0, 0, 0, 0);

            return {
                allowed: true,
                remaining: dailyLimit - (currentCount + 1),
                resetTime,
            };
        }
    } catch (redisError) {
        console.warn('Redis rate limiting unavailable, using fallback:', redisError);
    }

    // Fallback: In-memory rate limiting (not persistent across deployments)
    // This is a simplified implementation for when Redis is not available
    console.warn('Using in-memory rate limiting - not recommended for production');

    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(24, 0, 0, 0); // Reset at midnight

    // In production, you should implement persistent storage here
    // For now, we'll allow the request and let the calling code handle limits
    return {
        allowed: true,
        remaining: dailyLimit - 1,
        resetTime,
    };
}
