/**
 * Centralized subscription service to prevent data integrity issues
 * This service ensures only one active subscription per user
 */

import { log } from "@repo/shared/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/database";
import { type NewUserSubscription, userSubscriptions, users } from "@/lib/database/schema";
import { invalidateUserCaches } from "@/lib/subscription/fast-subscription-access";

export class DuplicateActiveSubscriptionError extends Error {
    constructor(userId: string, existingSubscriptions: string[]) {
        super(
            `User ${userId} has multiple active subscriptions: ${existingSubscriptions.join(", ")}`,
        );
        this.name = "DuplicateActiveSubscriptionError";
    }
}

export class SubscriptionService {
    /**
     * Safely upsert a subscription - prevents duplicates and ensures consistency
     */
    static async upsertSubscription(
        userId: string,
        subscriptionData: Omit<NewUserSubscription, "userId">,
    ): Promise<string> {
        return await db.transaction(async (tx) => {
            try {
                // 1. Check for existing active subscriptions
                const existingActive = await tx
                    .select({ id: userSubscriptions.id })
                    .from(userSubscriptions)
                    .where(
                        and(
                            eq(userSubscriptions.userId, userId),
                            inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                        ),
                    );

                // 2. If creating a new active subscription and there are existing ones, cancel them first
                if (
                    subscriptionData.status &&
                    ["active", "trialing", "past_due"].includes(subscriptionData.status) &&
                    existingActive.length > 0
                ) {
                    log.warn("Canceling existing active subscriptions before creating new one", {
                        userId,
                        existingSubscriptions: existingActive.map((s) => s.id),
                        newSubscriptionData: subscriptionData,
                    });

                    // Cancel existing active subscriptions
                    await tx
                        .update(userSubscriptions)
                        .set({
                            status: SubscriptionStatusEnum.CANCELED,
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(userSubscriptions.userId, userId),
                                inArray(userSubscriptions.status, [
                                    "active",
                                    "trialing",
                                    "past_due",
                                ]),
                            ),
                        );
                }

                // 3. Insert or update subscription
                let subscriptionId: string;

                if (subscriptionData.creemSubscriptionId) {
                    // Try to update existing subscription with same Creem ID
                    const existing = await tx
                        .select({ id: userSubscriptions.id })
                        .from(userSubscriptions)
                        .where(
                            eq(
                                userSubscriptions.creemSubscriptionId,
                                subscriptionData.creemSubscriptionId,
                            ),
                        )
                        .limit(1);

                    if (existing.length > 0) {
                        // Update existing
                        await tx
                            .update(userSubscriptions)
                            .set({
                                ...subscriptionData,
                                userId,
                                updatedAt: new Date(),
                            })
                            .where(eq(userSubscriptions.id, existing[0].id));
                        subscriptionId = existing[0].id;
                    } else {
                        // Create new
                        const result = await tx
                            .insert(userSubscriptions)
                            .values({
                                ...subscriptionData,
                                userId,
                                id: crypto.randomUUID(),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })
                            .returning({ id: userSubscriptions.id });
                        subscriptionId = result[0].id;
                    }
                } else {
                    // Create new subscription without Creem ID
                    const result = await tx
                        .insert(userSubscriptions)
                        .values({
                            ...subscriptionData,
                            userId,
                            id: crypto.randomUUID(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .returning({ id: userSubscriptions.id });
                    subscriptionId = result[0].id;
                }

                // 4. Update users.plan_slug to match the subscription
                const planSlug =
                    subscriptionData.plan === PlanSlug.VT_PLUS
                        ? PlanSlug.VT_PLUS
                        : PlanSlug.VT_BASE;
                await tx
                    .update(users)
                    .set({
                        planSlug,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));

                log.info("Subscription upserted successfully", {
                    userId,
                    subscriptionId,
                    plan: subscriptionData.plan,
                    status: subscriptionData.status,
                });

                return subscriptionId;
            } catch (error) {
                log.error("Failed to upsert subscription", { userId, error, subscriptionData });
                throw error;
            }
        });
    }

    /**
     * Validate subscription data integrity for a user
     */
    static async validateUserSubscriptions(userId: string): Promise<{
        isValid: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];

        try {
            // Check for multiple active subscriptions
            const activeSubscriptions = await db
                .select({
                    id: userSubscriptions.id,
                    status: userSubscriptions.status,
                    plan: userSubscriptions.plan,
                })
                .from(userSubscriptions)
                .where(
                    and(
                        eq(userSubscriptions.userId, userId),
                        inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                    ),
                );

            if (activeSubscriptions.length > 1) {
                issues.push(
                    `Multiple active subscriptions found: ${activeSubscriptions.map((s) => s.id).join(", ")}`,
                );
            }

            // Check users.plan_slug consistency
            const user = await db
                .select({ planSlug: users.planSlug })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (user.length > 0 && activeSubscriptions.length > 0) {
                const userPlanSlug = user[0].planSlug;
                const subscriptionPlan = activeSubscriptions[0].plan;

                const expectedPlanSlug =
                    subscriptionPlan === PlanSlug.VT_PLUS ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;

                if (userPlanSlug !== expectedPlanSlug) {
                    issues.push(
                        `users.plan_slug (${userPlanSlug}) doesn't match subscription plan (${subscriptionPlan})`,
                    );
                }
            }

            return {
                isValid: issues.length === 0,
                issues,
            };
        } catch (error) {
            log.error("Failed to validate user subscriptions", { userId, error });
            return {
                isValid: false,
                issues: [
                    `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                ],
            };
        }
    }

    /**
     * Fix subscription data integrity issues for a user
     */
    static async fixUserSubscriptions(userId: string): Promise<void> {
        const validation = await SubscriptionService.validateUserSubscriptions(userId);

        if (validation.isValid) {
            log.info("User subscriptions are already valid", { userId });
            return;
        }

        log.warn("Fixing subscription data integrity issues", {
            userId,
            issues: validation.issues,
        });

        await db.transaction(async (tx) => {
            // Get all active subscriptions
            const activeSubscriptions = await tx
                .select()
                .from(userSubscriptions)
                .where(
                    and(
                        eq(userSubscriptions.userId, userId),
                        inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                    ),
                )
                .orderBy(userSubscriptions.currentPeriodEnd, userSubscriptions.updatedAt);

            if (activeSubscriptions.length > 1) {
                // Keep the most recent one, cancel others
                const keepSubscription = activeSubscriptions[activeSubscriptions.length - 1];
                const cancelSubscriptions = activeSubscriptions.slice(0, -1);

                log.info("Keeping most recent subscription, canceling others", {
                    userId,
                    keeping: keepSubscription.id,
                    canceling: cancelSubscriptions.map((s) => s.id),
                });

                await tx
                    .update(userSubscriptions)
                    .set({
                        status: SubscriptionStatusEnum.CANCELED,
                        updatedAt: new Date(),
                    })
                    .where(
                        inArray(
                            userSubscriptions.id,
                            cancelSubscriptions.map((s) => s.id),
                        ),
                    );

                // Update users.plan_slug to match the kept subscription
                const planSlug =
                    keepSubscription.plan === PlanSlug.VT_PLUS
                        ? PlanSlug.VT_PLUS
                        : PlanSlug.VT_BASE;
                await tx
                    .update(users)
                    .set({
                        planSlug,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            }
        });

        // Invalidate caches after fixing
        await invalidateUserCaches(userId);

        log.info("Fixed subscription data integrity issues", { userId });
    }
}
