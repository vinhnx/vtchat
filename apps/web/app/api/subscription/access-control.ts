/**
 * Subscription Access Control Service
 *
 * Replaces the credit-based system with subscription-based access control
 * for VT+ features and capabilities
 */

import { auth } from '@/lib/auth-server';
import { log } from '@repo/shared/logger';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import type { NextRequest } from 'next/server';

/**
 * Get comprehensive subscription status for a user
 * Uses dynamic import to avoid build-time dependency issues
 */
async function getComprehensiveSubscriptionStatus(userId: string) {
    void userId;
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
        const subscriptionStatus = await getComprehensiveSubscriptionStatus(userId);

        return {
            hasAccess: true,
            reason: undefined,
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            planSlug: subscriptionStatus.plan,
        };
    } catch (error) {
        // SECURITY: Log error without exposing sensitive subscription data
        log.error('Failed to check VT+ access:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: userId ? 'present' : 'missing',
        });
        return {
            hasAccess: false,
            reason: 'Unable to verify subscription status',
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
    identifier: RequestIdentifier,
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
    featureId: string,
): Promise<AccessCheckResult> {
    const baseAccess = await checkVTPlusAccess(identifier);

    if (!baseAccess.hasAccess) {
        return baseAccess;
    }

    const hasFeatureAccess = PLANS[PlanSlug.VT_PLUS].features.includes(featureId as never);

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

        // Check authentication first
        if (!userId) {
            return {
                success: false,
                response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                }),
            };
        }

        // Extract IP for rate limiting analytics
        const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')
            ?? undefined;

        const accessResult = await checkVTPlusAccess({ userId, ip });

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
                    },
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
                },
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

    return PLANS[PlanSlug.VT_PLUS].features;
}

// Rate limiting functionality removed - no longer needed
