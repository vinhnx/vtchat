/**
 * Debug GPT-5 OpenRouter Chat Workflow Issue
 *
 * This test simulates the workflow routing that happens when GPT_5_OPENROUTER
 * is selected, to identify why the chat button doesn't work.
 */

// Import the functions we need to test
async function testGPT5Workflow() {
    console.log("🔍 Testing GPT-5 OpenRouter Workflow Routing");
    console.log("=============================================");

    try {
        // Import the required modules
        const { ChatMode } = await import("@repo/shared/config");
        const { getModelFromChatMode, supportsOpenAIWebSearch, supportsNativeWebSearch } =
            await import("@repo/ai/models");

        console.log("\n1. Testing ChatMode to Model Mapping:");
        const gpt5ChatMode = ChatMode.GPT_5_OPENROUTER;
        console.log(`ChatMode.GPT_5_OPENROUTER: ${gpt5ChatMode}`);

        const model = getModelFromChatMode(gpt5ChatMode);
        console.log(`getModelFromChatMode result: ${model}`);

        console.log("\n2. Testing Web Search Support:");
        const supportsOpenAI = supportsOpenAIWebSearch(model);
        const supportsNative = supportsNativeWebSearch(model);

        console.log(`supportsOpenAIWebSearch(${model}): ${supportsOpenAI}`);
        console.log(`supportsNativeWebSearch(${model}): ${supportsNative}`);

        console.log("\n3. Simulating Completion Task Logic:");
        const webSearch = true; // Simulate web search being enabled

        console.log(`webSearch enabled: ${webSearch}`);
        console.log(`supportsOpenAISearch: ${supportsOpenAI}`);

        if (webSearch && !supportsOpenAI) {
            console.log("❌ ISSUE FOUND: Would redirect to 'planner' instead of 'completion'");
            console.log("   This is why the chat button doesn't work!");
        } else {
            console.log("✅ Would stay in 'completion' task");
        }

        console.log("\n4. Analyzing the Problem:");
        console.log("- GPT_5_OPENROUTER is not in the supportsOpenAIWebSearch list");
        console.log("- When web search is enabled, it gets redirected to 'planner'");
        console.log("- This breaks the normal chat flow");

        console.log("\n5. Potential Solutions:");
        console.log("a) Add GPT_5_OPENROUTER to supportsOpenAIWebSearch list");
        console.log("b) Create special handling for OpenRouter models in completion task");
        console.log("c) Disable web search by default for OpenRouter models");
    } catch (error) {
        console.error("❌ Error during test:", error);
    }
}

// Run the test
testGPT5Workflow();
