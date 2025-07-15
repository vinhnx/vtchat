/**
 * Subscription monitoring and alerting system
 * Detects data integrity issues and subscription mismatches
 */

import { log } from "@repo/shared/logger";
import { eq, sql, inArray, and } from "drizzle-orm";
import { db } from "@/lib/database";
import { userSubscriptions, users } from "@/lib/database/schema";
import { SubscriptionService } from "@/lib/services/subscription-service";

interface SubscriptionMetrics {
    totalUsers: number;
    vtPlusUsers: number;
    duplicateActiveSubscriptions: number;
    planSlugMismatches: number;
    expiredButActiveSubscriptions: number;
}

export class SubscriptionMonitoring {
    /**
     * Get comprehensive subscription metrics for monitoring
     */
    static async getMetrics(): Promise<SubscriptionMetrics> {
        try {
            // 1. Get total users and VT+ users
            const userStats = await db
                .select({
                    totalUsers: sql<number>`COUNT(*)`,
                    vtPlusUsers: sql<number>`COUNT(*) FILTER (WHERE plan_slug = 'vt_plus')`,
                })
                .from(users);

            // 2. Find users with duplicate active subscriptions
            const duplicateActiveQuery = await db
                .select({
                    userId: userSubscriptions.userId,
                    count: sql<number>`COUNT(*)`,
                })
                .from(userSubscriptions)
                .where(inArray(userSubscriptions.status, ["active", "trialing", "past_due"]))
                .groupBy(userSubscriptions.userId)
                .having(sql`COUNT(*) > 1`);

            // 3. Find plan_slug mismatches
            const mismatchQuery = await db
                .select({
                    userId: users.id,
                    userPlanSlug: users.planSlug,
                    subscriptionPlan: userSubscriptions.plan,
                })
                .from(users)
                .innerJoin(
                    userSubscriptions,
                    and(
                        eq(users.id, userSubscriptions.userId),
                        inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                    ),
                )
                .where(sql`
                    (user_subscriptions.plan = 'vt_plus' AND users.plan_slug != 'vt_plus') OR
                    (user_subscriptions.plan = 'vt_base' AND users.plan_slug != 'vt_base')
                `);

            // 4. Find subscriptions that are active but expired
            const expiredActiveQuery = await db
                .select({
                    id: userSubscriptions.id,
                    userId: userSubscriptions.userId,
                })
                .from(userSubscriptions)
                .where(
                    and(
                        inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                        sql`current_period_end < NOW()`,
                    ),
                );

            const metrics: SubscriptionMetrics = {
                totalUsers: userStats[0]?.totalUsers || 0,
                vtPlusUsers: userStats[0]?.vtPlusUsers || 0,
                duplicateActiveSubscriptions: duplicateActiveQuery.length,
                planSlugMismatches: mismatchQuery.length,
                expiredButActiveSubscriptions: expiredActiveQuery.length,
            };

            // Log critical issues
            if (metrics.duplicateActiveSubscriptions > 0) {
                log.error("CRITICAL: Users with duplicate active subscriptions detected", {
                    count: metrics.duplicateActiveSubscriptions,
                    users: duplicateActiveQuery.map((u) => u.userId),
                });
            }

            if (metrics.planSlugMismatches > 0) {
                log.error("CRITICAL: Plan slug mismatches detected", {
                    count: metrics.planSlugMismatches,
                    mismatches: mismatchQuery.map((m) => ({
                        userId: m.userId,
                        userPlanSlug: m.userPlanSlug,
                        subscriptionPlan: m.subscriptionPlan,
                    })),
                });
            }

            if (metrics.expiredButActiveSubscriptions > 0) {
                log.warn("Expired but active subscriptions detected", {
                    count: metrics.expiredButActiveSubscriptions,
                    subscriptions: expiredActiveQuery.map((s) => ({
                        id: s.id,
                        userId: s.userId,
                    })),
                });
            }

            return metrics;
        } catch (error) {
            log.error("Failed to get subscription metrics", { error });
            throw error;
        }
    }

