#!/usr/bin/env bun

import { log } from "@repo/shared/logger";

/**
 * Test script to directly test the Google API key
 */

log.info("🧪 Testing Google API Key Directly");
log.info("=".repeat(60));

async function testGoogleApiKey() {
    log.info("\n📋 Testing Google API key with direct API call");

    // Load environment variables like Next.js does
    const fs = await import("fs");
    const path = await import("path");

    try {
        const envPath = path.resolve("apps/web/.env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf8");
            const lines = envContent.split("\n");

            for (const line of lines) {
                if (
                    line.startsWith("GEMINI_API_KEY=") &&
                    !line.includes("your_gemini_api_key_here")
                ) {
                    const apiKey = line.split("=")[1].trim();

                    log.info(`  - API key found: ${apiKey.substring(0, 10)}...`);
                    log.info(`  - Key length: ${apiKey.length} characters`);
                    log.info(
                        `  - Valid format: ${apiKey.startsWith("AIza") && apiKey.length === 39 ? "✅" : "❌"}`,
                    );

                    if (!apiKey.startsWith("AIza") || apiKey.length !== 39) {
                        log.info("  ❌ Invalid API key format");
                        log.info("  Expected: AIza... (39 characters)");
                        log.info(
                            `  Actual: ${apiKey.substring(0, 10)}... (${apiKey.length} characters)`,
                        );
                        return false;
                    }

                    // Test the API key with a simple request
                    log.info("\n📋 Testing API key with Google Generative AI API...");

                    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

                    const testPayload = {
                        contents: [
                            {
                                parts: [
                                    {
                                        text: "Hello, this is a test. Please respond with 'API key is working'.",
                                    },
                                ],
                            },
                        ],
                    };

                    try {
                        const response = await fetch(testUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(testPayload),
                        });

                        log.info(`  - Response status: ${response.status}`);

                        if (response.ok) {
                            const data = await response.json();
                            log.info("  ✅ SUCCESS: API key is working!");
                        log.info(
                            `  - Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text || "No text response"}`,
                        );
                            return true;
                        } else {
                            const errorData = await response.text();
                            log.info("  ❌ FAILED: API request failed");
                            log.info(`  - Error: ${errorData.substring(0, 200)}...`);

                            if (response.status === 400) {
                                log.info(
                                    "  🔍 Bad request - check API key format or request structure",
                                );
                            } else if (response.status === 401) {
                                log.info("  🔍 Unauthorized - API key is invalid or expired");
                            } else if (response.status === 403) {
                                log.info(
                                    "  🔍 Forbidden - API key doesn't have permission or quota exceeded",
                                );
                            } else if (response.status === 429) {
                                log.info("  🔍 Rate limited - too many requests");
                            }

                            return false;
                        }
                    } catch (fetchError) {
                        log.info("  ❌ FAILED: Network error during API test");
                        log.info(`  - Error: ${fetchError.message}`);
                        return false;
                    }
                }
            }

            log.info("  ❌ No valid GEMINI_API_KEY found in .env.local");
            return false;
        } else {
            log.info("  ❌ .env.local file not found");
            return false;
        }
    } catch (error) {
        log.info("  ❌ Error reading .env.local file");
        log.info(`  - Error: ${error.message}`);
        return false;
    }
}

async function runTest() {
    log.info("Starting direct API key test...
");

    const result = await testGoogleApiKey();

    log.info("\n" + "=".repeat(60));
    if (result) {
        log.info("🎉 SUCCESS: Google API key is working correctly!");
        log.info("✅ API key is valid and has proper permissions");
        log.info("✅ Google Generative AI API is accessible");
        log.info("✅ The issue must be elsewhere in the workflow");

        log.info("\n🔍 Next steps:");
        log.info("   - The API key is working, so the issue is in the application code");
        log.info("   - Check the detailed error logs when you try web search again");
        log.info("   - The error might be in the AI SDK integration or model configuration");
    } else {
        log.info("❌ ISSUE: Google API key is not working");
        log.info("\n🔍 Possible solutions:");
        log.info("   1. Get a new API key from https://aistudio.google.com/app/apikey");
        log.info("   2. Make sure the API key has Generative AI API permissions");
        log.info("   3. Check if the API key has sufficient quota");
        log.info("   4. Verify the API key format (should start with AIza and be 39 chars)");
        log.info("   5. Make sure billing is enabled in Google Cloud Console");
    }
    }
}

// Run the test
runTest().catch((error) => {
    log.error("❌ Test script failed:", error);
    process.exit(1);
});
