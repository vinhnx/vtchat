#!/usr/bin/env bun

import { log } from "@repo/shared/logger";

/**
 * Test script to simulate the planner workflow and identify the exact failure point
 */

log.info("🧪 Testing Planner Workflow");
log.info("=".repeat(60));

async function testPlannerWorkflow() {
    log.info("\n📋 Testing planner workflow execution");

    try {
        // Import the required modules
        const { generateObject } = await import("@repo/ai/workflow/utils");
        const { ModelEnum } = await import("@repo/ai/models");
        const { UserTier } = await import("@repo/shared/constants/user-tiers");
        const { z } = await import("zod");

        log.info("✅ Successfully imported modules");

        // Test the exact same call that the planner task makes
        const testParams = {
            prompt: "Plan a search for: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()),
            }),
            byokKeys: {}, // Empty - should use system key
            userTier: UserTier.FREE,
            userId: "test-user-id",
        };

        log.info("📋 Calling generateObject with parameters:");
        log.info(`  - Model: ${testParams.model}`);
        log.info(`  - User tier: ${testParams.userTier}`);
        log.info(`  - BYOK keys: ${Object.keys(testParams.byokKeys).length} keys`);
        log.info(`  - Prompt length: ${testParams.prompt.length} characters`);

        const result = await generateObject(testParams);

        log.info("✅ SUCCESS: generateObject completed successfully!");
        log.info(`  - Reasoning: ${result.reasoning?.substring(0, 100)}...`);
        log.info(`  - Queries: ${result.queries?.length} queries generated`);

        return true;
    } catch (error) {
        log.error("❌ FAILED: generateObject threw an error");
        log.error(`  - Error type: ${error.constructor.name}`);
        log.error(`  - Error message: ${error.message}`);
        log.error(`  - Error stack: ${error.stack?.split("\n")[0]}`);

        // Check for specific error patterns
        if (error.message.includes("API key")) {
            log.info("\n🔍 API Key Error Analysis:");
            log.info("  - This suggests the API key logic is not working correctly");
            log.info("  - The system API key might not be accessible in this context");
        } else if (error.message.includes("unauthorized") || error.message.includes("401")) {
            log.info("\n🔍 Authentication Error Analysis:");
            log.info("  - The API key might be invalid or expired");
            log.info("  - Check if the API key has proper permissions");
        } else if (error.message.includes("quota") || error.message.includes("limit")) {
            log.info("\n🔍 Quota Error Analysis:");
            log.info("  - The API key might have reached its quota limit");
            log.info("  - Check the Google Cloud Console for usage limits");
        } else {
            log.info("\n🔍 Unknown Error Analysis:");
            log.info("  - This might be a different type of error");
            log.info("  - Check the full error details above");
        }

        return false;
    }
}

async function testApiKeyAccess() {
    log.info("\n📋 Testing API key access in workflow context");

    // Test if the API key is accessible in the same way the workflow accesses it
    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;

    log.info("API Key Access Test:");
    log.info(`  - System API key detected: ${hasSystemGeminiKey}`);

    if (hasSystemGeminiKey) {
        const keyLength = process.env.GEMINI_API_KEY?.length || 0;
        const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 10) + "...";
        log.info(`  - Key length: ${keyLength} characters`);
        log.info(`  - Key preview: ${keyPreview}`);

        // Test if it looks like a valid Google API key
        const isValidFormat = process.env.GEMINI_API_KEY?.startsWith("AIza") && keyLength === 39;
        log.info(`  - Valid Google API key format: ${isValidFormat ? "✅" : "❌"}`);

        if (!isValidFormat) {
            log.warn(
                "  ⚠️  Warning: API key doesn't match expected Google format (AIza... 39 chars)",
            );
        }
    }

    return hasSystemGeminiKey;
}

async function runTests() {
    log.info("Starting planner workflow tests...");

    const hasApiKey = await testApiKeyAccess();

    if (!hasApiKey) {
        log.info("\n❌ Cannot proceed: No API key detected");
        log.info("Please ensure GEMINI_API_KEY is set in .env.local");
        return;
    }

    const result = await testPlannerWorkflow();

    log.info("\n" + "=".repeat(60));
    if (result) {
        log.info("🎉 SUCCESS: Planner workflow is working correctly!");
        log.info("✅ The generateObject function can use the system API key");
        log.info("✅ Free tier users should be able to use the planner task");
        log.info("✅ Basic web search should work end-to-end");
    } else {
        log.info("❌ ISSUE: Planner workflow has problems");
        log.info("\n🔍 Next steps:");
        log.info("   - Check the error details above");
        log.info("   - Verify the API key is valid and has quota");
        log.info("   - Test the API key directly with Google's API");
    }
}

// Run the tests
runTests().catch((error) => {
    log.error("❌ Test script failed:", error);
    process.exit(1);
});
