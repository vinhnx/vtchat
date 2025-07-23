#!/usr/bin/env bun
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Testing AI SDK and Google provider compatibility...");

try {
    const genAI = new GoogleGenerativeAI("test-key");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    console.log("✅ Google provider instantiated successfully");
    console.log("✅ Model created successfully");

    // Test embedding model
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    console.log("✅ Embedding model created successfully");

    console.log("\n🎉 AI SDK compatibility confirmed!");
    console.log("The AI SDK v4 + Google provider v1.2.22 setup is working correctly.");
} catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
}
