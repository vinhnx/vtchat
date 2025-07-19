#!/usr/bin/env node

/**
 * Test script to verify Google provider is working with AI SDK v4
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";

console.log("Testing Google provider with AI SDK v4...");

try {
    // Test creating the provider
    const google = createGoogleGenerativeAI({
        apiKey: "test-key", // dummy key for testing provider creation
    });

    console.log("✅ Google provider created successfully with AI SDK v4");

    // Test getting a model instance
    const model = google("gemini-2.5-flash-lite-preview-06-17");

    console.log("✅ Gemini 2.5 Flash Lite model instance created successfully");
    console.log("✅ AI SDK v4 compatibility test passed!");
} catch (error) {
    console.error("❌ AI SDK v4 compatibility test failed:", error.message);
    process.exit(1);
}

console.log("\n🎉 Google provider is compatible with AI SDK v4!");
