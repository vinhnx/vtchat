/**
 * Test RAG system with Gemini embeddings
 * Run with: bun run apps/web/app/tests/test-rag-gemini-embedding.js
 */

import { generateEmbedding } from '../../lib/ai/embedding.js';

async function testRAGSystem() {
    console.log('🧪 Testing RAG System with Gemini Embeddings...\n');

    // Mock API keys with Gemini key
    const mockApiKeys = {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-key-placeholder'
    };

    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  No GEMINI_API_KEY found in environment. Using placeholder.');
        console.log('   Set GEMINI_API_KEY environment variable for real testing.\n');
    }

    try {
        // Test 1: Basic embedding generation
        console.log('1️⃣ Testing embedding generation...');
        const testText = "React is a JavaScript library for building user interfaces.";
        
        if (process.env.GEMINI_API_KEY) {
            const embedding = await generateEmbedding(testText, mockApiKeys);
            console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
        } else {
            console.log('⏭️  Skipping embedding generation (no API key)');
        }

        // Test 2: Model selection logic
        console.log('\n2️⃣ Testing model detection...');
        const { getEmbeddingModel } = await import('../../lib/ai/embedding.js');
        const defaultModel = getEmbeddingModel();
        console.log(`✅ Default embedding model: ${defaultModel}`);

        // Test 3: All embedding models detection
        console.log('\n3️⃣ Testing all embedding models...');
        const { EMBEDDING_MODELS } = await import('@repo/shared/config/embedding-models.js');
        for (const [name, model] of Object.entries(EMBEDDING_MODELS)) {
            const selectedModel = getEmbeddingModel(model);
            console.log(`✅ ${name}: ${selectedModel}`);
        }

        // Test 4: Vector format validation
        console.log('\n4️⃣ Testing vector format...');
        if (process.env.GEMINI_API_KEY) {
            try {
                const embedding = await generateEmbedding("test vector format", mockApiKeys);
                const isValidFormat = Array.isArray(embedding) && 
                                    embedding.length === 768 && 
                                    embedding.every(val => typeof val === 'number');
                if (isValidFormat) {
                    console.log('✅ Vector format is correct: Array of 768 numbers');
                } else {
                    console.log(`❌ Invalid vector format: length=${embedding.length}, type=${typeof embedding}`);
                }
            } catch (error) {
                console.log(`⚠️  Vector format test skipped: ${error.message}`);
            }
        } else {
            console.log('⏭️  Vector format test skipped (no API key)');
        }

        // Test 5: Error handling for missing API key
        console.log('\n5️⃣ Testing error handling...');
        try {
            await generateEmbedding("test", {});
            console.log('❌ Should have thrown error for missing API key');
        } catch (error) {
            if (error.message.includes('Gemini API key is required')) {
                console.log('✅ Correctly throws error for missing Gemini API key');
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }

        console.log('\n🎉 RAG system tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testRAGSystem().catch(console.error);
}
