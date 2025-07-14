/**
 * AI Routing Test Script
 *
 * This script tests the AI routing fix across different models and providers
 * to ensure that VT+ models correctly route to /api/completion endpoint.
 *
 * Prerequisites:
 * 1. User must be authenticated (login to https://vtchat.io.vn first)
 * 2. User should have VT+ subscription to test VT+ models
 * 3. Run this script with: node test-ai-routing.js
 */

const { chromium } = require("playwright");

const MODELS_TO_TEST = [
    // Free models (should work without VT+)
    { name: "Gemini 2.5 Flash Lite Preview", provider: "Google", requiresVtPlus: false },

    // VT+ models that should route to /api/completion
    { name: "Claude 4 Sonnet", provider: "Anthropic", requiresVtPlus: true },
    { name: "Claude 4 Opus", provider: "Anthropic", requiresVtPlus: true },
    { name: "GPT 4o", provider: "OpenAI", requiresVtPlus: true },
    { name: "GPT 4o Mini", provider: "OpenAI", requiresVtPlus: true },
    { name: "DeepSeek R1", provider: "Fireworks", requiresVtPlus: true },
    { name: "Gemini 2.5 Pro", provider: "Google", requiresVtPlus: true },

    // VT+ exclusive features
    { name: "Deep Research", provider: "Advanced", requiresVtPlus: true },
    { name: "Pro Search", provider: "Advanced", requiresVtPlus: true },
];

async function testAIRouting() {
    console.log("🚀 Starting AI Routing Test...\n");

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Monitor network requests to check routing
    const networkRequests = [];
    page.on("request", (request) => {
        if (request.url().includes("/api/")) {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                timestamp: new Date().toISOString(),
            });
        }
    });

    try {
        // Navigate to VT Chat
        await page.goto("https://vtchat.io.vn");
        console.log("📱 Navigated to VT Chat");

        // Check if user is authenticated
        const isLoggedIn = await page
            .locator('[data-test="user-menu"]')
            .isVisible({ timeout: 5000 })
            .catch(() => false);
        if (!isLoggedIn) {
            console.log("❌ User not authenticated. Please login first and run the test again.");
            console.log("   1. Go to https://vtchat.io.vn/login");
            console.log("   2. Login with your preferred method");
            console.log("   3. Run this script again");
            return;
        }

        console.log("✅ User is authenticated");

        // Check VT+ status
        const hasVtPlus = await page
            .locator("text=VT+")
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        console.log(`💎 VT+ Status: ${hasVtPlus ? "Active" : "Not Active"}`);

        for (const model of MODELS_TO_TEST) {
            console.log(`\n🧪 Testing ${model.name} (${model.provider})`);

            if (model.requiresVtPlus && !hasVtPlus) {
                console.log("   ⏭️  Skipping - requires VT+ subscription");
                continue;
            }

            try {
                // Clear previous requests
                networkRequests.length = 0;

                // Open model selector
                await page.locator('button[data-test="model-selector"]').click();

                // Select the model
                await page.locator(`menuitem:has-text("${model.name}")`).click();

                // Type a test message
                const testMessage = `Test message for ${model.name} routing`;
                await page.locator('textarea[placeholder*="Ask"]').fill(testMessage);

                // Send message
                await page.locator('button[data-test="send-message"]').click();

                // Wait for response
                await page.waitForTimeout(3000);

                // Analyze network requests
                const completionRequests = networkRequests.filter((req) =>
                    req.url.includes("/api/completion"),
                );
                const streamRequests = networkRequests.filter((req) =>
                    req.url.includes("/api/stream"),
                );

                console.log(`   📡 Network Analysis:`);
                console.log(`      - /api/completion calls: ${completionRequests.length}`);
                console.log(`      - /api/stream calls: ${streamRequests.length}`);

                // Verify routing
                if (model.requiresVtPlus) {
                    if (completionRequests.length > 0) {
                        console.log("   ✅ PASS: VT+ model correctly routed to /api/completion");
                    } else {
                        console.log(
                            "   ❌ FAIL: VT+ model should route to /api/completion but didn't",
                        );
                    }
                } else {
                    // Free models might use either endpoint
                    console.log("   ℹ️  Free model - routing varies based on configuration");
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
            }
        }

        console.log("\n🎯 Test Summary:");
        console.log("   - Check the network analysis above");
        console.log("   - VT+ models should show /api/completion calls");
        console.log("   - Free models may use either endpoint");
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAIRouting().catch(console.error);
