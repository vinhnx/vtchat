/**
 * Enhanced subscription verification utilities for preventing duplicate subscriptions
 * Uses Neon database tools for comprehensive checks
 */

// Note: These imports will need to be provided by the consuming application
// This utility is designed to be used from API routes where database access is available
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';

export interface SubscriptionVerificationResult {
    hasActiveSubscription: boolean;
    subscriptionDetails?: {
        id: string;
        plan: string;
        status: string;
        currentPeriodEnd?: Date | null;
        creemSubscriptionId?: string | null;
        creemCustomerId?: string | null;
    };
    userPlanSlug?: string | null;
    verificationSource: 'database_subscription' | 'user_plan_slug' | 'none';
    message: string;
}

export interface DatabaseDependencies {
    db: any; // Drizzle database instance
    userSubscriptions: any; // userSubscriptions table schema
    users: any; // users table schema
    eq: any; // drizzle eq function
}

/**
 * Comprehensive verification of existing Creem subscription status
 * Checks both user_subscriptions table and users.plan_slug for complete coverage
 */
export async function verifyExistingCreemSubscription(
    userId: string,
    deps: DatabaseDependencies,
    targetPlan: PlanSlug = PlanSlug.VT_PLUS
): Promise<SubscriptionVerificationResult> {
    const { db, userSubscriptions, users, eq } = deps;

    try {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `[Subscription Verification] Checking existing subscription for user: ${userId}, target plan: ${targetPlan}`
            );
        }

        // Step 1: Check user_subscriptions table for formal subscription records
        const subscription = await db
            .select({
                id: userSubscriptions.id,
                plan: userSubscriptions.plan,
                status: userSubscriptions.status,
                currentPeriodEnd: userSubscriptions.currentPeriodEnd,
                creemSubscriptionId: userSubscriptions.creemSubscriptionId,
                creemCustomerId: userSubscriptions.creemCustomerId,
            })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        // Step 2: Check users.plan_slug as fallback
        const user = await db
            .select({
                planSlug: users.planSlug,
                creemCustomerId: users.creemCustomerId,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const userPlanSlug = user.length > 0 ? user[0].planSlug : null;
        const _userCreemCustomerId = user.length > 0 ? user[0].creemCustomerId : null;

        if (process.env.NODE_ENV === 'development') {
            console.log(
                `[Subscription Verification] Found subscription records: ${subscription.length}, user plan_slug: ${userPlanSlug}`
            );
        }

        // Step 3: Evaluate subscription status
        if (subscription.length > 0) {
            const sub = subscription[0];
            const isTargetPlan = sub.plan === targetPlan;
            const isActiveStatus = sub.status === SubscriptionStatusEnum.ACTIVE;
            const isNotExpired = !sub.currentPeriodEnd || new Date() < sub.currentPeriodEnd;
            const hasActiveSubscription = isTargetPlan && isActiveStatus && isNotExpired;

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Subscription Verification] Subscription analysis:`, {
                    plan: sub.plan,
                    status: sub.status,
                    isTargetPlan,
                    isActiveStatus,
                    isNotExpired,
                    hasActiveSubscription,
                    currentPeriodEnd: sub.currentPeriodEnd,
                });
            }

            if (hasActiveSubscription) {
                return {
                    hasActiveSubscription: true,
                    subscriptionDetails: {
                        id: sub.id,
                        plan: sub.plan,
                        status: sub.status,
                        currentPeriodEnd: sub.currentPeriodEnd,
                        creemSubscriptionId: sub.creemSubscriptionId,
                        creemCustomerId: sub.creemCustomerId,
                    },
                    userPlanSlug,
                    verificationSource: 'database_subscription',
                    message: `Active ${targetPlan} subscription found in database`,
                };
            } else {
                return {
                    hasActiveSubscription: false,
                    subscriptionDetails: {
                        id: sub.id,
                        plan: sub.plan,
                        status: sub.status,
                        currentPeriodEnd: sub.currentPeriodEnd,
                        creemSubscriptionId: sub.creemSubscriptionId,
                        creemCustomerId: sub.creemCustomerId,
                    },
                    userPlanSlug,
                    verificationSource: 'database_subscription',
                    message: `Inactive/expired ${targetPlan} subscription found in database`,
                };
            }
        }

        // Step 4: Fallback to users.plan_slug check
        if (userPlanSlug === targetPlan) {
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `[Subscription Verification] Found ${targetPlan} in user.plan_slug but no subscription record`
                );
            }

            return {
                hasActiveSubscription: true,
                userPlanSlug,
                verificationSource: 'user_plan_slug',
                message: `${targetPlan} plan found in user profile (legacy/admin-granted access)`,
            };
        }

        // Step 5: No active subscription found
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Subscription Verification] No active ${targetPlan} subscription found`);
        }
        return {
            hasActiveSubscription: false,
            userPlanSlug,
            verificationSource: 'none',
            message: `No active ${targetPlan} subscription found`,
        };
    } catch (error) {
        console.error('[Subscription Verification] Error during verification:', error);

        // In case of database errors, we should be conservative and assume no subscription
        // to prevent blocking legitimate purchases
        return {
            hasActiveSubscription: false,
            verificationSource: 'none',
            message: 'Verification failed due to database error - assuming no active subscription',
        };
    }
}