    /**
     * Health check for subscription system integrity
     */
    static async healthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        metrics: SubscriptionMetrics;
    }> {
        const issues: string[] = [];

        try {
            const metrics = await this.getMetrics();

            // Define health thresholds
            if (metrics.duplicateActiveSubscriptions > 0) {
                issues.push(
                    `${metrics.duplicateActiveSubscriptions} users have duplicate active subscriptions`,
                );
            }

            if (metrics.planSlugMismatches > 5) {
                issues.push(
                    `${metrics.planSlugMismatches} users have plan_slug mismatches (threshold: 5)`,
                );
            }

            if (metrics.expiredButActiveSubscriptions > 10) {
                issues.push(
                    `${metrics.expiredButActiveSubscriptions} subscriptions are expired but still active (threshold: 10)`,
                );
            }

            return {
                healthy: issues.length === 0,
                issues,
                metrics,
            };
        } catch (error) {
            log.error("Health check failed", { error });
            return {
                healthy: false,
                issues: [
                    `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                ],
                metrics: {
                    totalUsers: 0,
                    vtPlusUsers: 0,
                    duplicateActiveSubscriptions: 0,
                    planSlugMismatches: 0,
                    expiredButActiveSubscriptions: 0,
                },
            };
        }
    }

    /**
     * Automated fix for detected issues
     */
    static async autoFixIssues(): Promise<{
        fixed: number;
        failed: number;
        errors: string[];
    }> {
        const errors: string[] = [];
        let fixed = 0;
        let failed = 0;

        try {
            // Get users with duplicate active subscriptions
            const duplicates = await db
                .select({
                    userId: userSubscriptions.userId,
                })
                .from(userSubscriptions)
                .where(inArray(userSubscriptions.status, ["active", "trialing", "past_due"]))
                .groupBy(userSubscriptions.userId)
                .having(sql`COUNT(*) > 1`);

            log.info("Starting auto-fix for subscription issues", {
                duplicateUsers: duplicates.length,
            });

            // Fix each user's subscriptions
            for (const { userId } of duplicates) {
                try {
                    await SubscriptionService.fixUserSubscriptions(userId);
                    fixed++;
                    log.info("Fixed subscription issues for user", { userId });
                } catch (error) {
                    failed++;
                    const errorMsg = `Failed to fix user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`;
                    errors.push(errorMsg);
                    log.error("Failed to fix subscription issues", { userId, error });
                }
            }

            log.info("Auto-fix completed", { fixed, failed, errors: errors.length });

            return { fixed, failed, errors };
        } catch (error) {
            log.error("Auto-fix process failed", { error });
            return {
                fixed: 0,
                failed: 0,
                errors: [
                    `Auto-fix failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                ],
            };
        }
    }

    /**
     * Test subscription access for a synthetic VT+ user (canary monitoring)
     */
    static async canaryCheck(testUserId: string): Promise<{
        success: boolean;
        error?: string;
        responseTime: number;
    }> {
        const startTime = Date.now();

        try {
            // Simulate the subscription status API call
            const userResult = await db
                .select({ planSlug: users.planSlug })
                .from(users)
                .where(eq(users.id, testUserId))
                .limit(1);

            const subscriptionResult = await db
                .select({
                    plan: userSubscriptions.plan,
                    status: userSubscriptions.status,
                    currentPeriodEnd: userSubscriptions.currentPeriodEnd,
                })
                .from(userSubscriptions)
                .where(
                    and(
                        eq(userSubscriptions.userId, testUserId),
                        inArray(userSubscriptions.status, ["active", "trialing", "past_due"]),
                    ),
                )
                .limit(1);

            const responseTime = Date.now() - startTime;

            // Validate expected VT+ access
            if (subscriptionResult.length === 0) {
                return {
                    success: false,
                    error: "No active subscription found for canary user",
                    responseTime,
                };
            }

            const subscription = subscriptionResult[0];
            if (subscription.plan !== "vt_plus") {
                return {
                    success: false,
                    error: `Expected vt_plus plan, got ${subscription.plan}`,
                    responseTime,
                };
            }

            if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
                return {
                    success: false,
                    error: "Canary subscription is expired",
                    responseTime,
                };
            }

            return {
                success: true,
                responseTime,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                responseTime: Date.now() - startTime,
            };
        }
    }
}


