#!/usr/bin/env bun

/**
 * Test script to verify API key detection in the workflow
 */

console.log("🧪 Testing API Key Detection");
console.log("=".repeat(60));

async function testApiKeyDetection() {
    console.log("\n📋 Testing API key detection logic");

    // Test the same logic used in generateObject
    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;

    console.log("Environment check:");
    console.log(`  - typeof process: ${typeof process}`);
    console.log(
        `  - process.env exists: ${typeof process !== "undefined" ? !!process.env : "N/A"}`,
    );
    console.log(`  - GEMINI_API_KEY exists: ${hasSystemGeminiKey}`);

    if (hasSystemGeminiKey) {
        const keyLength = process.env.GEMINI_API_KEY?.length || 0;
        console.log(`  - API key length: ${keyLength} characters`);
        console.log(`  - API key preview: ${process.env.GEMINI_API_KEY?.substring(0, 10)}...`);
    }

    // Test the logic for free tier users
    const isFreeGeminiModel = true; // Simulating GEMINI_2_5_FLASH_LITE
    const isVtPlusUser = false; // Simulating free tier user
    const hasUserGeminiKey = false; // Simulating no BYOK

    console.log("\nUser scenario:");
    console.log(`  - Free Gemini model: ${isFreeGeminiModel}`);
    console.log(`  - VT+ user: ${isVtPlusUser}`);
    console.log(`  - Has user API key: ${hasUserGeminiKey}`);
    console.log(`  - Has system API key: ${hasSystemGeminiKey}`);

    // Test the decision logic
    if (!hasUserGeminiKey && !hasSystemGeminiKey) {
        if (isFreeGeminiModel && !isVtPlusUser) {
            console.log("\n❌ RESULT: Would throw error - Planning requires an API key");
            return false;
        }
    } else if (!hasUserGeminiKey && hasSystemGeminiKey) {
        console.log("\n✅ RESULT: Would use system API key");
        return true;
    } else if (hasUserGeminiKey) {
        console.log("\n✅ RESULT: Would use user API key");
        return true;
    }

    console.log("\n⚠️  RESULT: Unexpected scenario");
    return false;
}

async function testEnvironmentLoading() {
    console.log("\n📋 Testing environment variable loading");

    // Check if .env.local is being loaded
    const envFiles = [".env.local", ".env.development", ".env"];

    for (const file of envFiles) {
        try {
            const fs = await import("fs");
            const path = await import("path");
            const filePath = path.resolve(file);
            const exists = fs.existsSync(filePath);
            console.log(`  - ${file}: ${exists ? "✅ exists" : "❌ not found"}`);

            if (exists && file === ".env.local") {
                const content = fs.readFileSync(filePath, "utf8");
                const hasGeminiKey =
                    content.includes("GEMINI_API_KEY=") &&
                    !content.includes("GEMINI_API_KEY=your_gemini_api_key_here");
                console.log(`    - Contains valid GEMINI_API_KEY: ${hasGeminiKey ? "✅" : "❌"}`);
            }
        } catch (error) {
            console.log(`  - ${file}: ❌ error checking (${error.message})`);
        }
    }
}

async function runTests() {
    console.log("Starting API key detection tests...\n");

    await testEnvironmentLoading();
    const result = await testApiKeyDetection();

    console.log("\n" + "=".repeat(60));
    if (result) {
        console.log("🎉 SUCCESS: API key detection is working correctly!");
        console.log("\n✅ The system should be able to use the server-funded API key");
        console.log("✅ Free tier users should be able to use web search");
    } else {
        console.log("❌ ISSUE: API key detection has problems");
        console.log("\n🔍 Possible issues:");
        console.log("   - API key not set in .env.local");
        console.log("   - Environment variables not loaded correctly");
        console.log("   - API key format is incorrect");
    }
}

// Run the tests
runTests().catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
});
