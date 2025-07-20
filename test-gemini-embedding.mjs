#!/usr/bin/env bun
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Testing Gemini embedding with correct model name...");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBkUmnUoZKCpWlk7qILCZtxe8gvK5u6J1A";

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

console.log("API Key found:", GEMINI_API_KEY.substring(0, 10) + "...");

try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ GoogleGenerativeAI instance created");

    // Test with the correct model name
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    console.log("✅ Model text-embedding-004 created");

    // Try with the corrected model name
    const correctModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    console.log("✅ Model gemini-embedding-001 created");

    // Test embedding generation
    console.log("\nTesting embedding generation...");
    const result = await correctModel.embedContent("test text for embedding");
    console.log("✅ Embedding generated successfully!");
    console.log("Embedding dimensions:", result.embedding.values.length);
    console.log("First few values:", result.embedding.values.slice(0, 5));
} catch (error) {
    console.error("❌ Error:", error.message);
    if (error.status) {
        console.error("Status:", error.status);
    }
    if (error.details) {
        console.error("Details:", error.details);
    }
    process.exit(1);
}
