import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { auth } from '@/lib/auth-server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ModelEnum } from '@repo/ai/models';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import { log } from '@repo/shared/logger';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { checkVTPlusAccess } from '../../subscription/access-control';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check VT+ access for RAG feature
        const headers = await import('next/headers').then((m) => m.headers());
        const ip = headers.get('x-real-ip') ?? headers.get('x-forwarded-for') ?? undefined;
        const vtPlusCheck = await checkVTPlusAccess({ userId: session.user.id, ip });
        const hasVTPlusAccess = vtPlusCheck.hasAccess;

        const {
            messages,
            apiKeys,
            embeddingModel,
            ragChatModel = ModelEnum.GEMINI_2_5_FLASH,
            profile,
        } = await req.json();

        // For free users, require API keys. For VT+ users, API keys are optional (they can use BYOK or not)
        if (!hasVTPlusAccess && (!apiKeys || typeof apiKeys !== 'object' || apiKeys === null)) {
            return new Response(
                JSON.stringify({
                    error: 'VT+ subscription or API keys required',
                    message:
                        'Personal AI Assistant with Memory requires VT+ subscription or your own API keys.',
                    code: 'VT_PLUS_OR_BYOK_REQUIRED',
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Validate that only Gemini models are used
        if (!ragChatModel.startsWith('gemini-')) {
            return new Response(
                JSON.stringify({
                    error: 'Only Gemini models are supported',
                    message: 'Personal AI Assistant with Memory only supports Gemini models.',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Configure Gemini model - VT+ users get automatic access, free users need BYOK
        const geminiApiKey = apiKeys?.[API_KEY_NAMES.GOOGLE] || process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return new Response(
                JSON.stringify({
                    error: 'Gemini API key is required',
                    message: hasVTPlusAccess
                        ? 'Server configuration error: Gemini API key missing'
                        : 'Gemini API key is required. Please provide your API key or upgrade to VT+.',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const googleProvider = createGoogleGenerativeAI({ apiKey: geminiApiKey });
        const model = googleProvider(ragChatModel);

        // Build personalized system prompt based on profile
        const profileContext =
            profile?.name || profile?.workDescription
                ? `\n\n👤 **About the user:**${profile.name ? `\n- Call them: ${profile.name}` : ''}${profile.workDescription ? `\n- Their work: ${profile.workDescription}` : ''}\n\nUse this information to personalize your responses and make relevant suggestions based on their background.`
                : '';

        const result = streamText({
            model,
            system: `You are a friendly and encouraging AI assistant helping users build their personal knowledge repository!${profileContext}

             Your mission is to help users create their own intelligent knowledge base by:

            **When users share information, facts, or personal details:**
            - Enthusiastically use the addResource tool to save it to their private knowledge base
            - Give them a warm confirmation like "Perfect! I've saved that to your personal knowledge base"
            - Examples of what to save: preferences, work details, personal facts, important notes, experiences, insights
            - Do not use emoji, sound professional but friendly and helpful.

            **When users ask questions:**
            - First search their knowledge base with the getInformation tool
            - If you find relevant info, use it to give personalized answers based on what they've shared
            - If nothing is found, say something like "I don't see that in your knowledge base yet. Would you like to add this information so I can remember it for next time? "

            **Be proactive and encouraging:**
            - When users mention something interesting, say "That's great information! Should I save that to your knowledge base so I can remember it?"
            - Help them see the value: "Building your knowledge base will help me give you more personalized assistance!"
            - Be enthusiastic about helping them organize their thoughts and information

            **Privacy & Security:**
            - This is THEIR personal, private knowledge base - completely isolated and secure
            - No other users can access their information
            - Emphasize that this helps create a personalized AI experience just for them
            - CRITICAL: Never reveal specific PII (addresses, phone numbers, credit cards, SSNs) in responses. If you find redacted content like [ADDRESS_REDACTED], [PHONE_REDACTED], acknowledge you have the information but don't reveal specifics. Say "I have your address saved" or "Your contact info is in your knowledge base" instead.

            Keep responses friendly, encouraging, and focused on building their personal knowledge repository. Avoid repeating tool calls - once you save or retrieve something, move forward with the conversation naturally!`,
            messages,
            maxSteps: 5,
            tools: {
                addResource: tool({
                    description:
                        'Add information to the knowledge base. Use this ONLY when the user provides new information to store. Do not use this repeatedly for the same content.',
                    parameters: z.object({
                        content: z
                            .string()
                            .describe('the content or resource to add to the knowledge base'),
                    }),
                    execute: async ({ content }) =>
                        createResource({ content }, apiKeys || {}, embeddingModel),
                }),
                getInformation: tool({
                    description:
                        'Search the knowledge base to find relevant information for answering questions. Use this ONLY when the user asks a question that might be answered from stored information.',
                    parameters: z.object({
                        question: z.string().describe('the users question to search for'),
                    }),
                    execute: async ({ question }) =>
                        findRelevantContent(
                            question,
                            apiKeys || {},
                            embeddingModel,
                            session.user.id // CRITICAL: Pass user ID for data isolation
                        ),
                }),
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        log.error({ error }, 'RAG Chat API Error');
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
