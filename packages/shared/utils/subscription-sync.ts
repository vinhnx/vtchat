/**
 * Server-side subscription utilities
 * Functions for syncing and managing subscription data between different sources
 */

import { db } from '@/lib/database';
import { users, userSubscriptions } from '@/lib/database/schema';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { and, eq, isNull } from 'drizzle-orm';

export interface SubscriptionSyncResult {
    success: boolean;
    message: string;
    usersUpdated?: number;
    errors?: string[];
}

/**
 * Sync subscription data between users.plan_slug and user_subscriptions table
 * This ensures consistency between the two sources of subscription truth
 */
export async function syncUserSubscriptionData(): Promise<SubscriptionSyncResult> {
    try {
        // Find users with vt_plus plan_slug but no subscription record
        const usersWithoutSubscriptions = await db
            .select({
                id: users.id,
                email: users.email,
                planSlug: users.planSlug,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId) as any)
            .where(and(eq(users.planSlug, PlanSlug.VT_PLUS), isNull(userSubscriptions.id)));

        if (usersWithoutSubscriptions.length === 0) {
            return {
                success: true,
                message: 'All users with vt_plus plan_slug already have subscription records',
                usersUpdated: 0,
            };
        }

        const errors: string[] = [];
        let successCount = 0;

        // Create subscription records for these users
        for (const user of usersWithoutSubscriptions) {
            try {
                const subscriptionData = {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    plan: PlanSlug.VT_PLUS,
                    status: SubscriptionStatusEnum.ACTIVE,
                    creditsRemaining: 1000,
                    creditsUsed: 0,
                    monthlyCredits: 1000,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await db.insert(userSubscriptions).values(subscriptionData);
                successCount++;
            } catch (error) {
                const errorMsg = `Failed to create subscription for ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                errors.push(errorMsg);
                console.error(errorMsg);
            }
        }

        return {
            success: errors.length === 0,
            message: `Successfully synced ${successCount} subscription records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
            usersUpdated: successCount,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        const errorMsg = `Error syncing subscription data: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        return {
            success: false,
            message: errorMsg,
            usersUpdated: 0,
            errors: [errorMsg],
        };
    }
}

/**
 * Update user plan_slug based on their active subscription
 * This syncs the opposite direction: from user_subscriptions to users.plan_slug
 */
export async function syncUserPlanSlugFromSubscription(
    userId: string
): Promise<SubscriptionSyncResult> {
    try {
        // Get user's current subscription
        const subscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        if (subscription.length === 0) {
            // No subscription found, set to free
            await db
                .update(users)
                .set({
                    planSlug: PlanSlug.VT_BASE,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            return {
                success: true,
                message: 'Updated user plan_slug to free (no active subscription)',
                usersUpdated: 1,
            };
        }

        const sub = subscription[0];
        const isActive =
            sub.status === SubscriptionStatusEnum.ACTIVE &&
            (!sub.currentPeriodEnd || new Date() <= sub.currentPeriodEnd);

        const newPlanSlug =
            isActive && sub.plan === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;

        await db
            .update(users)
            .set({
                planSlug: newPlanSlug,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return {
            success: true,
            message: `Updated user plan_slug to ${newPlanSlug}`,
            usersUpdated: 1,
        };
    } catch (error) {
        const errorMsg = `Error syncing plan_slug for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        return {
            success: false,
            message: errorMsg,
            usersUpdated: 0,
            errors: [errorMsg],
        };
    }
}

/**
 * Get comprehensive subscription status for a user
 * This checks both sources and returns the most accurate status
 */
export async function getComprehensiveSubscriptionStatus(userId: string) {
    try {
        // Get both user plan_slug and subscription data
        const userResult = await db
            .select({
                planSlug: users.planSlug,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const subscriptionResult = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        const userPlanSlug = userResult.length > 0 ? userResult[0].planSlug : null;
        const subscription = subscriptionResult.length > 0 ? subscriptionResult[0] : null;

        // Determine the authoritative plan
        let finalPlan: PlanSlug;
        let source: 'subscription' | 'user_plan' | 'default';
        let isActive = false;
        let expiresAt: Date | null = null;

        if (subscription) {
            // Subscription data takes precedence
            finalPlan =
                subscription.plan === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
            isActive =
                subscription.status === SubscriptionStatusEnum.ACTIVE &&
                (!subscription.currentPeriodEnd || new Date() <= subscription.currentPeriodEnd);
            expiresAt = subscription.currentPeriodEnd;
            source = 'subscription';
        } else if (userPlanSlug === PlanSlug.VT_PLUS) {
            // Fallback to user plan_slug if no subscription but user has vt_plus
            finalPlan = PlanSlug.VT_PLUS;
            isActive = true; // Assume active if explicitly set in plan_slug
            source = 'user_plan';
        } else {
            // Default to free
            finalPlan = PlanSlug.VT_BASE;
            isActive = true; // Free tier is always active
            source = 'default';
        }

        return {
            plan: finalPlan,
            isActive,
            expiresAt,
            source,
            hasDbSubscription: !!subscription,
            userPlanSlug,
            needsSync: subscription ? false : userPlanSlug === PlanSlug.VT_PLUS,
        };
    } catch (error) {
        console.error('Error getting comprehensive subscription status:', error);
        throw error;
    }
}

export default {
    syncUserSubscriptionData,
    syncUserPlanSlugFromSubscription,
    getComprehensiveSubscriptionStatus,
};
