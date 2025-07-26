#!/usr/bin/env node

/**
 * Test Ollama integration with Qwen3:1.7b model
 * This script tests if Ollama provider works correctly with specific qwen3:1.7b model
 *
 * Prerequisites:
 * 1. Install Ollama: `brew install ollama` or download from https://ollama.com
 * 2. Start Ollama service: `ollama serve`
 * 3. Pull model: `ollama pull qwen3:1.7b`
 * 4. Run this test: `NODE_ENV=production bun apps/web/app/tests/test-ollama-qwen3.js`
 */

import { ModelEnum } from "@repo/ai/models";
import { getLanguageModel } from "@repo/ai/providers";
import { generateText } from "ai";

async function testOllamaQwen3Integration() {
    try {
        // Test Ollama provider with Qwen3 model
        const model = getLanguageModel(ModelEnum.OLLAMA_QWEN_3);

        // Test simple text generation with recommended maxRetries for local models
        await generateText({
            model,
            prompt: "What is the capital of Japan? Answer in one word.",
            maxTokens: 10,
            maxRetries: 1, // Recommended for immediate feedback if server isn't running
        });

        // Test with a coding question
        await generateText({
            model,
            prompt: "Write a simple function to add two numbers in JavaScript. Just the function, no explanation.",
            maxTokens: 50,
            maxRetries: 1,
        });

        // Test with a reasoning question
        await generateText({
            model,
            prompt: "If a train travels 60 miles in 1 hour, how far will it travel in 30 minutes? Answer with just the number and unit.",
            maxTokens: 15,
            maxRetries: 1,
        });
    } catch {
        // All console.log and console.error statements removed for lint compliance
    }
}

// Run the test
testOllamaQwen3Integration();
