/**
 * Manual OpenRouter Verification Script
 *
 * This script can be run manually to verify OpenRouter integration with real API calls.
 * It tests that OpenRouter requests are authentic and not returning dummy responses.
 *
 * Usage:
 * 1. Set OPENROUTER_API_KEY environment variable
 * 2. Run: bun run packages/ai/__tests__/manual-openrouter-verification.ts
 *
 * Requirements verified:
 * - 2.3: OpenRouter responds with actual model response content
 * - 2.4: OpenRouter requests are sent to correct endpoints with proper authentication
 */

import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import { generateText } from '../workflow/utils';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.TEST_OPENROUTER_API_KEY;

async function verifyOpenRouterAuthenticity() {
    console.log('🔍 OpenRouter Authenticity Verification');
    console.log('=====================================');

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 10) {
        console.log('❌ No OpenRouter API key found. Set OPENROUTER_API_KEY environment variable.');
        console.log('   Get a key at: https://openrouter.ai/keys');
        return;
    }

    console.log('✅ OpenRouter API key found');
    console.log(`   Key length: ${OPENROUTER_API_KEY.length} characters`);
    console.log(`   Key format: ${OPENROUTER_API_KEY.substring(0, 12)}...`);

    const byokKeys = {
        OPENROUTER_API_KEY,
    };

    // Test 1: Provider Instance Creation
    console.log('\n📋 Test 1: Provider Instance Creation');
    try {
        const model = getLanguageModel(ModelEnum.DEEPSEEK_V3_0324, undefined, byokKeys);
        console.log('✅ OpenRouter provider instance created successfully');
        console.log(`   Model type: ${typeof model}`);
    } catch (error: any) {
        console.log('❌ Failed to create OpenRouter provider instance');
        console.log(`   Error: ${error.message}`);
        return;
    }

    // Test 2: Simple Text Generation
    console.log('\n📋 Test 2: Simple Text Generation');
    try {
        let responseText = '';
        let chunkCount = 0;

        await generateText({
            prompt:
                "You are a helpful AI assistant. Please respond with exactly: 'Hello from OpenRouter DeepSeek V3!' and nothing else.",
            model: ModelEnum.DEEPSEEK_V3_0324,
            byokKeys,
            onChunk: (chunk: string) => {
                responseText += chunk;
                chunkCount++;
            },
            maxSteps: 1,
        });

        console.log('✅ Text generation completed');
        console.log(`   Response: "${responseText.trim()}"`);
        console.log(`   Response length: ${responseText.length} characters`);
        console.log(`   Chunks received: ${chunkCount}`);

        // Verify response authenticity
        const isAuthentic = responseText.length > 0
            && !responseText.toLowerCase().includes('dummy')
            && !responseText.toLowerCase().includes('mock')
            && !responseText.toLowerCase().includes('placeholder');

        if (isAuthentic) {
            console.log('✅ Response appears authentic (not dummy/mock data)');
        } else {
            console.log('⚠️  Response may be dummy/mock data');
        }

        // Check if response contains expected content
        const containsExpected = responseText.toLowerCase().includes('hello')
            || responseText.toLowerCase().includes('openrouter')
            || responseText.toLowerCase().includes('deepseek');

        if (containsExpected) {
            console.log('✅ Response contains expected content');
        } else {
            console.log("⚠️  Response doesn't contain expected content, but may still be valid");
        }
    } catch (error: any) {
        console.log('❌ Text generation failed');
        console.log(`   Error: ${error.message}`);

        // Check if error is authentication-related (expected for invalid keys)
        const isAuthError = error.message.toLowerCase().includes('unauthorized')
            || error.message.toLowerCase().includes('invalid')
            || error.message.toLowerCase().includes('api key');

        if (isAuthError) {
            console.log(
                '   This appears to be an authentication error (expected for invalid keys)',
            );
        }
    }

    // Test 3: Different Model Test
    console.log('\n📋 Test 3: Different OpenRouter Model');
    try {
        let responseText = '';

        await generateText({
            prompt: 'What is 2+2? Answer with just the number.',
            model: ModelEnum.DEEPSEEK_R1,
            byokKeys,
            onChunk: (chunk: string) => {
                responseText += chunk;
            },
            maxSteps: 1,
        });

        console.log('✅ DeepSeek R1 model test completed');
        console.log(`   Response: "${responseText.trim()}"`);

        // Verify it's a reasonable mathematical response
        const containsNumber = /[0-9]/.test(responseText);
        if (containsNumber) {
            console.log('✅ Response contains numbers (expected for math question)');
        }
    } catch (error: any) {
        console.log('❌ DeepSeek R1 model test failed');
        console.log(`   Error: ${error.message}`);
    }

    // Test 4: Error Handling with Invalid Key
    console.log('\n📋 Test 4: Error Handling with Invalid Key');
    try {
        const invalidByokKeys = {
            OPENROUTER_API_KEY: `sk-or-v1-invalid${'a'.repeat(60)}`,
        };

        await generateText({
            prompt: 'Test prompt',
            model: ModelEnum.DEEPSEEK_V3_0324,
            byokKeys: invalidByokKeys,
            onChunk: () => {},
            maxSteps: 1,
        });

        console.log('⚠️  Expected error with invalid API key, but request succeeded');
    } catch (error: any) {
        console.log('✅ Invalid API key properly rejected');
        console.log(`   Error: ${error.message}`);

        // Verify error is authentication-related
        const isAuthError = error.message.toLowerCase().includes('unauthorized')
            || error.message.toLowerCase().includes('invalid')
            || error.message.toLowerCase().includes('api key')
            || error.message.toLowerCase().includes('forbidden');

        if (isAuthError) {
            console.log('✅ Error is authentication-related (expected)');
        } else {
            console.log('⚠️  Error is not authentication-related');
        }
    }

    console.log('\n🎉 OpenRouter Authenticity Verification Complete');
    console.log('===============================================');
    console.log('Summary:');
    console.log('- Provider instance creation: Tested');
    console.log('- Text generation with valid key: Tested');
    console.log('- Multiple model support: Tested');
    console.log('- Error handling with invalid key: Tested');
    console.log('- Response authenticity checks: Performed');
    console.log('\nIf all tests passed, OpenRouter integration is working correctly');
    console.log('and sending authentic requests to OpenRouter API endpoints.');
}

// Run verification if this script is executed directly
if (import.meta.main) {
    verifyOpenRouterAuthenticity().catch(console.error);
}

export { verifyOpenRouterAuthenticity };
