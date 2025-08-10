#!/usr/bin/env node

/**
 * Test script to verify quota consumption logic for VT+ users
 */

import { log } from "@repo/shared/logger";
import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables
config({ path: resolve(process.cwd(), "apps/web/.env.local") });

async function testQuotaConsumption() {
    log.info("Testing quota consumption logic...");

    try {
        // Import modules
        const { db } = await import("../apps/web/lib/database/index.js");
        const { users, userSubscriptions } = await import("../apps/web/lib/database/schema.js");
        const { PlanSlug } = await import("../packages/shared/types/subscription.js");
        const { isEligibleForQuotaConsumption } = await import(
            "../packages/shared/utils/access-control.js"
        );
        const { eq, and } = await import("drizzle-orm");

        // Test 1: Find users with VT+ subscriptions
        log.info("1. Finding users with VT+ subscriptions...");
        const vtPlusUsers = await db
            .select({
                userId: users.id,
                userEmail: users.email,
                planSlug: users.planSlug,
                subscriptionStatus: userSubscriptions.status,
                subscriptionPlan: userSubscriptions.plan,
            })
            .from(users)
            .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
            .where(
                and(
                    eq(userSubscriptions.status, "active"),
                    eq(userSubscriptions.plan, PlanSlug.VT_PLUS),
                ),
            );

        log.info(`Found ${vtPlusUsers.length} users with active VT+ subscriptions`);

        if (vtPlusUsers.length > 0) {
            log.info("\nVT+ Users:");
            vtPlusUsers.forEach((user, index) => {
                log.info(`${index + 1}. ${user.userEmail}`);
                log.info(`   User planSlug: ${user.planSlug}`);
                log.info(`   Subscription status: ${user.subscriptionStatus}`);
                log.info(`   Subscription plan: ${user.subscriptionPlan}`);
                log.info("");
            });
        }

        // Test 2: Test quota consumption logic
        log.info("2. Testing quota consumption logic...");

        // Test with sample user object having VT+ plan
        const sampleVTPlusUser = {
            id: "test-user-id",
            planSlug: PlanSlug.VT_PLUS,
            email: "test@example.com",
        };

        const sampleFreeUser = {
            id: "test-user-id-2",
            planSlug: PlanSlug.VT_BASE,
            email: "test2@example.com",
        };

        const sampleUndefinedUser = {
            id: "test-user-id-3",
            planSlug: undefined,
            email: "test3@example.com",
        };

        // Test quota consumption eligibility
        log.info("Testing isEligibleForQuotaConsumption:");
        log.info(
            `VT+ user (${sampleVTPlusUser.planSlug}): ${isEligibleForQuotaConsumption(sampleVTPlusUser, false)}`,
        );
        log.info(
            `Free user (${sampleFreeUser.planSlug}): ${isEligibleForQuotaConsumption(sampleFreeUser, false)}`,
        );
        log.info(
            `Undefined user (${sampleUndefinedUser.planSlug}): ${isEligibleForQuotaConsumption(sampleUndefinedUser, false)}`,
        );

        // Test with BYOK key
        log.info("\nTesting with BYOK key:");
        log.info(`VT+ user with BYOK: ${isEligibleForQuotaConsumption(sampleVTPlusUser, true)}`);
        log.info(`Free user with BYOK: ${isEligibleForQuotaConsumption(sampleFreeUser, true)}`);
        log.info(
            `Undefined user with BYOK: ${isEligibleForQuotaConsumption(sampleUndefinedUser, true)}`,
        );

        // Test 3: Test with real database users
        if (vtPlusUsers.length > 0) {
            log.info("3. Testing with real database users...");

            for (const user of vtPlusUsers.slice(0, 3)) {
                // Test first 3 users
                const userForQuota = {
                    id: user.userId,
                    planSlug:
                        user.planSlug ||
                        (user.subscriptionPlan === PlanSlug.VT_PLUS
                            ? PlanSlug.VT_PLUS
                            : user.planSlug),
                    email: user.userEmail,
                };

                log.info(`User ${user.userEmail}:`);
                log.info(`  Original planSlug: ${user.planSlug}`);
                log.info(`  Effective planSlug: ${userForQuota.planSlug}`);
                log.info(
                    `  Quota consumption eligible: ${isEligibleForQuotaConsumption(userForQuota, false)}`,
                );
                log.info("");
            }
        }

        log.info("✓ Quota consumption logic test completed successfully");
    } catch (error) {
        log.error("Error testing quota consumption:", error);
        throw error;
    }
}

// Run the test
testQuotaConsumption()
    .then(() => {
        log.info("Test completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        log.error("Test failed:", error);
        process.exit(1);
    });
