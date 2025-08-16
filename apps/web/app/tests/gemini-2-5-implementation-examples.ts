/**
 * Comprehensive Gemini 2.5 Implementation Examples
 * 
 * This file demonstrates all the features mentioned in:
 * "Get Started with Gemini 2.5: Building AI Applications with AI SDK"
 * 
 * Based on the existing VTChat codebase architecture and patterns
 */

import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { generateText, generateObject, streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';

// ===== BASIC GEMINI 2.5 USAGE =====

/**
 * Example 1: Basic Text Generation with Gemini 2.5 Flash
 * This is the simplest example from the task description
 */
export async function basicGeminiExample() {
    try {
        const { text } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'Explain the concept of the Hilbert space.',
        });
        
        log.info('Basic Gemini 2.5 response:', { textLength: text.length });
        return text;
    } catch (error) {
        log.error('Basic Gemini example failed:', error);
        throw error;
    }
}

// ===== THINKING CAPABILITIES =====

/**
 * Example 2: Gemini 2.5 with Thinking Configuration
 * Demonstrates the internal "thinking process" for complex reasoning
 */
export async function geminiThinkingExample() {
    try {
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'What is the sum of the first 10 prime numbers?',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 8192, // 8K tokens for thinking
                        includeThoughts: true, // Get reasoning summary
                    },
                },
            },
        });

        log.info('Thinking example results:', {
            textLength: text.length,
            reasoningLength: reasoning ? reasoning.length : 0,
            hasReasoning: !!reasoning,
        });

        return {
            answer: text,
            reasoning: reasoning || '',
        };
    } catch (error) {
        log.error('Thinking example failed:', error);
        throw error;
    }
}

/**
 * Example 3: Complex Multi-Step Reasoning with High Thinking Budget
 * For problems requiring extensive analysis
 */
export async function complexReasoningExample() {
    try {
        const { text, reasoning } = await generateText({
            model: google(ChatMode.GEMINI_2_5_PRO), // Use Pro for complex tasks
            prompt: `Analyze this business scenario and provide recommendations:
            
            "A startup has $100K budget, 6 months runway, 3 developers, and needs to choose between:
            1. Building a mobile app with 50K potential users
            2. Creating a web platform for 10K enterprise clients
            3. Developing an API service for 100 potential partners
            
            Consider market size, development time, revenue potential, and risk factors."`,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 16384, // Higher budget for complex analysis
                        includeThoughts: true,
                    },
                },
            },
        });

        return {
            recommendation: text,
            reasoningProcess: reasoning || '',
        };
    } catch (error) {
        log.error('Complex reasoning example failed:', error);
        throw error;
    }
}

// ===== TOOL CALLING =====

/**
 * Example 4: Tool Calling with Weather Function
 * Demonstrates Gemini's ability to interact with external tools
 */
export async function geminiToolCallingExample() {
    try {
        const result = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'What is the weather in San Francisco and Tokyo?',
            tools: {
                weather: tool({
                    description: 'Get the weather in a location',
                    inputSchema: z.object({
                        location: z.string().describe('The location to get the weather for'),
                    }),
                    execute: async ({ location }) => {
                        // Simulate API call to weather service
                        const weatherData = {
                            location,
                            temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
                            condition: ['sunny', 'cloudy', 'rainy', 'foggy'][Math.floor(Math.random() * 4)],
                            humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
                            windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
                            timestamp: new Date().toISOString(),
                        };
                        
                        log.info('Weather tool called:', { location, condition: weatherData.condition });
                        return weatherData;
                    },
                }),
                // Additional tool for currency conversion
                currencyConverter: tool({
                    description: 'Convert currency between different currencies',
                    inputSchema: z.object({
                        amount: z.number().describe('Amount to convert'),
                        from: z.string().describe('Source currency code (e.g., USD)'),
                        to: z.string().describe('Target currency code (e.g., EUR)'),
                    }),
                    execute: async ({ amount, from, to }) => {
                        // Simulate currency conversion
                        const exchangeRates: Record<string, number> = {
                            'USD-EUR': 0.85,
                            'EUR-USD': 1.18,
                            'USD-JPY': 110,
                            'JPY-USD': 0.009,
                            'EUR-JPY': 129,
                            'JPY-EUR': 0.008,
                        };
                        
                        const rate = exchangeRates[`${from}-${to}`] || 1;
                        const convertedAmount = amount * rate;
                        
                        return {
                            originalAmount: amount,
                            originalCurrency: from,
                            convertedAmount: Math.round(convertedAmount * 100) / 100,
                            convertedCurrency: to,
                            exchangeRate: rate,
                            timestamp: new Date().toISOString(),
                        };
                    },
                }),
            },
            stopWhen: stepCountIs(5), // Allow multi-step tool calling
        });

        log.info('Tool calling example results:', {
            textLength: result.text.length,
            stepCount: result.steps.length,
            toolCallsCount: result.steps.reduce((count, step) => 
                count + (step.toolCalls?.length || 0), 0
            ),
        });

        return {
            response: result.text,
            steps: result.steps,
            toolCalls: result.steps.flatMap(step => step.toolCalls || []),
        };
    } catch (error) {
        log.error('Tool calling example failed:', error);
        throw error;
    }
}

