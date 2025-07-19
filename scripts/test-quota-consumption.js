#!/usr/bin/env node

/**
 * Test script to verify quota consumption logic for VT+ users
 */

import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables
config({ path: resolve(process.cwd(), "apps/web/.env.local") });

async function testQuotaConsumption() {
    console.log("Testing quota consumption logic...");

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
        console.log("\n1. Finding users with VT+ subscriptions...");
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

        console.log(`Found ${vtPlusUsers.length} users with active VT+ subscriptions`);

        if (vtPlusUsers.length > 0) {
            console.log("\nVT+ Users:");
            vtPlusUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.userEmail}`);
                console.log(`   User planSlug: ${user.planSlug}`);
                console.log(`   Subscription status: ${user.subscriptionStatus}`);
                console.log(`   Subscription plan: ${user.subscriptionPlan}`);
                console.log("");
            });
        }

        // Test 2: Test quota consumption logic
        console.log("\n2. Testing quota consumption logic...");

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
        console.log("Testing isEligibleForQuotaConsumption:");
        console.log(
            `VT+ user (${sampleVTPlusUser.planSlug}): ${isEligibleForQuotaConsumption(sampleVTPlusUser, false)}`,
        );
        console.log(
            `Free user (${sampleFreeUser.planSlug}): ${isEligibleForQuotaConsumption(sampleFreeUser, false)}`,
        );
        console.log(
            `Undefined user (${sampleUndefinedUser.planSlug}): ${isEligibleForQuotaConsumption(sampleUndefinedUser, false)}`,
        );

        // Test with BYOK key
        console.log("\nTesting with BYOK key:");
        console.log(`VT+ user with BYOK: ${isEligibleForQuotaConsumption(sampleVTPlusUser, true)}`);
        console.log(`Free user with BYOK: ${isEligibleForQuotaConsumption(sampleFreeUser, true)}`);
        console.log(
            `Undefined user with BYOK: ${isEligibleForQuotaConsumption(sampleUndefinedUser, true)}`,
        );

        // Test 3: Test with real database users
        if (vtPlusUsers.length > 0) {
            console.log("\n3. Testing with real database users...");

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

                console.log(`User ${user.userEmail}:`);
                console.log(`  Original planSlug: ${user.planSlug}`);
                console.log(`  Effective planSlug: ${userForQuota.planSlug}`);
                console.log(
                    `  Quota consumption eligible: ${isEligibleForQuotaConsumption(userForQuota, false)}`,
                );
                console.log("");
            }
        }

        console.log("✓ Quota consumption logic test completed successfully");
    } catch (error) {
        console.error("Error testing quota consumption:", error);
        throw error;
    }
}

// Run the test
testQuotaConsumption()
    .then(() => {
        console.log("\nTest completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Test failed:", error);
        process.exit(1);
    });
