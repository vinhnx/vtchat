import { db, schema } from "@repo/shared/lib/database";
import { and, eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { VtPlusFeature } from "../src/config/vtPlusLimits";
import { consumeQuota, getUsage } from "../src/lib/vtplusRateLimiter";

describe("VT+ Quota Concurrency Tests", () => {
    const testUserId = "test-user-concurrency";
    const testFeature = VtPlusFeature.DEEP_RESEARCH;

    // Skip tests if no real database connection is available
    const hasDatabase =
        process.env.NODE_ENV === "test" &&
        process.env.DATABASE_URL &&
        !process.env.DATABASE_URL.includes("localhost");

    beforeAll(() => {
        if (!hasDatabase) {
            // These tests require a real database connection
            return;
        }
    });

    beforeEach(async () => {
        // Clean up any existing test data
        await db
            .delete(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, testUserId),
                    eq(schema.vtplusUsage.feature, testFeature),
                ),
            );
    });

    afterEach(async () => {
        // Clean up test data
        await db
            .delete(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, testUserId),
                    eq(schema.vtplusUsage.feature, testFeature),
                ),
            );
    });

    it("should handle 20 parallel consumeQuota calls without race conditions", async () => {
        if (!hasDatabase) {
            return; // Skip if no database available
        }

        const concurrentCalls = 20;
        const amountPerCall = 1;
        const expectedTotal = concurrentCalls * amountPerCall;

        // Create 20 parallel consumeQuota calls
        const promises = Array.from({ length: concurrentCalls }, () =>
            consumeQuota({
                userId: testUserId,
                feature: testFeature,
                amount: amountPerCall,
            }),
        );

        // Execute all calls in parallel
        await Promise.all(promises);

        // Verify the final usage count
        const usage = await getUsage({
            userId: testUserId,
            feature: testFeature,
        });

        expect(usage.used).toBe(expectedTotal);
        expect(usage.feature).toBe(testFeature);

        // Verify there's only one row in the database (no duplicates)
        const rows = await db
            .select()
            .from(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, testUserId),
                    eq(schema.vtplusUsage.feature, testFeature),
                ),
            );

        expect(rows).toHaveLength(1);
        expect(rows[0].used).toBe(expectedTotal);
    }, 30000); // 30 second timeout for the test

    it("should handle mixed amounts in parallel calls", async () => {
        const calls = [
            { amount: 1 },
            { amount: 3 },
            { amount: 2 },
            { amount: 5 },
            { amount: 1 },
            { amount: 4 },
            { amount: 2 },
            { amount: 3 },
            { amount: 1 },
            { amount: 2 },
        ];
        const expectedTotal = calls.reduce((sum, call) => sum + call.amount, 0);

        // Create parallel consumeQuota calls with different amounts
        const promises = calls.map((call) =>
            consumeQuota({
                userId: testUserId,
                feature: testFeature,
                amount: call.amount,
            }),
        );

        // Execute all calls in parallel
        await Promise.all(promises);

        // Verify the final usage count
        const usage = await getUsage({
            userId: testUserId,
            feature: testFeature,
        });

        expect(usage.used).toBe(expectedTotal);

        // Verify there's only one row in the database
        const rows = await db
            .select()
            .from(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, testUserId),
                    eq(schema.vtplusUsage.feature, testFeature),
                ),
            );

        expect(rows).toHaveLength(1);
        expect(rows[0].used).toBe(expectedTotal);
    }, 30000);

    it("should handle extremely high concurrency (50 calls)", async () => {
        const concurrentCalls = 50;
        const amountPerCall = 2;
        const expectedTotal = concurrentCalls * amountPerCall;

        // Create 50 parallel consumeQuota calls
        const promises = Array.from({ length: concurrentCalls }, () =>
            consumeQuota({
                userId: testUserId,
                feature: testFeature,
                amount: amountPerCall,
            }),
        );

        // Execute all calls in parallel
        await Promise.all(promises);

        // Verify the final usage count
        const usage = await getUsage({
            userId: testUserId,
            feature: testFeature,
        });

        expect(usage.used).toBe(expectedTotal);

        // Verify there's only one row in the database
        const rows = await db
            .select()
            .from(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, testUserId),
                    eq(schema.vtplusUsage.feature, testFeature),
                ),
            );

        expect(rows).toHaveLength(1);
        expect(rows[0].used).toBe(expectedTotal);
    }, 60000); // 60 second timeout for high concurrency test

    it("should handle concurrent calls for different features", async () => {
        const features = [VtPlusFeature.DEEP_RESEARCH, VtPlusFeature.PRO_SEARCH, VtPlusFeature.RAG];
        const callsPerFeature = 10;
        const amountPerCall = 3;
        const expectedPerFeature = callsPerFeature * amountPerCall;

        // Create parallel calls for each feature
        const allPromises = features.flatMap((feature) =>
            Array.from({ length: callsPerFeature }, () =>
                consumeQuota({
                    userId: testUserId,
                    feature,
                    amount: amountPerCall,
                }),
            ),
        );

        // Execute all calls in parallel
        await Promise.all(allPromises);

        // Verify usage for each feature
        for (const feature of features) {
            const usage = await getUsage({
                userId: testUserId,
                feature,
            });
            expect(usage.used).toBe(expectedPerFeature);
        }

        // Clean up other features
        await db.delete(schema.vtplusUsage).where(eq(schema.vtplusUsage.userId, testUserId));
    }, 45000);
});
