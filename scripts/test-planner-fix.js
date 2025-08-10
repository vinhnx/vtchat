#!/usr/bin/env bun

/**
 * Test script to verify the planner task fix for free tier users
 * This script tests that the planner task gives clear error messages when no API key is provided
 */

import { ModelEnum } from "@repo/ai/models";
import { generateObject } from "@repo/ai/workflow/utils";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { z } from "zod";

log.info("🧪 Testing Planner Task Fix for Free Tier Users");
log.info("=".repeat(60));

async function testFreeUserPlannerWithoutApiKey() {
    log.info("\n📋 Test 1: Free user planner without API key (should fail with clear message)");

    // Clear system API key to simulate production environment without system key
    delete process.env.GEMINI_API_KEY;

    try {
        await generateObject({
            prompt: "Plan a search for: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()),
            }),
            byokKeys: {}, // Empty API keys object - matches the real scenario
            userTier: UserTier.FREE,
            userId: "test-user-id",
        });

        log.info("❌ FAIL: Expected error but function succeeded");
        return false;
    } catch (error) {
        const expectedMessage = "Planning requires an API key";
        if (error.message.includes(expectedMessage)) {
            log.info("✅ PASS: Got expected error message");
            console.log(`   Error: ${error.message}`);
            return true;
        } else {
            log.info("❌ FAIL: Got unexpected error message");
            log.info(`   Expected: Message containing "${expectedMessage}"`);
            log.info(`   Actual: ${error.message}`);
            return false;
        }
    }
}

async function testFreeUserPlannerWithApiKey() {
    log.info("\n📋 Test 2: Free user planner with BYOK API key (should work)");

    // Clear system API key
    delete process.env.GEMINI_API_KEY;

    try {
        // This would normally make an API call, but we expect it to fail due to invalid key
        // The important thing is that it doesn't fail with "system configuration" error
        await generateObject({
            prompt: "Plan a search for: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()),
            }),
            byokKeys: { GEMINI_API_KEY: "fake-user-api-key" }, // User provided key
            userTier: UserTier.FREE,
            userId: "test-user-id",
        });

        log.info("✅ PASS: Function accepted user API key (would make API call)");
        return true;
    } catch (error) {
        // We expect this to fail due to invalid API key, but NOT due to missing system config
        if (
            error.message.includes("system configuration") ||
            error.message.includes("Planning requires an API key")
        ) {
            log.info("❌ FAIL: Still getting system configuration or missing API key error");
            console.log(`   Error: ${error.message}`);
            return false;
        } else {
            log.info(
                "✅ PASS: Function accepted user API key (failed due to invalid key, which is expected)",
            );
            console.log(`   Error: ${error.message}`);
            return true;
        }
    }
}

async function testFreeUserPlannerWithSystemKey() {
    log.info(
        "\n📋 Test 3: Free user planner without BYOK but with system key available (should work)",
    );

    // Set system API key
    process.env.GEMINI_API_KEY = "fake-system-api-key";

    try {
        await generateObject({
            prompt: "Plan a search for: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()),
            }),
            byokKeys: {}, // Empty API keys object
            userTier: UserTier.FREE,
            userId: "test-user-id",
        });

        log.info("✅ PASS: Function used system API key (would make API call)");
        return true;
    } catch (error) {
        // We expect this to fail due to invalid API key, but NOT due to missing API key
        if (
            error.message.includes("API key is required") ||
            error.message.includes("Planning requires an API key")
        ) {
            log.info("❌ FAIL: Still requiring API key when system key is available");
            console.log(`   Error: ${error.message}`);
            return false;
        } else {
            log.info(
                "✅ PASS: Function used system API key (failed due to invalid key, which is expected)",
            );
            log.info(`   Error: ${error.message}`);
            return true;
        }
    }
}

async function runTests() {
    log.info("Starting tests...\n");

    const results = [];

    results.push(await testFreeUserPlannerWithoutApiKey());
    results.push(await testFreeUserPlannerWithApiKey());
    results.push(await testFreeUserPlannerWithSystemKey());

    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;

    log.info("\n" + "=".repeat(60));
    log.info(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        log.info("🎉 All tests passed! The planner fix is working correctly.");
        log.info(
            "\n✅ Free tier users will now get clear error messages when they need to provide API keys for planning",
        );
        log.info("✅ Free tier users can use planning with their own API keys (BYOK)");
        log.info("✅ Free tier users can use planning when system keys are available");
    } else {
        log.info("❌ Some tests failed. The fix may need additional work.");
        process.exit(1);
    }
}

// Run the tests
runTests().catch((error) => {
    log.error("❌ Test script failed:", error);
    process.exit(1);
});
