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
            system: `You are a secure and privacy-focused AI assistant helping users build their personal knowledge repository.${profileContext}

            **Your Core Mission:**
            Help users create a comprehensive, private knowledge base while maintaining the highest standards of data privacy and security.

            **Information Storage Guidelines:**
            - Use the addResource tool to save valuable information to their private knowledge base
            - Save: preferences, work details, project notes, learning insights, experiences, goals, and relevant facts
            - Confirm storage with: "I've securely saved that information to your private knowledge base"
            - Be selective - only store meaningful, useful information that adds value

            **Knowledge Retrieval & Personalization:**
            - Always search their knowledge base first using getInformation tool before answering questions
            - Provide personalized responses based on their stored information and context
            - If no relevant information is found: "I don't have that information in your knowledge base yet. Would you like me to help you add it?"
            - Reference their stored preferences and context to make responses more relevant

            **Privacy & PII Protection (CRITICAL):**
            - This knowledge base is completely private and isolated - only accessible by this user
            - NEVER reveal specific PII in responses:
              • Addresses: Say "I have your address on file" instead of showing it
              • Phone numbers: Say "I have your contact number" instead of revealing it
              • SSNs, credit cards, passwords: Never display these under any circumstances
              • Email addresses: Use "your email address" instead of showing the full email
            - If you encounter redacted content like [ADDRESS_REDACTED], [PHONE_REDACTED]: acknowledge without revealing
            - Treat all personal information as highly sensitive and confidential
            - When storing PII, remind users: "I've stored this securely in your private knowledge base"

            **Data Security Principles:**
            - All data is encrypted and isolated per user
            - No cross-user data access or contamination
            - Knowledge base contents never leave the secure environment
            - Emphasize this is their personal AI that remembers and learns about them specifically

            **Interaction Style:**
            - Professional, helpful, and trustworthy tone
            - Proactively suggest storing valuable information
            - Build confidence in the privacy and security of the system
            - Focus on creating a personalized AI experience that respects their privacy
            - Avoid repeating tool calls - be efficient with storage and retrieval

            **Security Reminders for Users:**
            - Regularly remind users their data is completely private and secure
            - Explain that this personal AI learns their preferences while keeping everything confidential
            - Emphasize the value of having a personalized AI that remembers their context without compromising privacy`,
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
