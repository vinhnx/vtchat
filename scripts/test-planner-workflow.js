#!/usr/bin/env bun

/**
 * Test script to simulate the planner workflow and identify the exact failure point
 */

console.log("🧪 Testing Planner Workflow");
console.log("=" .repeat(60));

async function testPlannerWorkflow() {
    console.log("\n📋 Testing planner workflow execution");
    
    try {
        // Import the required modules
        const { generateObject } = await import("@repo/ai/workflow/utils");
        const { ModelEnum } = await import("@repo/ai/models");
        const { UserTier } = await import("@repo/shared/constants/user-tiers");
        const { z } = await import("zod");
        
        console.log("✅ Successfully imported modules");
        
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
        
        console.log("📋 Calling generateObject with parameters:");
        console.log(`  - Model: ${testParams.model}`);
        console.log(`  - User tier: ${testParams.userTier}`);
        console.log(`  - BYOK keys: ${Object.keys(testParams.byokKeys).length} keys`);
        console.log(`  - Prompt length: ${testParams.prompt.length} characters`);
        
        const result = await generateObject(testParams);
        
        console.log("✅ SUCCESS: generateObject completed successfully!");
        console.log(`  - Reasoning: ${result.reasoning?.substring(0, 100)}...`);
        console.log(`  - Queries: ${result.queries?.length} queries generated`);
        
        return true;
        
    } catch (error) {
        console.log("❌ FAILED: generateObject threw an error");
        console.log(`  - Error type: ${error.constructor.name}`);
        console.log(`  - Error message: ${error.message}`);
        console.log(`  - Error stack: ${error.stack?.split('\n')[0]}`);
        
        // Check for specific error patterns
        if (error.message.includes("API key")) {
            console.log("\n🔍 API Key Error Analysis:");
            console.log("  - This suggests the API key logic is not working correctly");
            console.log("  - The system API key might not be accessible in this context");
        } else if (error.message.includes("unauthorized") || error.message.includes("401")) {
            console.log("\n🔍 Authentication Error Analysis:");
            console.log("  - The API key might be invalid or expired");
            console.log("  - Check if the API key has proper permissions");
        } else if (error.message.includes("quota") || error.message.includes("limit")) {
            console.log("\n🔍 Quota Error Analysis:");
            console.log("  - The API key might have reached its quota limit");
            console.log("  - Check the Google Cloud Console for usage limits");
        } else {
            console.log("\n🔍 Unknown Error Analysis:");
            console.log("  - This might be a different type of error");
            console.log("  - Check the full error details above");
        }
        
        return false;
    }
}

async function testApiKeyAccess() {
    console.log("\n📋 Testing API key access in workflow context");
    
    // Test if the API key is accessible in the same way the workflow accesses it
    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;
    
    console.log("API Key Access Test:");
    console.log(`  - System API key detected: ${hasSystemGeminiKey}`);
    
    if (hasSystemGeminiKey) {
        const keyLength = process.env.GEMINI_API_KEY?.length || 0;
        const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 10) + "...";
        console.log(`  - Key length: ${keyLength} characters`);
        console.log(`  - Key preview: ${keyPreview}`);
        
        // Test if it looks like a valid Google API key
        const isValidFormat = process.env.GEMINI_API_KEY?.startsWith('AIza') && keyLength === 39;
        console.log(`  - Valid Google API key format: ${isValidFormat ? '✅' : '❌'}`);
        
        if (!isValidFormat) {
            console.log("  ⚠️  Warning: API key doesn't match expected Google format (AIza... 39 chars)");
        }
    }
    
    return hasSystemGeminiKey;
}

async function runTests() {
    console.log("Starting planner workflow tests...\n");
    
    const hasApiKey = await testApiKeyAccess();
    
    if (!hasApiKey) {
        console.log("\n❌ Cannot proceed: No API key detected");
        console.log("Please ensure GEMINI_API_KEY is set in .env.local");
        return;
    }
    
    const result = await testPlannerWorkflow();
    
    console.log("\n" + "=" .repeat(60));
    if (result) {
        console.log("🎉 SUCCESS: Planner workflow is working correctly!");
        console.log("\n✅ The generateObject function can use the system API key");
        console.log("✅ Free tier users should be able to use the planner task");
        console.log("✅ Basic web search should work end-to-end");
    } else {
        console.log("❌ ISSUE: Planner workflow has problems");
        console.log("\n🔍 Next steps:");
        console.log("   - Check the error details above");
        console.log("   - Verify the API key is valid and has quota");
        console.log("   - Test the API key directly with Google's API");
    }
}

// Run the tests
runTests().catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
});
