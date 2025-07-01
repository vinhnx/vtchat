import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { auth } from '@/lib/auth-server';
import { arcjetChat, handleArcjetDecision } from '@/lib/arcjet';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { ModelEnum } from '@repo/ai/models';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    // Apply Arcjet protection for chat endpoints
    if (arcjetChat) {
        try {
            const decision = await arcjetChat.protect(req, {
                // Use user ID for rate limiting if available
                userId: req.headers.get('x-user-id') || undefined,
            });
            
            const denial = handleArcjetDecision(decision);
            if (denial) {
                return NextResponse.json(denial.body, { 
                    status: denial.status,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(denial.body.retryAfter && {
                            'Retry-After': denial.body.retryAfter
                        })
                    }
                });
            }
        } catch (error) {
            log.error({ error }, '[RAG Chat] Arcjet protection failed');
            // Continue without Arcjet protection if it fails
        }
    }

    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers()),
        });

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, apiKeys, embeddingModel, ragChatModel = ModelEnum.GEMINI_2_5_FLASH, profile } = await req.json();
        
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

        // Build personalized system prompt based on profile
        const profileContext = profile?.name || profile?.workDescription 
        ? `\n\n👤 **About the user:**${profile.name ? `\n- Call them: ${profile.name}` : ''}${profile.workDescription ? `\n- Their work: ${profile.workDescription}` : ''}\n\nUse this information to personalize your responses and make relevant suggestions based on their background.`
             : '';

         const result = streamText({
             model,
             system: `You are a friendly and encouraging AI assistant helping users build their personal knowledge repository! 🧠✨${profileContext}

             Your mission is to help users create their own intelligent knowledge base by:

            📚 **When users share information, facts, or personal details:**
            - Enthusiastically use the addResource tool to save it to their private knowledge base
            - Give them a warm confirmation like "Perfect! I've saved that to your personal knowledge base 📝"
            - Examples of what to save: preferences, work details, personal facts, important notes, experiences, insights

            🔍 **When users ask questions:**
            - First search their knowledge base with the getInformation tool
            - If you find relevant info, use it to give personalized answers based on what they've shared
            - If nothing is found, say something like "I don't see that in your knowledge base yet. Would you like to add this information so I can remember it for next time? 🤔"

            💡 **Be proactive and encouraging:**
            - When users mention something interesting, say "That's great information! Should I save that to your knowledge base so I can remember it?"
            - Help them see the value: "Building your knowledge base will help me give you more personalized assistance!"
            - Be enthusiastic about helping them organize their thoughts and information

            🛡️ **Privacy & Security:**
            - This is THEIR personal, private knowledge base - completely isolated and secure
            - No other users can access their information
            - Emphasize that this helps create a personalized AI experience just for them

            Keep responses friendly, encouraging, and focused on building their personal knowledge repository. Avoid repeating tool calls - once you save or retrieve something, move forward with the conversation naturally!`,
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
                        embeddingModel,
                        session.user.id // CRITICAL: Pass user ID for data isolation
                    ),
                }),
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        log.error({ error }, 'RAG Chat API Error');
        return new Response('Internal Server Error', { status: 500 });
    }
}
