#!/usr/bin/env bun

import { log } from "@repo/shared/logger";

/**
 * Test script to verify the unified web search workflow with real API key
 */

log.info("🧪 Testing Unified Web Search with Real API Key");
log.info("=".repeat(60));

async function testApiKeyValidation() {
    log.info("\n📋 Testing API key validation");

    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;

    if (!hasSystemGeminiKey) {
        log.info("❌ No API key detected");
        return false;
    }

    const keyLength = process.env.GEMINI_API_KEY?.length || 0;
    const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 10) + "...";
    const isValidFormat = process.env.GEMINI_API_KEY?.startsWith("AIza") && keyLength === 39;

    log.info(`  - Key length: ${keyLength} characters`);
    log.info(`  - Key preview: ${keyPreview}`);
    log.info(`  - Valid format: ${isValidFormat ? "✅" : "❌"}`);

    return isValidFormat;
}

async function testBasicWebSearchWorkflow() {
    log.info("📋 Testing Basic Web Search Workflow");

    try {
        // Test the generateTextWithGeminiSearch function directly
        const { generateTextWithGeminiSearch } = await import("@repo/ai/workflow/utils");
        const { ModelEnum } = await import("@repo/ai/models");
        const { UserTier } = await import("@repo/shared/constants/user-tiers");

        log.info("✅ Successfully imported modules");

        const testParams = {
            prompt: "Search for information about: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            byokKeys: {}, // Empty - should use system key
            userTier: UserTier.FREE,
            userId: "test-user-id",
        };

        log.info("📋 Testing generateTextWithGeminiSearch:");
        log.info(`  - Model: ${testParams.model}`);
        log.info(`  - User tier: ${testParams.userTier}`);
        log.info("  - Using system API key: true");

        // Set a timeout for the test
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Test timeout after 30 seconds")), 30000);
        });

        const testPromise = generateTextWithGeminiSearch(testParams);

        const result = await Promise.race([testPromise, timeoutPromise]);

        log.info("✅ SUCCESS: generateTextWithGeminiSearch completed!");
        log.info(`  - Response length: ${result.text?.length || 0} characters`);
        log.info(`  - Sources found: ${result.sources?.length || 0}`);
        log.info(`  - Has grounding metadata: ${!!result.groundingMetadata}`);

        return true;
    } catch (error) {
        log.error("❌ FAILED: generateTextWithGeminiSearch threw an error");
        log.error(`  - Error type: ${error.constructor.name}`);
        log.error(`  - Error message: ${error.message}`);

        // Analyze the error
        if (error.message.includes("API key")) {
            log.info("  🔍 API key issue detected");
        } else if (error.message.includes("quota") || error.message.includes("limit")) {
            log.info("  🔍 Quota/limit issue detected");
        } else if (error.message.includes("timeout")) {
            log.info("  🔍 Request timeout - API might be slow but working");
        } else {
            log.info("  🔍 Unknown error type");
        }

        return false;
    }
}

async function testWorkflowIntegration() {
    log.info("📋 Testing Workflow Integration");

    try {
        // Test the complete workflow routing
        const { modeRoutingTask } = await import("@repo/ai/workflow/tasks/chat-mode-router");
        const { ChatMode } = await import("@repo/shared/config");

        log.info("✅ Successfully imported workflow modules");

        // Test basic web search routing
        const mockContext = {
            get: (key) => {
                switch (key) {
                    case "mode":
                        return ChatMode.GEMINI_2_5_FLASH_LITE;
                    case "webSearch":
                        return true;
                    case "question":
                        return "who is vinhnx";
                    case "messages":
                        return [];
                    default:
                        return undefined;
                }
            },
            set: () => {},
            update: () => {},
        };

        const mockEvents = { update: () => {} };
        let routedTo = null;
        const mockRedirectTo = (destination) => {
            routedTo = destination;
        };

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        log.info(`  - Basic web search routes to: ${routedTo}`);

        if (routedTo === "gemini-web-search") {
            log.info("  ✅ SUCCESS: Unified workflow routing is correct");
            return true;
        } else {
            log.info("  ❌ FAILED: Still routing to old path");
            return false;
        }
    } catch (error) {
        log.error("❌ FAILED: Workflow integration test failed");
        log.error(`  - Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    log.info("Starting comprehensive unified workflow tests...");

    const apiKeyValid = await testApiKeyValidation();

    if (!apiKeyValid) {
        log.info("\n❌ Cannot proceed: Invalid or missing API key");
        log.info("Please ensure a valid Google API key is set in .env.local");
        return;
    }

    const workflowIntegration = await testWorkflowIntegration();
    const basicWorkflow = await testBasicWebSearchWorkflow();

    const allTestsPassed = workflowIntegration && basicWorkflow;

    log.info("\n" + "=".repeat(60));
    if (allTestsPassed) {
        log.info("🎉 SUCCESS: Unified web search workflow is fully operational!");
        log.info("✅ Valid API key is configured");
        log.info("✅ Workflow routing bypasses problematic planner");
        log.info("✅ Basic web search can execute successfully");
        log.info("✅ System API key is being used correctly");

        log.info("🚀 Ready for browser testing:");
        log.info("   1. Open http://localhost:3000");
        log.info("   2. Enable web search toggle");
        log.info("   3. Ask: 'who is vinhnx?'");
        log.info("   4. Should work without errors");
    } else {
        log.info("❌ ISSUE: Some tests failed");
        log.info("\n🔍 Check the test results above for specific issues");

        if (workflowIntegration && !basicWorkflow) {
            log.info("   - Routing is correct but API execution failed");
            log.info("   - Check API key permissions and quota");
        } else if (!workflowIntegration) {
            log.info("   - Workflow routing has issues");
            log.info("   - Check the router task implementation");
        }
    }
}

// Run the tests
runTests().catch((error) => {
    log.error("❌ Test script failed:", error);
    process.exit(1);
});
