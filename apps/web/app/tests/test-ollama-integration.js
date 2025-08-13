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

import { ModelEnum } from '@repo/ai/models';
import { getLanguageModel } from '@repo/ai/providers';
import { generateText } from 'ai';

async function testOllamaIntegration() {
    try {
        // Test Ollama provider with Llama 3.2 model
        const model = getLanguageModel(ModelEnum.OLLAMA_LLAMA_3_2);

        // Test simple text generation with recommended maxRetries for local models
        await generateText({
            model,
            prompt: 'What is the capital of Japan? Answer in one word.',
            maxOutputTokens: 10,
            maxRetries: 1, // Recommended for immediate feedback if server isn't running
        });

        // Test with different model
        const qwenModel = getLanguageModel(ModelEnum.OLLAMA_QWEN_2_5);
        await generateText({
            model: qwenModel,
            prompt: 'Hello! How are you today?',
            maxOutputTokens: 20,
            maxRetries: 1,
        });

        // Test with Llama 3.1 model
        const llama31Model = getLanguageModel(ModelEnum.OLLAMA_LLAMA_3_1);
        await generateText({
            model: llama31Model,
            prompt: 'What is 5 + 3? Answer with just the number.',
            maxOutputTokens: 5,
            maxRetries: 1,
        });
    } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
        }
        if (error.message.includes('model') || error.message.includes('not found')) {
        }

        process.exit(1);
    }
}

// Run the test
testOllamaIntegration();
