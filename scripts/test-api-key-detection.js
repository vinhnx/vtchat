#!/usr/bin/env bun

import { log } from "@repo/shared/logger";

/**
 * Test script to verify API key detection in the workflow
 */

log.info("🧪 Testing API Key Detection");
log.info("=".repeat(60));

async function testApiKeyDetection() {
    log.info("\n📋 Testing API key detection logic");

    // Test the same logic used in generateObject
    const hasSystemGeminiKey = typeof process !== "undefined" && !!process.env?.GEMINI_API_KEY;

    log.info("Environment check:");
    log.info(`  - typeof process: ${typeof process}`);
    log.info(
        `  - process.env exists: ${typeof process !== "undefined" ? !!process.env : "N/A"}`,
    );
    log.info(`  - GEMINI_API_KEY exists: ${hasSystemGeminiKey}`);

    if (hasSystemGeminiKey) {
        const keyLength = process.env.GEMINI_API_KEY?.length || 0;
        log.info(`  - API key length: ${keyLength} characters`);
        log.info(`  - API key preview: ${process.env.GEMINI_API_KEY?.substring(0, 10)}...`);
    }

    // Test the logic for free tier users
    const isFreeGeminiModel = true; // Simulating GEMINI_2_5_FLASH_LITE
    const isVtPlusUser = false; // Simulating free tier user
    const hasUserGeminiKey = false; // Simulating no BYOK

    log.info("\nUser scenario:");
    log.info(`  - Free Gemini model: ${isFreeGeminiModel}`);
    log.info(`  - VT+ user: ${isVtPlusUser}`);
    log.info(`  - Has user API key: ${hasUserGeminiKey}`);
    log.info(`  - Has system API key: ${hasSystemGeminiKey}`);

    // Test the decision logic
    if (!hasUserGeminiKey && !hasSystemGeminiKey) {
        if (isFreeGeminiModel && !isVtPlusUser) {
            log.info("\n❌ RESULT: Would throw error - Planning requires an API key");
            return false;
        }
    } else if (!hasUserGeminiKey && hasSystemGeminiKey) {
        log.info("\n✅ RESULT: Would use system API key");
        return true;
    } else if (hasUserGeminiKey) {
        log.info("\n✅ RESULT: Would use user API key");
        return true;
    }

    log.info("⚠️  RESULT: Unexpected scenario");
    return false;
}

async function testEnvironmentLoading() {
    log.info("\n📋 Testing environment variable loading");

    // Check if .env.local is being loaded
    const envFiles = [".env.local", ".env.development", ".env"];

    for (const file of envFiles) {
        try {
            const fs = await import("fs");
            const path = await import("path");
            const filePath = path.resolve(file);
            const exists = fs.existsSync(filePath);
            log.info(`  - ${file}: ${exists ? "✅ exists" : "❌ not found"}`);

            if (exists && file === ".env.local") {
                const content = fs.readFileSync(filePath, "utf8");
                const hasGeminiKey =
                    content.includes("GEMINI_API_KEY=") &&
                    !content.includes("GEMINI_API_KEY=your_gemini_api_key_here");
                log.info(`    - Contains valid GEMINI_API_KEY: ${hasGeminiKey ? "✅" : "❌"}`);
            }
        } catch (error) {
            log.error(`  - ${file}: ❌ error checking (${error.message})`);
        }
    }
}

async function runTests() {
    log.info("Starting API key detection tests...\n");

    await testEnvironmentLoading();
    const result = await testApiKeyDetection();

    log.info("\n" + "=".repeat(60));
    if (result) {
        log.info("🎉 SUCCESS: API key detection is working correctly!");
        log.info("\n✅ The system should be able to use the server-funded API key");
        log.info("✅ Free tier users should be able to use web search");
    } else {
        log.info("❌ ISSUE: API key detection has problems");
        log.info("\n🔍 Possible issues:");
        log.info("   - API key not set in .env.local");
        log.info("   - Environment variables not loaded correctly");
        log.info("   - API key format is incorrect");
    }
}

// Run the tests
runTests().catch((error) => {
    log.error("❌ Test script failed:", error);
    process.exit(1);
});
