/**
 * Subscription Access Control Service
 *
 * Replaces the credit-based system with subscription-based access control
 * for VT+ features and capabilities
 */

import { auth } from '@/lib/auth';
import { VTPlusAccess } from '@repo/shared/config/vt-plus-features';
import { PlanSlug } from '@repo/shared/types/subscription';
import { getSubscriptionStatus } from '@repo/shared/utils/subscription';
import { NextRequest } from 'next/server';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';

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
        // Get subscription status for the user
        const subscriptionStatus = await getSubscriptionStatus({ userId });

        const hasVTPlus =
            subscriptionStatus.planSlug === PlanSlug.VT_PLUS && subscriptionStatus.isActive;

        return {
            hasAccess: hasVTPlus,
            reason: hasVTPlus ? undefined : 'VT+ subscription required',
            subscriptionStatus: subscriptionStatus.isActive ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE,
            planSlug: subscriptionStatus.planSlug,
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
        feature => feature.id === featureId
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
 * This replaces the credit system with simple rate limiting
 */
export async function checkRateLimit(
    identifier: RequestIdentifier
): Promise<{ allowed: boolean; remaining?: number; resetTime?: Date }> {
    const { userId } = identifier;

    // Check if user has VT+ subscription
    const accessResult = await checkVTPlusAccess(identifier);

    // VT+ users have unlimited usage
    if (accessResult.hasAccess) {
        return { allowed: true };
    }

    // For free tier users, implement basic rate limiting
    // This is a simplified implementation - you might want to use Redis or similar for production
    const dailyLimit = process.env.FREE_TIER_DAILY_LIMIT
        ? parseInt(process.env.FREE_TIER_DAILY_LIMIT, 10)
        : 10; // Default to 10 requests per day if not configured
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(24, 0, 0, 0); // Reset at midnight

    // In a real implementation, you'd store/check this in Redis or database
    // For now, we'll allow the request and let the calling code handle limits
    return {
        allowed: true,
        remaining: dailyLimit,
        resetTime,
    };
}
