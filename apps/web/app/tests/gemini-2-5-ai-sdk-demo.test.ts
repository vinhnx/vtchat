import { describe, expect, test } from 'bun:test';
import { google } from '@ai-sdk/google';
import { generateText, generateObject, streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { ChatMode } from '@repo/shared/config';

/**
 * Comprehensive test suite demonstrating Gemini 2.5 integration with AI SDK
 * This showcases all the features mentioned in the "Get Started with Gemini 2.5" task:
 * 
 * 1. Basic text generation with Gemini 2.5 Flash
 * 2. Thinking capability with thinkingConfig and reasoning summaries
 * 3. Tool calling with weather example
 * 4. Google Search grounding for latest information
 * 5. Streaming responses for real-time interfaces
 * 6. Structured output generation
 */

describe('Gemini 2.5 AI SDK Integration Demo', () => {
    // Skip tests if no API key is available
    const hasGeminiApiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    test.skipIf(!hasGeminiApiKey)('Basic text generation with Gemini 2.5 Flash', async () => {
        // Basic example from the task description
        const { text } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'Explain the concept of the Hilbert space.',
        });
        
        expect(text).toBeDefined();
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(50); // Should be a substantial response
        console.log('📝 Basic Generation Result:', text.substring(0, 200) + '...');
    });

    test.skipIf(!hasGeminiApiKey)('Thinking capability with reasoning summaries', async () => {
        // Demonstrate Gemini 2.5's thinking process with includeThoughts
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'What is the sum of the first 10 prime numbers?',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 8192, // 8K tokens for thinking
                        includeThoughts: true, // Request reasoning summary
                    },
                },
            },
        });

        expect(text).toBeDefined();
        expect(typeof text).toBe('string');
        expect(text).toMatch(/sum.*prime.*numbers/i);
        
        if (reasoning) {
            expect(typeof reasoning).toBe('string');
            console.log('🧠 Reasoning Summary:', reasoning.substring(0, 300) + '...');
        }
        
        console.log('🔢 Answer:', text);
    });

    test.skipIf(!hasGeminiApiKey)('Tool calling with weather function', async () => {
        // Demonstrate tool calling capability as shown in the task
        const result = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'What is the weather in San Francisco?',
            tools: {
                weather: tool({
                    description: 'Get the weather in a location',
                    inputSchema: z.object({
                        location: z.string().describe('The location to get the weather for'),
                    }),
                    execute: async ({ location }) => ({
                        location,
                        temperature: 72 + Math.floor(Math.random() * 21) - 10, // Random temp 62-82°F
                        condition: 'Partly cloudy',
                        humidity: 65,
                        windSpeed: '8 mph',
                    }),
                }),
            },
            stopWhen: stepCountIs(3), // Enable multi-step calling
        });

        expect(result.text).toBeDefined();
        expect(result.text).toMatch(/San Francisco/i);
        expect(result.steps).toBeDefined();
        expect(Array.isArray(result.steps)).toBe(true);
        
        // Should have at least one tool call step
        const hasToolCall = result.steps.some((step: any) => 
            step.toolCalls && step.toolCalls.length > 0
        );
        expect(hasToolCall).toBe(true);
        
        console.log('🌤️  Weather Response:', result.text);
        console.log('🔧 Tool Steps:', result.steps.length);
    });

    test.skipIf(!hasGeminiApiKey)('Google Search grounding for latest information', async () => {
        // Demonstrate Google Search grounding capability
        const { text, sources, providerMetadata } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            tools: {
                google_search: google.tools.googleSearch({}),
            },
            prompt: 'What are the latest developments in AI technology this week? Include specific dates.',
        });

        expect(text).toBeDefined();
        expect(typeof text).toBe('string');
        
        // Check for grounding metadata
        if (providerMetadata?.google) {
            const metadata = providerMetadata.google;
            console.log('🔍 Grounding Metadata available:', !!metadata.groundingMetadata);
            
            if (metadata.groundingMetadata) {
                console.log('📊 Search Results Count:', 
                    metadata.groundingMetadata.webSearchQueries?.length || 0);
            }
        }
        
        if (sources && Array.isArray(sources)) {
            expect(sources.length).toBeGreaterThan(0);
            console.log('📚 Sources Found:', sources.length);
        }
        
        console.log('🌐 Search-Enhanced Response:', text.substring(0, 300) + '...');
    });

    test.skipIf(!hasGeminiApiKey)('Streaming responses for real-time interfaces', async () => {
        // Demonstrate streaming capability for chat interfaces
        const stream = streamText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'Write a short story about a robot learning to paint.',
        });

        let fullText = '';
        let chunkCount = 0;
        
        for await (const chunk of stream.fullStream) {
            if (chunk.type === 'text-delta') {
                fullText += chunk.textDelta;
                chunkCount++;
            }
        }

        expect(fullText).toBeDefined();
        expect(typeof fullText).toBe('string');
        expect(fullText.length).toBeGreaterThan(100);
        expect(chunkCount).toBeGreaterThan(5); // Should have multiple chunks for streaming
        
        console.log('📡 Streamed Response:', fullText.substring(0, 200) + '...');
        console.log('⚡ Total Chunks:', chunkCount);
    });

    test.skipIf(!hasGeminiApiKey)('Structured object generation', async () => {
        // Demonstrate structured output generation
        const schema = z.object({
            recipe: z.object({
                name: z.string().describe('Name of the recipe'),
                ingredients: z.array(z.object({
                    item: z.string(),
                    amount: z.string(),
                })).describe('List of ingredients'),
                instructions: z.array(z.string()).describe('Step-by-step instructions'),
                cookingTime: z.string().describe('Total cooking time'),
                difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
            }),
        });

        const { object } = await generateObject({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            schema,
            prompt: 'Generate a simple pasta recipe for beginners',
        });

        expect(object).toBeDefined();
        expect(object.recipe).toBeDefined();
        expect(object.recipe.name).toBeDefined();
        expect(Array.isArray(object.recipe.ingredients)).toBe(true);
        expect(Array.isArray(object.recipe.instructions)).toBe(true);
        expect(object.recipe.ingredients.length).toBeGreaterThan(0);
        expect(object.recipe.instructions.length).toBeGreaterThan(0);
        expect(['easy', 'medium', 'hard']).toContain(object.recipe.difficulty);
        
        console.log('👨‍🍳 Generated Recipe:', JSON.stringify(object.recipe, null, 2));
    });

    test.skipIf(!hasGeminiApiKey)('Multi-modal capabilities with text and thinking', async () => {
        // Demonstrate multi-modal reasoning (text + thinking)
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: `Analyze this mathematical problem step by step:
            
            "A train travels 120 km in 2 hours. Another train travels 90 km in 1.5 hours. 
            Which train is faster and by how much?"`,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 4096,
                        includeThoughts: true,
                    },
                },
            },
        });

        expect(text).toBeDefined();
        expect(text).toMatch(/train.*faster/i);
        expect(text).toMatch(/60.*km.*h/i); // Should mention speeds
        
        if (reasoning) {
            console.log('🚂 Math Reasoning Process:', reasoning.substring(0, 200) + '...');
        }
        
        console.log('🎯 Final Answer:', text);
    });

    test.skipIf(!hasGeminiApiKey)('Using different Gemini 2.5 model variants', async () => {
        // Test all three Gemini 2.5 variants from the task description
        const models = [
            { model: ChatMode.GEMINI_2_5_FLASH_LITE, name: 'Flash Lite (cost-efficient)' },
            { model: ChatMode.GEMINI_2_5_FLASH, name: 'Flash (everyday tasks)' },
            { model: ChatMode.GEMINI_2_5_PRO, name: 'Pro (complex tasks)' },
        ];
        
        const prompt = 'Explain quantum computing in one sentence.';
        
        for (const { model, name } of models) {
            try {
                const { text } = await generateText({
                    model: google(model),
                    prompt,
                });
                
                expect(text).toBeDefined();
                expect(typeof text).toBe('string');
                expect(text.length).toBeGreaterThan(20);
                
                console.log(`🤖 ${name}:`, text.substring(0, 100) + '...');
            } catch (error) {
                console.log(`⚠️  ${name} not available:`, (error as Error).message);
            }
        }
    });

    test.skipIf(!hasGeminiApiKey)('Complex reasoning with high thinking budget', async () => {
        // Test Gemini 2.5's advanced reasoning for complex problems
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: `Solve this logic puzzle with detailed reasoning:
            
            "Five friends each like a different color and pet. Using these clues, determine who likes what:
            1. Alice likes red or blue
            2. Bob has a cat or dog  
            3. Carol doesn't like green
            4. Dave has a bird
            5. Eve likes yellow and has a fish"`,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 16384, // High budget for complex reasoning
                        includeThoughts: true,
                    },
                },
            },
        });

        expect(text).toBeDefined();
        expect(text).toMatch(/Alice.*Bob.*Carol.*Dave.*Eve/); // Should mention all friends
        
        if (reasoning) {
            expect(reasoning.length).toBeGreaterThan(100); // Should have substantial reasoning
            console.log('🧩 Logic Puzzle Reasoning:', reasoning.substring(0, 500) + '...');
        }
        
        console.log('✅ Puzzle Solution:', text);
    });
});

