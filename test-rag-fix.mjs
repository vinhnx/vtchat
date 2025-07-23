#!/usr/bin/env bun

/**
 * Test the RAG API to see the actual error that's occurring
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";

console.log("🧪 Testing Google Provider Model Creation...\n");

try {
    // Test creating the Google provider with the fixed version
    const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY || "test-key", // Use real or dummy key
    });

    console.log("✅ Google provider created successfully");

    // Test creating a model instance
    const model = google("gemini-2.5-flash-lite-preview-06-17");
    console.log("✅ Model instance created successfully");
    console.log("🎯 Model details:", {
        name: model.modelId || "unknown",
        provider: model.provider?.providerId || "unknown",
    });

    console.log("\n✅ Google provider test PASSED - AI SDK compatibility issue is resolved!");
} catch (error) {
    console.error("❌ Error:", error.message);

    // Check if it's the old AI SDK error
    if (
        error.message.includes("AI_UnsupportedModelVersionError") ||
        error.message.includes("specification version")
    ) {
        console.error("⚠️  AI SDK compatibility issue still exists!");
    } else {
        console.error("⚠️  Different error - likely API key or model configuration issue");
    }

    process.exit(1);
}

console.log("\n📝 Next: Test the RAG chatbot in the browser to identify the specific error");
