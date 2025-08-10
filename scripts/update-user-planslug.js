#!/usr/bin/env node

/**
 * Script to update user planSlug in database to match VT+ access
 * This ensures consistency between subscription records and user.planSlug field
 */

import { log } from "@repo/shared/logger";
import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables from apps/web/.env.local
config({ path: resolve(process.cwd(), "apps/web/.env.local") });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

async function updateUserPlanSlug() {
    log.info("Starting user planSlug update...");

    try {
        // Dynamic imports to ensure env vars are loaded first
        const { db } = await import("../apps/web/lib/database/index.js");
        const { users, userSubscriptions } = await import("../apps/web/lib/database/schema.js");
        const { PlanSlug } = await import("../packages/shared/types/subscription.js");
        const { eq, and, isNull, or } = await import("drizzle-orm");
        // Find users with active VT+ subscriptions but undefined/null planSlug
        const usersWithVTPlusAccess = await db
            .select({
                userId: users.id,
                userEmail: users.email,
                currentPlanSlug: users.planSlug,
                subscriptionStatus: userSubscriptions.status,
                subscriptionPlan: userSubscriptions.plan,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
            .where(
                and(
                    // User has active VT+ subscription
                    eq(userSubscriptions.status, "active"),
                    eq(userSubscriptions.plan, PlanSlug.VT_PLUS),
                    // But user.planSlug is undefined/null or not VT_PLUS
                    or(
                        isNull(users.planSlug),
                        eq(users.planSlug, ""),
                        eq(users.planSlug, "undefined"),
                    ),
                ),
            );

        log.info(
            `Found ${usersWithVTPlusAccess.length} users with VT+ access but incorrect planSlug`,
        );

        if (usersWithVTPlusAccess.length === 0) {
            log.info("No users need updating");
            return;
        }

        // Display users to be updated
        log.info("\nUsers to update:");
        usersWithVTPlusAccess.forEach((user, index) => {
            log.info(`${index + 1}. ${user.userEmail} (ID: ${user.userId})`);
            log.info(`   Current planSlug: ${user.currentPlanSlug}`);
            log.info(`   Subscription status: ${user.subscriptionStatus}`);
            log.info(`   Subscription plan: ${user.subscriptionPlan}`);
            log.info("");
        });

        // Update users' planSlug to VT_PLUS
        let updatedCount = 0;
        for (const user of usersWithVTPlusAccess) {
            const result = await db
                .update(users)
                .set({ planSlug: PlanSlug.VT_PLUS })
                .where(eq(users.id, user.userId));

            if (result.rowCount > 0) {
                log.info(`✓ Updated user ${user.userEmail} (ID: ${user.userId})`);
                updatedCount++;
            } else {
                log.info(`✗ Failed to update user ${user.userEmail} (ID: ${user.userId})`);
            }
        }

        log.info(
            `
Update complete: ${updatedCount}/${usersWithVTPlusAccess.length} users updated`,
        );

        // Verify the updates
        log.info("Verifying updates...");
        const verificationResults = await db
            .select({
                userId: users.id,
                userEmail: users.email,
                planSlug: users.planSlug,
            })
            .from(users)
            .where(and(eq(users.planSlug, PlanSlug.VT_PLUS)));

        log.info(
            `Verification: ${verificationResults.length} users now have planSlug set to VT_PLUS`,
        );
    } catch (error) {
        log.error({ error }, "Error updating user planSlug:");
        throw error;
    }
}

// Run the script
updateUserPlanSlug()
    .then(() => {
        log.info("Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        log.error({ error }, "Script failed:");
        process.exit(1);
    });
