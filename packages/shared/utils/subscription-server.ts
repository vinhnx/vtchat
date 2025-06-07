/**
 * VT Chat Server-side Subscription Utilities
 *
 * Server-side utilities for checking subscription access in API routes and server components.
 * Works with Better Auth's server-side authentication.
 */

import { auth } from '@/lib/auth';
import { getUserWithSubscription } from '@/lib/database/queries';
import { NextRequest, NextResponse } from 'next/server';
import { AccessCheckOptions, FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, getUserSubscription } from '../utils/subscription';
import { isDevTestMode } from './dev-test-mode';

/**
 * Server-side subscription access check using Better Auth.
 * Use this in API routes and server components.
 */
export async function serverHasAccess(
    options: AccessCheckOptions,
    headers?: Headers
): Promise<boolean> {
    // DEV TEST MODE: Bypass server-side subscription checks
    if (isDevTestMode()) {
        console.log('🚧 DEV TEST MODE: Bypassing server-side access check', options);
        return true;
    }

    const session = await auth.api.getSession({ headers });

    if (!session?.user?.id) {
        return false;
    }

    const userWithSub = await getUserWithSubscription(session.user.id);
    if (!userWithSub) return false;

    // Mock has function similar to Better Auth's format for compatibility
    const has = (options: any) => {
        const subscription = userWithSub.user_subscriptions;
        if (!subscription) return false;

        if (options.plan) {
            return subscription.plan === options.plan;
        }

        // Add feature checks based on plan
        return subscription.plan !== 'free';
    };

    // Use unified subscription access check
    return checkSubscriptionAccess(has, options);
}

/**
 * Check feature access on server-side
 */
export async function serverHasFeature(feature: FeatureSlug, headers?: Headers): Promise<boolean> {
    return serverHasAccess({ feature }, headers);
}

/**
 * Check plan access on server-side
 */
export async function serverHasPlan(plan: PlanSlug, headers?: Headers): Promise<boolean> {
    return serverHasAccess({ plan }, headers);
}

/**
 * Get user subscription on server-side
 */
export async function getServerUserSubscription(headers?: Headers) {
    try {
        const session = await auth.api.getSession({ headers });
        if (!session?.user?.id) return null;

        const userWithSub = await getUserWithSubscription(session.user.id);
        return getUserSubscription(userWithSub?.users || null);
    } catch (error) {
        console.error('Error getting server-side subscription:', error);
        return getUserSubscription(null);
    }
}

/**
 * Middleware for protecting API routes with subscription checks
 */
export function withSubscriptionAuth(
    handler: (req: NextRequest, user: any, subscription: any) => Promise<NextResponse>,
    options: AccessCheckOptions
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            const { userId, has } = await auth(); // Corrected: await auth()

            if (!userId) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            // Check permission using unified subscription access
            const hasPermission = checkSubscriptionAccess(has, options);

            if (!hasPermission) {
                const user = await currentUser(); // Fetch user for details in error response
                // getUserSubscription is used here to get current plan details for the error message.
                const subscription = getUserSubscription(user);
                return NextResponse.json(
                    {
                        error: 'Subscription required',
                        currentPlan: subscription.planSlug,
                        requiredFeature: options.feature,
                        requiredPlan: options.plan,
                    },
                    { status: 403 }
                );
            }

            const user = await currentUser(); // Fetch user to pass to handler
            // getUserSubscription is used here to get subscription details to pass to the handler.
            const subscriptionForHandler = getUserSubscription(user);
            return handler(req, user, subscriptionForHandler);
        } catch (error) {
            console.error('Subscription auth middleware error:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

/**
 * Middleware for protecting API routes with feature checks
 */
export function withFeatureAuth(
    handler: (req: NextRequest, user: any, subscription: any) => Promise<NextResponse>,
    feature: FeatureSlug
) {
    return withSubscriptionAuth(handler, { feature });
}

/**
 * Middleware for protecting API routes with plan checks
 */
export function withPlanAuth(
    handler: (req: NextRequest, user: any, subscription: any) => Promise<NextResponse>,
    plan: PlanSlug
) {
    return withSubscriptionAuth(handler, { plan });
}

/**
 * Higher-order function for protecting server actions
 */
export function protectServerAction<T extends any[], R>(
    action: (...args: T) => Promise<R>,
    options: AccessCheckOptions
): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
        const hasPermission = await serverHasAccess(options);

        if (!hasPermission) {
            throw new Error(`Access denied. Required: ${JSON.stringify(options)}`);
        }

        return action(...args);
    };
}

/**
 * Protect server action with feature check
 */
export function protectWithFeature<T extends any[], R>(
    action: (...args: T) => Promise<R>,
    feature: FeatureSlug
): (...args: T) => Promise<R> {
    return protectServerAction(action, { feature });
}

/**
 * Protect server action with plan check
 */
export function protectWithPlan<T extends any[], R>(
    action: (...args: T) => Promise<R>,
    plan: PlanSlug
): (...args: T) => Promise<R> {
    return protectServerAction(action, { plan });
}

/**
 * Get auth and subscription info for server components
 */
export async function getServerAuthInfo() {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        const subscription = getUserSubscription(user);

        return {
            userId,
            user,
            subscription,
            isAuthenticated: !!userId,
            isSignedIn: !!user,
        };
    } catch (error) {
        console.error('Error getting server auth info:', error);
        return {
            userId: null,
            user: null,
            subscription: getUserSubscription(null),
            isAuthenticated: false,
            isSignedIn: false,
        };
    }
}

/**
 * Check if server request has required subscription access
 * Returns detailed access information
 */
export async function checkServerAccess(options: AccessCheckOptions) {
    const authInfo = await getServerAuthInfo();
    // serverHasAccess is already refactored to use auth().has()
    const hasPermission = await serverHasAccess(options);

    return {
        ...authInfo,
        hasAccess: hasPermission,
        accessOptions: options,
    };
}

/**
 * Response helpers for subscription-related errors
 */
export const SubscriptionResponses = {
    authRequired: () => NextResponse.json({ error: 'Authentication required' }, { status: 401 }),

    subscriptionRequired: (currentPlan: PlanSlug, required: AccessCheckOptions) =>
        NextResponse.json(
            {
                error: 'Subscription upgrade required',
                currentPlan,
                required,
            },
            { status: 403 }
        ),

    featureNotAvailable: (feature: FeatureSlug) =>
        NextResponse.json(
            {
                error: 'Feature not available in current plan',
                feature,
            },
            { status: 403 }
        ),

    planUpgradeRequired: (currentPlan: PlanSlug, requiredPlan: PlanSlug) =>
        NextResponse.json(
            {
                error: 'Plan upgrade required',
                currentPlan,
                requiredPlan,
            },
            { status: 403 }
        ),
};

export default {
    serverHasAccess,
    serverHasFeature,
    serverHasPlan,
    getServerUserSubscription,
    withSubscriptionAuth,
    withFeatureAuth,
    withPlanAuth,
    protectServerAction,
    protectWithFeature,
    protectWithPlan,
    getServerAuthInfo,
    checkServerAccess,
    SubscriptionResponses,
};
