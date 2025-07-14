/**
 * Detailed AI Routing Test
 *
 * This script performs comprehensive testing of the AI routing system
 * by monitoring network requests and verifying API endpoints.
 */

const { chromium } = require("playwright");

// Test configurations based on our routing logic
const TEST_SCENARIOS = [
    // Free tier models
    {
        name: "Gemini 2.5 Flash Lite Preview",
        type: "free",
        expectedEndpoint: "/api/completion",
        description: "Free server-funded model",
    },

    // VT+ models that should route to server-side
    {
        name: "Claude 4 Sonnet",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ Anthropic model",
    },
    {
        name: "Claude 4 Opus",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ Anthropic model",
    },
    {
        name: "GPT 4o",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ OpenAI model",
    },
    {
        name: "GPT 4o Mini",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ OpenAI model",
    },
    {
        name: "DeepSeek R1",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ Fireworks model",
    },
    {
        name: "Gemini 2.5 Pro",
        type: "vt_plus",
        expectedEndpoint: "/api/completion",
        description: "VT+ Google model",
    },

    // VT+ exclusive features
    {
        name: "Deep Research",
        type: "vt_plus_feature",
        expectedEndpoint: "/api/completion",
        description: "VT+ exclusive feature",
    },
    {
        name: "Pro Search",
        type: "vt_plus_feature",
        expectedEndpoint: "/api/completion",
        description: "VT+ exclusive feature",
    },
];

class AIRoutingTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.networkRequests = [];
        this.testResults = [];
    }

    async setup() {
        this.browser = await chromium.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const context = await this.browser.newContext();
        this.page = await context.newPage();

        // Monitor network requests
        this.page.on("request", (request) => {
            if (request.url().includes("/api/")) {
                this.networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    headers: request.headers(),
                    timestamp: new Date().toISOString(),
                });
            }
        });

        this.page.on("response", (response) => {
            if (response.url().includes("/api/")) {
                const request = this.networkRequests.find((req) => req.url === response.url());
                if (request) {
                    request.status = response.status();
                    request.responseHeaders = response.headers();
                }
            }
        });
    }

    async checkAuthentication() {
        await this.page.goto("https://vtchat.io.vn");

        // Check if user is authenticated
        const isLoggedIn = await this.page
            .locator("text=Free")
            .isVisible({ timeout: 5000 })
            .catch(() => false);
        if (!isLoggedIn) {
            console.log("❌ Please login first:");
            console.log("   1. Go to https://vtchat.io.vn/login");
            console.log("   2. Login with your preferred method");
            console.log("   3. Run this script again");
            return false;
        }

        // Check VT+ status
        const hasVtPlus = await this.page
            .locator("text=VT+")
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        console.log(`💎 VT+ Status: ${hasVtPlus ? "Active" : "Free tier"}`);

        return { isLoggedIn, hasVtPlus };
    }

    async testModel(scenario) {
        console.log(`\n🧪 Testing: ${scenario.name}`);
        console.log(`   Type: ${scenario.type}`);
        console.log(`   Expected: ${scenario.expectedEndpoint}`);

        try {
            // Clear previous requests
            this.networkRequests.length = 0;

            // Navigate to fresh page
            await this.page.goto("https://vtchat.io.vn");
            await this.page.waitForTimeout(2000);

            let modelSelected = false;

            if (scenario.type === "vt_plus_feature") {
                // Test VT+ exclusive features
                if (scenario.name === "Deep Research") {
                    await this.page
                        .locator('button:has-text("Gemini 2.5 Flash Lite Preview")')
                        .click();
                    await this.page.locator('menuitem:has-text("Deep Research")').click();
                    modelSelected = true;
                } else if (scenario.name === "Pro Search") {
                    await this.page
                        .locator('button:has-text("Gemini 2.5 Flash Lite Preview")')
                        .click();
                    await this.page.locator('menuitem:has-text("Pro Search")').click();
                    modelSelected = true;
                }
            } else {
                // Test regular models
                await this.page.locator('button:has-text("Gemini 2.5 Flash Lite Preview")').click();
                const modelOption = this.page.locator(`menuitem:has-text("${scenario.name}")`);

                if (await modelOption.isVisible({ timeout: 2000 })) {
                    await modelOption.click();
                    modelSelected = true;
                }
            }

            if (!modelSelected) {
                console.log("   ⏭️  Model not available or login required");
                return { scenario, success: false, reason: "Model not available" };
            }

            // Type test message
            const testMessage = `Test routing for ${scenario.name}`;
            await this.page
                .locator('textarea[placeholder*="Ask"], textbox[placeholder*="Ask"]')
                .fill(testMessage);

            // Send message
            await this.page
                .locator('button[aria-label="Send Message"], button:has-text("Send")')
                .click();

            // Wait for request
            await this.page.waitForTimeout(5000);

            // Analyze requests
            const completionRequests = this.networkRequests.filter((req) =>
                req.url.includes("/api/completion"),
            );
            const streamRequests = this.networkRequests.filter((req) =>
                req.url.includes("/api/stream"),
            );
            const otherRequests = this.networkRequests.filter(
                (req) => !req.url.includes("/api/completion") && !req.url.includes("/api/stream"),
            );

            console.log(`   📡 Network Analysis:`);
            console.log(`      - /api/completion: ${completionRequests.length} calls`);
            console.log(`      - /api/stream: ${streamRequests.length} calls`);
            console.log(`      - Other API calls: ${otherRequests.length}`);

            // Verify routing
            const success = completionRequests.length > 0;
            const result = {
                scenario,
                success,
                completionRequests: completionRequests.length,
                streamRequests: streamRequests.length,
                otherRequests: otherRequests.length,
                reason: success ? "Correct routing" : "Unexpected routing",
            };

            if (success) {
                console.log("   ✅ PASS: Correctly routed to /api/completion");
            } else {
                console.log("   ❌ FAIL: Expected /api/completion but got different routing");
                console.log(
                    `      Actual requests: ${this.networkRequests.map((r) => r.url).join(", ")}`,
                );
            }

            return result;
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            return { scenario, success: false, reason: error.message };
        }
    }

    async runAllTests() {
        console.log("🚀 Starting Detailed AI Routing Test...\n");

        await this.setup();

        const authStatus = await this.checkAuthentication();
        if (!authStatus) {
            return;
        }

        const { hasVtPlus } = authStatus;

        for (const scenario of TEST_SCENARIOS) {
            // Skip VT+ tests if user doesn't have VT+
            if (
                (scenario.type === "vt_plus" || scenario.type === "vt_plus_feature") &&
                !hasVtPlus
            ) {
                console.log(`\n⏭️  Skipping ${scenario.name} - requires VT+ subscription`);
                continue;
            }

            const result = await this.testModel(scenario);
            this.testResults.push(result);

            // Wait between tests
            await this.page.waitForTimeout(2000);
        }

        this.printSummary();
    }

    printSummary() {
        console.log("\n📊 Test Summary:");
        console.log("==================");

        const passed = this.testResults.filter((r) => r.success).length;
        const failed = this.testResults.filter((r) => !r.success).length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${this.testResults.length}`);

        if (failed > 0) {
            console.log("\n❌ Failed Tests:");
            this.testResults
                .filter((r) => !r.success)
                .forEach((result) => {
                    console.log(`   - ${result.scenario.name}: ${result.reason}`);
                });
        }

        console.log("\n🎯 Key Findings:");
        console.log("   - All VT+ models should route to /api/completion");
        console.log("   - Free models may use either endpoint");
        console.log("   - VT+ exclusive features must use /api/completion");
        console.log("   - Check network logs for detailed routing information");
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the test
async function main() {
    const tester = new AIRoutingTester();
    try {
        await tester.runAllTests();
    } catch (error) {
        console.error("❌ Test suite failed:", error);
    } finally {
        await tester.cleanup();
    }
}

main().catch(console.error);