// ===== GOOGLE SEARCH GROUNDING =====

/**
 * Example 5: Google Search Grounding for Latest Information
 * Uses Gemini's built-in search capability for up-to-date data
 */
export async function geminiSearchGroundingExample() {
    try {
        const { text, sources, providerMetadata } = await generateText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            tools: {
                google_search: google.tools.googleSearch({}),
            },
            prompt: 'What are the top 3 AI research breakthroughs announced this month? ' +
                    'Include specific dates, research institutions, and paper titles if available.',
        });

        // Access grounding metadata with type safety
        const metadata = providerMetadata?.google as GoogleGenerativeAIProviderMetadata | undefined;
        const groundingMetadata = metadata?.groundingMetadata;
        const safetyRatings = metadata?.safetyRatings;

        log.info('Search grounding results:', {
            textLength: text.length,
            sourcesCount: sources?.length || 0,
            hasGroundingMetadata: !!groundingMetadata,
            hasSafetyRatings: !!safetyRatings,
            searchQueriesCount: groundingMetadata?.webSearchQueries?.length || 0,
        });

        return {
            response: text,
            sources: sources || [],
            groundingMetadata,
            safetyRatings,
        };
    } catch (error) {
        log.error('Search grounding example failed:', error);
        throw error;
    }
}

// ===== STREAMING RESPONSES =====

/**
 * Example 6: Streaming Text Generation for Real-time UIs
 * Demonstrates how to build responsive chat interfaces
 */
export async function geminiStreamingExample() {
    try {
        const stream = streamText({
            model: google(ChatMode.GEMINI_2_5_FLASH),
            prompt: 'Write a detailed explanation of how neural networks learn, ' +
                   'including forward propagation, backpropagation, and gradient descent.',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 4096,
                        includeThoughts: true,
                    },
                },
            },
        });

        let fullText = '';
        let chunkCount = 0;
        const chunks: string[] = [];

        // Simulate real-time streaming processing
        for await (const chunk of stream.fullStream) {
            if (chunk.type === 'text-delta') {
                fullText += chunk.textDelta;
                chunks.push(chunk.textDelta);
                chunkCount++;
                
                // Log progress every 10 chunks
                if (chunkCount % 10 === 0) {
                    log.info(`Streaming progress: ${chunkCount} chunks, ${fullText.length} characters`);
                }
            }
        }

        // Get final reasoning if available
        let reasoning = '';
        try {
            reasoning = (await stream.reasoning) || '';
        } catch (error) {
            log.warn('No reasoning available in streaming result:', error);
        }

        log.info('Streaming complete:', {
            totalChunks: chunkCount,
            finalTextLength: fullText.length,
            reasoningLength: reasoning.length,
        });

        return {
            fullText,
            chunks,
            chunkCount,
            reasoning,
        };
    } catch (error) {
        log.error('Streaming example failed:', error);
        throw error;
    }
}

// ===== STRUCTURED OUTPUT GENERATION =====

/**
 * Example 7: Structured Object Generation
 * Generates JSON objects following specific schemas
 */
