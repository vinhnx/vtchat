#!/usr/bin/env node

// Minimal test to isolate the embedding issue
import { generateEmbedding } from "./apps/web/lib/ai/embedding.js";

const testEmbedding = async () => {
    try {
        console.log("🔍 Testing embedding generation...");

        // Test with empty API keys (should use server GEMINI_API_KEY)
        const result = await generateEmbedding(
            "test query",
            {}, // empty apiKeys - should fallback to server key
            "text-embedding-004",
        );

        console.log("✅ Embedding generated successfully:", {
            dimensions: result.length,
            firstFewValues: result.slice(0, 5),
        });
    } catch (error) {
        console.error("❌ Embedding generation failed:", {
            message: error.message,
            stack: error.stack,
        });
    }
};

testEmbedding();
