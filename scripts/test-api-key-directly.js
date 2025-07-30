#!/usr/bin/env bun

/**
 * Test script to directly test the Google API key
 */

console.log("🧪 Testing Google API Key Directly");
console.log("=".repeat(60));

async function testGoogleApiKey() {
    console.log("\n📋 Testing Google API key with direct API call");

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

                    console.log(`  - API key found: ${apiKey.substring(0, 10)}...`);
                    console.log(`  - Key length: ${apiKey.length} characters`);
                    console.log(
                        `  - Valid format: ${apiKey.startsWith("AIza") && apiKey.length === 39 ? "✅" : "❌"}`,
                    );

                    if (!apiKey.startsWith("AIza") || apiKey.length !== 39) {
                        console.log("  ❌ Invalid API key format");
                        console.log("  Expected: AIza... (39 characters)");
                        console.log(
                            `  Actual: ${apiKey.substring(0, 10)}... (${apiKey.length} characters)`,
                        );
                        return false;
                    }

                    // Test the API key with a simple request
                    console.log("\n📋 Testing API key with Google Generative AI API...");

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

                        console.log(`  - Response status: ${response.status}`);

                        if (response.ok) {
                            const data = await response.json();
                            console.log("  ✅ SUCCESS: API key is working!");
                            console.log(
                                `  - Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text || "No text response"}`,
                            );
                            return true;
                        } else {
                            const errorData = await response.text();
                            console.log("  ❌ FAILED: API request failed");
                            console.log(`  - Error: ${errorData.substring(0, 200)}...`);

                            if (response.status === 400) {
                                console.log(
                                    "  🔍 Bad request - check API key format or request structure",
                                );
                            } else if (response.status === 401) {
                                console.log("  🔍 Unauthorized - API key is invalid or expired");
                            } else if (response.status === 403) {
                                console.log(
                                    "  🔍 Forbidden - API key doesn't have permission or quota exceeded",
                                );
                            } else if (response.status === 429) {
                                console.log("  🔍 Rate limited - too many requests");
                            }

                            return false;
                        }
                    } catch (fetchError) {
                        console.log("  ❌ FAILED: Network error during API test");
                        console.log(`  - Error: ${fetchError.message}`);
                        return false;
                    }
                }
            }

            console.log("  ❌ No valid GEMINI_API_KEY found in .env.local");
            return false;
        } else {
            console.log("  ❌ .env.local file not found");
            return false;
        }
    } catch (error) {
        console.log("  ❌ Error reading .env.local file");
        console.log(`  - Error: ${error.message}`);
        return false;
    }
}

async function runTest() {
    console.log("Starting direct API key test...\n");

    const result = await testGoogleApiKey();

    console.log("\n" + "=".repeat(60));
    if (result) {
        console.log("🎉 SUCCESS: Google API key is working correctly!");
        console.log("\n✅ API key is valid and has proper permissions");
        console.log("✅ Google Generative AI API is accessible");
        console.log("✅ The issue must be elsewhere in the workflow");

        console.log("\n🔍 Next steps:");
        console.log("   - The API key is working, so the issue is in the application code");
        console.log("   - Check the detailed error logs when you try web search again");
        console.log("   - The error might be in the AI SDK integration or model configuration");
    } else {
        console.log("❌ ISSUE: Google API key is not working");
        console.log("\n🔍 Possible solutions:");
        console.log("   1. Get a new API key from https://aistudio.google.com/app/apikey");
        console.log("   2. Make sure the API key has Generative AI API permissions");
        console.log("   3. Check if the API key has sufficient quota");
        console.log("   4. Verify the API key format (should start with AIza and be 39 chars)");
        console.log("   5. Make sure billing is enabled in Google Cloud Console");
    }
}

// Run the test
runTest().catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
});
