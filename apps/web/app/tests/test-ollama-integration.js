#!/usr/bin/env node

/**
 * Test Ollama integration
 * This script tests if Ollama provider works correctly
 *
 * Prerequisites:
 * 1. Install Ollama: `brew install ollama` or download from https://ollama.com
 * 2. Start Ollama service: `ollama serve` (defaults to 127.0.0.1:11434)
 * 3. Pull models: `ollama pull llama3.2` and `ollama pull qwen2.5`
 * 4. Run this test: `bun apps/web/app/tests/test-ollama-integration.js`
 */

import { ModelEnum } from "@repo/ai/models";
import { getLanguageModel } from "@repo/ai/providers";
import { generateText } from "ai";

async function testOllamaIntegration() {
    console.log("🧪 Testing Ollama integration...\n");

    try {
        // Test Ollama provider with Llama 3.2 model
        console.log("1. Testing Ollama provider initialization...");
        const model = getLanguageModel(ModelEnum.OLLAMA_LLAMA_3_2);
        console.log("✅ Ollama provider initialized successfully\n");

        // Test simple text generation with recommended maxRetries for local models
        console.log("2. Testing text generation...");
        const { text } = await generateText({
            model,
            prompt: "What is the capital of Japan? Answer in one word.",
            maxTokens: 10,
            maxRetries: 1, // Recommended for immediate feedback if server isn't running
        });

        console.log("✅ Text generation successful");
        console.log(`📝 Response: ${text}\n`);

        // Test with different model
        console.log("3. Testing Qwen 2.5 model...");
        const qwenModel = getLanguageModel(ModelEnum.OLLAMA_QWEN_2_5);
        const { text: qwenText } = await generateText({
            model: qwenModel,
            prompt: "Hello! How are you today?",
            maxTokens: 20,
            maxRetries: 1,
        });

        console.log("✅ Qwen model test successful");
        console.log(`📝 Response: ${qwenText}\n`);

        // Test with Llama 3.1 model
        console.log("4. Testing Llama 3.1 model...");
        const llama31Model = getLanguageModel(ModelEnum.OLLAMA_LLAMA_3_1);
        const { text: llama31Text } = await generateText({
            model: llama31Model,
            prompt: "What is 5 + 3? Answer with just the number.",
            maxTokens: 5,
            maxRetries: 1,
        });

        console.log("✅ Llama 3.1 model test successful");
        console.log(`📝 Response: ${llama31Text}\n`);

        console.log("🎉 All Ollama tests passed!");
    } catch (error) {
        console.error("❌ Ollama integration test failed:");
        console.error(error.message);

        if (error.message.includes("ECONNREFUSED")) {
            console.log("\n💡 Make sure Ollama is running:");
            console.log("   ollama serve");
            console.log("\n💡 Make sure you have models installed:");
            console.log("   ollama pull llama3.2");
            console.log("   ollama pull qwen2.5");
        }

        if (error.message.includes("model") || error.message.includes("not found")) {
            console.log("\n💡 Make sure you have the required models pulled:");
            console.log("   ollama pull llama3.2");
            console.log("   ollama pull qwen2.5");
            console.log("   ollama pull llama3.1");
            console.log("\n💡 Check available models:");
            console.log("   ollama list");
        }

        process.exit(1);
    }
}

// Run the test
testOllamaIntegration();
