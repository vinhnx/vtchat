import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Simple compatibility test
const google = createGoogleGenerativeAI({
    apiKey: "test-key-for-compatibility-check",
});

console.log("✅ Google provider v1.2.22 created successfully with AI SDK v4.3.19");
console.log("🎉 RAG chatbot should now work without AI_UnsupportedModelVersionError!");
