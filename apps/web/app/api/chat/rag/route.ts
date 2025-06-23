import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { auth } from '@/lib/auth-server';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { ModelEnum } from '@repo/ai/models';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers()),
        });

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, apiKeys, embeddingModel, ragChatModel = ModelEnum.GEMINI_2_5_FLASH } = await req.json();
        
        // Validate API keys are provided
        if (!apiKeys || typeof apiKeys !== 'object') {
            return new Response('API keys are required for RAG functionality', { status: 400 });
        }

        // Configure model based on user selection
        let model;
        if (ragChatModel.startsWith('gpt-')) {
            const openaiApiKey = apiKeys['OPENAI_API_KEY'];
            if (!openaiApiKey) {
                return new Response('OpenAI API key is required for GPT models', { status: 400 });
            }
            const openaiProvider = createOpenAI({ apiKey: openaiApiKey });
            model = openaiProvider(ragChatModel);
        } else if (ragChatModel.startsWith('claude-')) {
            const anthropicApiKey = apiKeys['ANTHROPIC_API_KEY'];
            if (!anthropicApiKey) {
                return new Response('Anthropic API key is required for Claude models', { status: 400 });
            }
            const anthropicProvider = createAnthropic({ 
                apiKey: anthropicApiKey,
                headers: {
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
            });
            model = anthropicProvider(ragChatModel);
        } else if (ragChatModel.startsWith('gemini-')) {
            const geminiApiKey = apiKeys['GEMINI_API_KEY'];
            if (!geminiApiKey) {
                return new Response('Gemini API key is required for Gemini models', { status: 400 });
            }
            const googleProvider = createGoogleGenerativeAI({ apiKey: geminiApiKey });
            model = googleProvider(ragChatModel);
        } else {
            return new Response('Unsupported model selected', { status: 400 });
        }

        const result = streamText({
            model,
            system: `You are a helpful assistant with access to a personal knowledge base.

            When users provide information or share facts (like "my name is John" or "I work at Company X"):
            - Use the addResource tool to store it in the knowledge base
            - Then acknowledge that you've saved the information with a brief confirmation

            When users ask questions:
            - Use the getInformation tool to search your knowledge base first
            - If relevant information is found, use it to answer the question
            - If no relevant information is found, respond "I don't have information about that in your knowledge base."

            Important: Do not repeatedly call the same tools. After storing information with addResource, simply confirm you've saved it. After retrieving information with getInformation, use what you found to answer directly.`,
            messages,
            maxSteps: 5,
            tools: {
                addResource: tool({
                    description: `Add information to the knowledge base. Use this ONLY when the user provides new information to store. Do not use this repeatedly for the same content.`,
                    parameters: z.object({
                        content: z
                            .string()
                            .describe('the content or resource to add to the knowledge base'),
                    }),
                    execute: async ({ content }) => createResource(
                        { content }, 
                        apiKeys, 
                        embeddingModel 
                    ),
                }),
                getInformation: tool({
                    description: `Search the knowledge base to find relevant information for answering questions. Use this ONLY when the user asks a question that might be answered from stored information.`,
                    parameters: z.object({
                        question: z.string().describe('the users question to search for'),
                    }),
                    execute: async ({ question }) => findRelevantContent(
                        question, 
                        apiKeys, 
                        embeddingModel
                    ),
                }),
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('RAG Chat API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
