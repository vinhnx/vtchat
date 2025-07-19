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

import { ModelEnum } from '@repo/ai/models';
import { getLanguageModel } from '@repo/ai/providers';
import { generateText } from 'ai';

async function testOllamaQwen3Integration() {
    console.log('🧪 Testing Ollama integration with Qwen3:1.7b model...\n');

    console.log('🔧 Environment configuration:');
    console.log(`   OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log('');

    try {
        // Test Ollama provider with Qwen3 model
        console.log('1. Testing Ollama Qwen3 provider initialization...');
        const model = getLanguageModel(ModelEnum.OLLAMA_QWEN_3);
        console.log('✅ Ollama Qwen3 provider initialized successfully\n');

        // Test simple text generation with recommended maxRetries for local models
        console.log('2. Testing text generation with Qwen3:1.7b...');
        const { text } = await generateText({
            model,
            prompt: 'What is the capital of Japan? Answer in one word.',
            maxOutputTokens: 10,
            maxRetries: 1, // Recommended for immediate feedback if server isn't running
        });

        console.log('✅ Text generation successful');
        console.log(`📝 Response: ${text}\n`);

        // Test with a coding question
        console.log('3. Testing coding question with Qwen3:1.7b...');
        const { text: codeText } = await generateText({
            model,
            prompt: 'Write a simple function to add two numbers in JavaScript. Just the function, no explanation.',
            maxOutputTokens: 50,
            maxRetries: 1,
        });

        console.log('✅ Code generation successful');
        console.log(`📝 Response: ${codeText}\n`);

        // Test with a reasoning question
        console.log('4. Testing reasoning with Qwen3:1.7b...');
        const { text: reasoningText } = await generateText({
            model,
            prompt: 'If a train travels 60 miles in 1 hour, how far will it travel in 30 minutes? Answer with just the number and unit.',
            maxOutputTokens: 15,
            maxRetries: 1,
        });

        console.log('✅ Reasoning test successful');
        console.log(`📝 Response: ${reasoningText}\n`);

        console.log('🎉 All Ollama Qwen3:1.7b tests passed!');
        console.log('🚀 Ollama integration is working correctly with remote server');
    } catch (error) {
        console.error('❌ Ollama Qwen3:1.7b integration test failed:');
        console.error(error.message);

        if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
            console.log('\n💡 Connection issues detected. Check:');
            console.log(
                `   1. Ollama server is running at: ${process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'}`
            );
            console.log('   2. Network connectivity to the server');
            console.log('   3. Firewall settings');
            console.log('\n🔧 Try testing connection:');
            console.log(
                `   curl ${process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'}/api/tags`
            );
        }

        if (error.message.includes('model') || error.message.includes('not found')) {
            console.log('\n💡 Model not found. Make sure you have qwen3:1.7b pulled:');
            console.log('   ollama pull qwen3:1.7b');
            console.log('\n💡 Check available models:');
            console.log('   ollama list');
            console.log('\n💡 If using remote server, run on the server:');
            console.log(`   ssh user@192.168.1.123 "ollama pull qwen3:1.7b"`);
        }

        if (error.message.includes('timeout')) {
            console.log('\n💡 Request timeout. This could mean:');
            console.log('   1. Model is being loaded (first request may be slow)');
            console.log('   2. Server is under load');
            console.log('   3. Network latency is high');
            console.log('\n🔄 Try again in a few moments');
        }

        process.exit(1);
    }
}

// Run the test
testOllamaQwen3Integration();