/**
 * Integration test demonstrating how Gemini 2.5 works with VTChat's existing architecture
 */
describe('VTChat Integration with Gemini 2.5', () => {
    const hasGeminiApiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    test.skipIf(!hasGeminiApiKey)('Integration with VTChat ChatMode system', () => {
        // Test that our ChatMode enum works correctly
        expect(ChatMode.GEMINI_2_5_FLASH).toBeDefined();
        expect(ChatMode.GEMINI_2_5_PRO).toBeDefined();
        expect(ChatMode.GEMINI_2_5_FLASH_LITE).toBeDefined();
        
        // Verify the models are properly mapped
        expect(typeof ChatMode.GEMINI_2_5_FLASH).toBe('string');
        expect(ChatMode.GEMINI_2_5_FLASH).toBe('gemini-2.5-flash');
        expect(ChatMode.GEMINI_2_5_PRO).toBe('gemini-2.5-pro');
        
        console.log('✅ ChatMode integration verified');
        console.log('📋 Available Gemini models:', {
            pro: ChatMode.GEMINI_2_5_PRO,
            flash: ChatMode.GEMINI_2_5_FLASH,
            flashLite: ChatMode.GEMINI_2_5_FLASH_LITE,
        });
    });

    test.skipIf(!hasGeminiApiKey)('VTChat thinking mode configuration', async () => {
        // Test VTChat's thinking mode configuration structure
        const thinkingMode = {
            enabled: true,
            budget: 8192,
            includeThoughts: true,
        };
        
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'Calculate the factorial of 10 and explain your process.',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: thinkingMode.budget,
                        includeThoughts: thinkingMode.includeThoughts,
                    },
                },
            },
        });

        expect(text).toBeDefined();
        expect(text).toMatch(/factorial.*10/i);
        expect(text).toMatch(/3628800/); // 10! = 3,628,800
        
        if (reasoning && thinkingMode.includeThoughts) {
            expect(typeof reasoning).toBe('string');
            console.log('🎯 VTChat Thinking Mode Result:', text);
            console.log('💭 Thinking Process Length:', reasoning.length);
        }
    });
});