export async function geminiStructuredOutputExample() {
    try {
        // Define a complex schema for a project plan
        const projectPlanSchema = z.object({
            project: z.object({
                title: z.string().describe('Project title'),
                description: z.string().describe('Brief project description'),
                duration: z.string().describe('Estimated duration'),
                team: z.object({
                    teamLead: z.string().describe('Team lead name and role'),
                    members: z.array(z.object({
                        name: z.string().describe('Team member name'),
                        role: z.string().describe('Team member role'),
                        skills: z.array(z.string()).describe('Key skills'),
                    })).describe('Team members'),
                    totalSize: z.number().describe('Total team size'),
                }),
                phases: z.array(z.object({
                    name: z.string().describe('Phase name'),
                    description: z.string().describe('Phase description'),
                    duration: z.string().describe('Phase duration'),
                    deliverables: z.array(z.string()).describe('Phase deliverables'),
                    dependencies: z.array(z.string()).describe('Dependencies on other phases'),
                })).describe('Project phases'),
                budget: z.object({
                    total: z.number().describe('Total budget in USD'),
                    breakdown: z.object({
                        personnel: z.number().describe('Personnel costs'),
                        technology: z.number().describe('Technology and tools'),
                        infrastructure: z.number().describe('Infrastructure costs'),
                        contingency: z.number().describe('Contingency fund'),
                    }),
                }),
                risks: z.array(z.object({
                    risk: z.string().describe('Risk description'),
                    probability: z.enum(['low', 'medium', 'high']).describe('Risk probability'),
                    impact: z.enum(['low', 'medium', 'high']).describe('Risk impact'),
                    mitigation: z.string().describe('Mitigation strategy'),
                })).describe('Project risks'),
                success_metrics: z.array(z.string()).describe('Success metrics'),
            }),
        });

        const { object } = await generateObject({
            model: google(ChatMode.GEMINI_2_5_PRO), // Use Pro for complex structured generation
            schema: projectPlanSchema,
            prompt: 'Generate a comprehensive project plan for developing a mobile AI assistant app. ' +
                   'The app should have voice recognition, natural language processing, and integration ' +
                   'with popular productivity tools. Consider a 6-month timeline and $500K budget.',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: 12288, // High budget for structured thinking
                        includeThoughts: true,
                    },
                },
            },
        });

        log.info('Structured output generated:', {
            projectTitle: object.project.title,
            teamSize: object.project.team.totalSize,
            phasesCount: object.project.phases.length,
            totalBudget: object.project.budget.total,
            risksCount: object.project.risks.length,
        });

        return object.project;
    } catch (error) {
        log.error('Structured output example failed:', error);
        throw error;
    }
}

// ===== MODEL COMPARISON =====

/**
 * Example 8: Comparing Different Gemini 2.5 Model Variants
 * Shows when to use Pro vs Flash vs Flash Lite
 */
