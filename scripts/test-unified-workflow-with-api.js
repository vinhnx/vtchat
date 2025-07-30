#!/usr/bin/env bun

/**
 * Test script to verify the unified web search workflow with real API key
 */

console.log("🧪 Testing Unified Web Search with Real API Key");
console.log("=" .repeat(60));

async function testApiKeyValidation() {
    console.log("\n📋 Testing API key validation");
    
    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;
    
    if (!hasSystemGeminiKey) {
        console.log("❌ No API key detected");
        return false;
    }
    
    const keyLength = process.env.GEMINI_API_KEY?.length || 0;
    const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 10) + "...";
    const isValidFormat = process.env.GEMINI_API_KEY?.startsWith('AIza') && keyLength === 39;
    
    console.log(`  - Key length: ${keyLength} characters`);
    console.log(`  - Key preview: ${keyPreview}`);
    console.log(`  - Valid format: ${isValidFormat ? '✅' : '❌'}`);
    
    return isValidFormat;
}

async function testBasicWebSearchWorkflow() {
    console.log("\n📋 Testing Basic Web Search Workflow");
    
    try {
        // Test the generateTextWithGeminiSearch function directly
        const { generateTextWithGeminiSearch } = await import("@repo/ai/workflow/utils");
        const { ModelEnum } = await import("@repo/ai/models");
        const { UserTier } = await import("@repo/shared/constants/user-tiers");
        
        console.log("✅ Successfully imported modules");
        
        const testParams = {
            prompt: "Search for information about: who is vinhnx",
            model: ModelEnum.GEMINI_2_5_FLASH_LITE,
            byokKeys: {}, // Empty - should use system key
            userTier: UserTier.FREE,
            userId: "test-user-id",
        };
        
        console.log("📋 Testing generateTextWithGeminiSearch:");
        console.log(`  - Model: ${testParams.model}`);
        console.log(`  - User tier: ${testParams.userTier}`);
        console.log(`  - Using system API key: true`);
        
        // Set a timeout for the test
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Test timeout after 30 seconds")), 30000);
        });
        
        const testPromise = generateTextWithGeminiSearch(testParams);
        
        const result = await Promise.race([testPromise, timeoutPromise]);
        
        console.log("✅ SUCCESS: generateTextWithGeminiSearch completed!");
        console.log(`  - Response length: ${result.text?.length || 0} characters`);
        console.log(`  - Sources found: ${result.sources?.length || 0}`);
        console.log(`  - Has grounding metadata: ${!!result.groundingMetadata}`);
        
        return true;
        
    } catch (error) {
        console.log("❌ FAILED: generateTextWithGeminiSearch threw an error");
        console.log(`  - Error type: ${error.constructor.name}`);
        console.log(`  - Error message: ${error.message}`);
        
        // Analyze the error
        if (error.message.includes("API key")) {
            console.log("  🔍 API key issue detected");
        } else if (error.message.includes("quota") || error.message.includes("limit")) {
            console.log("  🔍 Quota/limit issue detected");
        } else if (error.message.includes("timeout")) {
            console.log("  🔍 Request timeout - API might be slow but working");
        } else {
            console.log("  🔍 Unknown error type");
        }
        
        return false;
    }
}

async function testWorkflowIntegration() {
    console.log("\n📋 Testing Workflow Integration");
    
    try {
        // Test the complete workflow routing
        const { modeRoutingTask } = await import("@repo/ai/workflow/tasks/chat-mode-router");
        const { ChatMode } = await import("@repo/shared/config");
        
        console.log("✅ Successfully imported workflow modules");
        
        // Test basic web search routing
        const mockContext = {
            get: (key) => {
                switch (key) {
                    case "mode": return ChatMode.GEMINI_2_5_FLASH_LITE;
                    case "webSearch": return true;
                    case "question": return "who is vinhnx";
                    case "messages": return [];
                    default: return undefined;
                }
            },
            set: () => {},
            update: () => {},
        };
        
        const mockEvents = { update: () => {} };
        let routedTo = null;
        const mockRedirectTo = (destination) => { routedTo = destination; };
        
        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });
        
        console.log(`  - Basic web search routes to: ${routedTo}`);
        
        if (routedTo === "gemini-web-search") {
            console.log("  ✅ SUCCESS: Unified workflow routing is correct");
            return true;
        } else {
            console.log("  ❌ FAILED: Still routing to old path");
            return false;
        }
        
    } catch (error) {
        console.log("❌ FAILED: Workflow integration test failed");
        console.log(`  - Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log("Starting comprehensive unified workflow tests...\n");
    
    const apiKeyValid = await testApiKeyValidation();
    
    if (!apiKeyValid) {
        console.log("\n❌ Cannot proceed: Invalid or missing API key");
        console.log("Please ensure a valid Google API key is set in .env.local");
        return;
    }
    
    const workflowIntegration = await testWorkflowIntegration();
    const basicWorkflow = await testBasicWebSearchWorkflow();
    
    const allTestsPassed = workflowIntegration && basicWorkflow;
    
    console.log("\n" + "=" .repeat(60));
    if (allTestsPassed) {
        console.log("🎉 SUCCESS: Unified web search workflow is fully operational!");
        console.log("\n✅ Valid API key is configured");
        console.log("✅ Workflow routing bypasses problematic planner");
        console.log("✅ Basic web search can execute successfully");
        console.log("✅ System API key is being used correctly");
        
        console.log("\n🚀 Ready for browser testing:");
        console.log("   1. Open http://localhost:3000");
        console.log("   2. Enable web search toggle");
        console.log("   3. Ask: 'who is vinhnx?'");
        console.log("   4. Should work without errors");
    } else {
        console.log("❌ ISSUE: Some tests failed");
        console.log("\n🔍 Check the test results above for specific issues");
        
        if (workflowIntegration && !basicWorkflow) {
            console.log("   - Routing is correct but API execution failed");
            console.log("   - Check API key permissions and quota");
        } else if (!workflowIntegration) {
            console.log("   - Workflow routing has issues");
            console.log("   - Check the router task implementation");
        }
    }
}

// Run the tests
runTests().catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
});
