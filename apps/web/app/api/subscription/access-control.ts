/**
 * Subscription Access Control Service
 *
 * Replaces the credit-based system with subscription-based access control
 * for VT+ features and capabilities
 */

import { VTPlusAccess } from '@repo/shared/config/vt-plus-features';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth-server';

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
        log.warn(
            { error: importError },
            'Could not import subscription-sync, falling back to direct database query'
        );

        try {
            // Fallback: direct database query if import fails
            const { db, withDatabaseErrorHandling } = await import('@/lib/database');
            const { users, userSubscriptions } = await import('@/lib/database/schema');
            const { eq } = await import('drizzle-orm');

            return await withDatabaseErrorHandling(async () => {
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
                        (!subscription.currentPeriodEnd ||
                            new Date() <= subscription.currentPeriodEnd);
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
            }, 'Get user subscription status');
        } catch (dbError) {
            log.error('Database query failed, using fallback:', { data: dbError });
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
        log.error('Failed to check VT+ access:', { error });
        return {
            hasAccess: false,
            reason: 'Failed to verify subscription status',
            subscriptionStatus: SubscriptionStatusEnum.NONE,
            planSlug: PlanSlug.VT_BASE,
        };
    }
}

/**
 * Check if user has access to features available to logged-in users
 * (Features that used to be VT+ exclusive but are now free for logged-in users)
 */
export async function checkSignedInFeatureAccess(
    identifier: RequestIdentifier
): Promise<AccessCheckResult> {
    const { userId } = identifier;

    // If no user ID, they're anonymous and have no access
    if (!userId) {
        return {
            hasAccess: false,
            reason: 'Sign in required for this feature',
            subscriptionStatus: SubscriptionStatusEnum.NONE,
            planSlug: PlanSlug.VT_BASE,
        };
    }

    try {
        // Get subscription status to determine if user is properly signed in
        const subscriptionStatus = await getComprehensiveSubscriptionStatus(userId);

        // User is signed in, grant access regardless of subscription status
        return {
            hasAccess: true,
            reason: undefined,
            subscriptionStatus: subscriptionStatus.isActive
                ? SubscriptionStatusEnum.ACTIVE
                : SubscriptionStatusEnum.NONE,
            planSlug: subscriptionStatus.plan,
        };
    } catch (error) {
        log.error('Failed to check signed-in feature access:', { error });
        return {
            hasAccess: false,
            reason: 'Failed to verify user status',
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
        log.error('VT+ access enforcement failed:', { error });
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

// Rate limiting functionality removed - no longer needed
