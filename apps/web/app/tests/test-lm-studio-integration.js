#!/usr/bin/env node

/**
 * Test LM Studio integration
 * This script tests if LM Studio provider works correctly
 *
 * Prerequisites:
 * 1. Start LM Studio server: `lms server start --port 1234 --cors`
 * 2. Load a model in LM Studio
 * 3. Run this test: `node --experimental-loader @repo/typescript-config/loader.js apps/web/app/tests/test-lm-studio-integration.js`
 *    Or with bun: `bun apps/web/app/tests/test-lm-studio-integration.js`
 */

import { ModelEnum } from '@repo/ai/models';
import { getLanguageModel } from '@repo/ai/providers';
import { generateText } from 'ai';

async function testLMStudioIntegration() {
    console.log('🧪 Testing LM Studio integration...\n');

    try {
        // Test LM Studio provider with Llama 3 8B model
        console.log('1. Testing LM Studio provider initialization...');
        const model = getLanguageModel(ModelEnum.LMSTUDIO_LLAMA_3_8B);
        console.log('✅ LM Studio provider initialized successfully\n');

        // Test simple text generation
        console.log('2. Testing text generation...');
        const { text } = await generateText({
            model,
            prompt: 'What is the capital of France? Answer in one word.',
            maxTokens: 10,
        });

        console.log('✅ Text generation successful');
        console.log(`📝 Response: ${text}\n`);

        // Test with different model
        console.log('3. Testing Qwen 7B model...');
        const qwenModel = getLanguageModel(ModelEnum.LMSTUDIO_QWEN_7B);
        const { text: qwenText } = await generateText({
            model: qwenModel,
            prompt: 'Hello! How are you?',
            maxTokens: 20,
        });

        console.log('✅ Qwen model test successful');
        console.log(`📝 Response: ${qwenText}\n`);

        // Test with the new Gemma 3 1B model
        console.log('4. Testing Gemma 3 1B model...');
        const gemma3Model = getLanguageModel(ModelEnum.LMSTUDIO_GEMMA_3_1B);
        const { text: gemma3Text } = await generateText({
            model: gemma3Model,
            prompt: 'What is 2 + 2? Answer with just the number.',
            maxTokens: 5,
        });

        console.log('✅ Gemma 3 1B model test successful');
        console.log(`📝 Response: ${gemma3Text}\n`);

        console.log('🎉 All LM Studio tests passed!');
    } catch (error) {
        console.error('❌ LM Studio integration test failed:');
        console.error(error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure LM Studio server is running:');
            console.log('   lms server start --port 1234 --cors');
        }

        if (error.message.includes('model')) {
            console.log('\n💡 Make sure you have a model loaded in LM Studio');
        }

        process.exit(1);
    }
}

// Run the test
testLMStudioIntegration();