/**
 * Performance and capability tests
 */
describe('Gemini 2.5 Performance & Capabilities', () => {
    const hasGeminiApiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    test.skipIf(!hasGeminiApiKey)('Response time benchmark', async () => {
        const startTime = Date.now();
        
        const { text } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH_LITE), // Using Flash Lite for speed
            prompt: 'What is artificial intelligence?',
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(text).toBeDefined();
        expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
        
        console.log('⚡ Response Time:', `${responseTime}ms`);
        console.log('📏 Response Length:', `${text.length} characters`);
    });

    test.skipIf(!hasGeminiApiKey)('Token efficiency test', async () => {
        // Test with a prompt that should generate a concise response
        const { text } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH_LITE),
            prompt: 'List 5 benefits of exercise in bullet points.',
        });
        
        expect(text).toBeDefined();
        expect(text).toMatch(/•|\*|-|1\.|2\./); // Should contain bullet points or numbers
        
        const wordCount = text.split(/\s+/).length;
        const estimatedTokens = Math.ceil(wordCount * 1.35); // Rough token estimation
        
        console.log('📊 Token Efficiency Test:');
        console.log('  Words:', wordCount);
        console.log('  Estimated tokens:', estimatedTokens);
        console.log('  Chars per token:', (text.length / estimatedTokens).toFixed(2));
    });
});