/**
 * Check if user has any Creem customer ID (useful for portal access)
 */
export async function getCreemCustomerInfo(
    userId: string,
    deps: DatabaseDependencies
): Promise<{
    customerId: string | null;
    source: 'subscription' | 'user' | 'none';
}> {
    const { db, userSubscriptions, users, eq } = deps;

    try {
        // First check user_subscriptions table
        const subscription = await db
            .select({
                creemCustomerId: userSubscriptions.creemCustomerId,
            })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        if (subscription.length > 0 && subscription[0].creemCustomerId) {
            return {
                customerId: subscription[0].creemCustomerId,
                source: 'subscription',
            };
        }

        // Fallback to users table
        const user = await db
            .select({
                creemCustomerId: users.creemCustomerId,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (user.length > 0 && user[0].creemCustomerId) {
            return {
                customerId: user[0].creemCustomerId,
                source: 'user',
            };
        }

        return {
            customerId: null,
            source: 'none',
        };
    } catch (error) {
        console.error('[Subscription Verification] Error getting Creem customer info:', error);
        return {
            customerId: null,
            source: 'none',
        };
    }
}

/**
 * Validate subscription consistency between sources
 * Useful for identifying data sync issues
 */
export async function validateSubscriptionConsistency(
    userId: string,
    deps: DatabaseDependencies
): Promise<{
    isConsistent: boolean;
    issues: string[];
    recommendations: string[];
}> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
        const verification = await verifyExistingCreemSubscription(userId, deps);

        // Check for common inconsistency patterns
        if (verification.verificationSource === 'user_plan_slug') {
            issues.push('User has VT+ in plan_slug but no subscription record');
            recommendations.push('Consider running subscription sync utility');
        }

        if (
            verification.subscriptionDetails?.status === SubscriptionStatusEnum.ACTIVE &&
            verification.subscriptionDetails?.currentPeriodEnd &&
            new Date() > verification.subscriptionDetails.currentPeriodEnd
        ) {
            issues.push('Subscription marked as active but period has ended');
            recommendations.push('Check webhook processing for period updates');
        }

        return {
            isConsistent: issues.length === 0,
            issues,
            recommendations,
        };
    } catch (error) {
        console.error('[Subscription Verification] Error during consistency check:', error);
        return {
            isConsistent: false,
            issues: ['Database error during consistency check'],
            recommendations: ['Check database connectivity and try again'],
        };
    }
}

export default {
    verifyExistingCreemSubscription,
    getCreemCustomerInfo,
    validateSubscriptionConsistency,
};