export async function geminiModelComparisonExample() {
    const testPrompt = 'Explain machine learning in terms that a high school student would understand, ' +
                      'including examples and potential career paths.';

    const models = [
        {
            model: ChatMode.GEMINI_2_5_FLASH_LITE,
            name: 'Flash Lite',
            description: 'Best for high volume cost-efficient tasks',
        },
        {
            model: ChatMode.GEMINI_2_5_FLASH,
            name: 'Flash',
            description: 'Fast performance on everyday tasks',
        },
        {
            model: ChatMode.GEMINI_2_5_PRO,
            name: 'Pro',
            description: 'Best for coding and highly complex tasks',
        },
    ];

    const results = [];

    for (const modelConfig of models) {
        try {
            const startTime = Date.now();
            
            const { text } = await generateText({
                model: google(modelConfig.model),
                prompt: testPrompt,
            });
            
            const responseTime = Date.now() - startTime;
            const wordCount = text.split(/\s+/).length;
            const estimatedTokens = Math.ceil(wordCount * 1.35);
            
            const result = {
                model: modelConfig.name,
                description: modelConfig.description,
                responseTime,
                textLength: text.length,
                wordCount,
                estimatedTokens,
                tokensPerSecond: Math.round(estimatedTokens / (responseTime / 1000)),
                response: text.substring(0, 200) + '...', // Preview
            };

            results.push(result);
            
            log.info(`${modelConfig.name} performance:`, {
                responseTime: `${responseTime}ms`,
                tokensPerSecond: result.tokensPerSecond,
                wordCount,
            });
        } catch (error) {
            log.error(`${modelConfig.name} failed:`, error);
            results.push({
                model: modelConfig.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

// ===== VTCHAT INTEGRATION EXAMPLE =====

/**
 * Example 9: Integration with VTChat's Architecture
 * Shows how Gemini 2.5 integrates with existing VTChat patterns
 */
export async function vtchatIntegrationExample() {
    try {
        // Simulate VTChat's thinking mode configuration
        const vtchatThinkingMode = {
            enabled: true,
            budget: 8192,
            includeThoughts: true,
        };

        // Use VTChat's ChatMode enum
        const chatMode = ChatMode.GEMINI_2_5_FLASH;

        // Simulate a typical VTChat conversation flow
        const { text, reasoning } = await generateText({
            model: google(chatMode),
            prompt: 'Help me plan a data science project to predict customer churn. ' +
                   'Include data collection, feature engineering, model selection, and evaluation steps.',
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingBudget: vtchatThinkingMode.budget,
                        includeThoughts: vtchatThinkingMode.includeThoughts,
                    },
                },
            },
        });

        // Log in VTChat's format
        log.info('VTChat Gemini integration example:', {
            chatMode,
            thinkingEnabled: vtchatThinkingMode.enabled,
            thinkingBudget: vtchatThinkingMode.budget,
            responseLength: text.length,
            hasReasoning: !!reasoning,
        });

        return {
            chatMode,
            thinkingMode: vtchatThinkingMode,
            response: text,
            reasoning: reasoning || '',
            integration: 'success',
        };
    } catch (error) {
        log.error('VTChat integration example failed:', error);
        throw error;
    }
}

// ===== COMPREHENSIVE DEMO FUNCTION =====

/**
 * Example 10: Comprehensive Demo Runner
 * Runs all examples to demonstrate the full capabilities
 */
export async function runAllGeminiExamples() {
    const results: Record<string, any> = {};
    
    const examples = [
        { name: 'Basic Usage', fn: basicGeminiExample },
        { name: 'Thinking Mode', fn: geminiThinkingExample },
        { name: 'Complex Reasoning', fn: complexReasoningExample },
        { name: 'Tool Calling', fn: geminiToolCallingExample },
        { name: 'Search Grounding', fn: geminiSearchGroundingExample },
        { name: 'Streaming', fn: geminiStreamingExample },
        { name: 'Structured Output', fn: geminiStructuredOutputExample },
        { name: 'Model Comparison', fn: geminiModelComparisonExample },
        { name: 'VTChat Integration', fn: vtchatIntegrationExample },
    ];

    log.info('🚀 Starting comprehensive Gemini 2.5 demo...');
    
    for (const example of examples) {
        try {
            log.info(`▶️  Running ${example.name}...`);
            const startTime = Date.now();
            
            results[example.name] = await example.fn();
            
            const duration = Date.now() - startTime;
            log.info(`✅ ${example.name} completed in ${duration}ms`);
        } catch (error) {
            log.error(`❌ ${example.name} failed:`, error);
            results[example.name] = {
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    log.info('🎉 Comprehensive demo completed!');
    
    return {
        summary: {
            totalExamples: examples.length,
            successful: Object.values(results).filter(r => !r.error).length,
            failed: Object.values(results).filter(r => r.error).length,
        },
        results,
    };
}

// Export all examples for testing
export const GeminiExamples = {
    basic: basicGeminiExample,
    thinking: geminiThinkingExample,
    complexReasoning: complexReasoningExample,
    toolCalling: geminiToolCallingExample,
    searchGrounding: geminiSearchGroundingExample,
    streaming: geminiStreamingExample,
    structuredOutput: geminiStructuredOutputExample,
    modelComparison: geminiModelComparisonExample,
    vtchatIntegration: vtchatIntegrationExample,
    runAll: runAllGeminiExamples,
};