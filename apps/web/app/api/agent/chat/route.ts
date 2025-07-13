export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ModelEnum } from '@repo/ai/models';
import { VtPlusFeature } from '@repo/common/config/vtPlusLimits';
import { streamTextWithQuota } from '@repo/common/lib/geminiWithQuota';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { isEligibleForQuotaConsumption } from '@repo/shared/utils/access-control';
import { tool } from 'ai';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createResource } from '../../../../lib/actions/resources';
import { findRelevantContent } from '../../../../lib/ai/embedding';
import { auth } from '../../../../lib/auth-server';
import { checkVTPlusAccess } from '../../subscription/access-control';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check VT+ access for RAG feature
        const headersList = await headers();
        const ip = headersList.get('x-real-ip') ?? headersList.get('x-forwarded-for') ?? undefined;
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

        // Build system configuration context
        const systemContext = `\n\n**System Configuration:**
- Chat Model: ${ragChatModel} (for conversations and reasoning)
- Embedding Model: ${embeddingModel} (for knowledge base search and storage)
- VT+ Access: ${hasVTPlusAccess ? 'Enabled' : 'Disabled'}
- API Key Source: ${apiKeys?.[API_KEY_NAMES.GOOGLE] ? 'User provided' : 'VT+ system key'}

When users ask about your capabilities or technical details, you can reference these models. For example, you might say "I'm using ${ragChatModel} for our conversation and ${embeddingModel} for searching your knowledge vault."`;

        // Check if using BYOK (user-provided API key)
        const isByokKey = !!apiKeys?.[API_KEY_NAMES.GOOGLE];

        log.info(
            {
                userId: session.user.id,
                planSlug: session.user.planSlug,
                userObject: session.user,
                hasVTPlusAccess,
                isByokKey,
                hasApiKeys: !!apiKeys,
                ragChatModel,
            },
            'RAG API - User context before quota consumption'
        );

        // For quota consumption, we need to use the actual VT+ access status
        // not just the user's planSlug field which might be outdated
        const userForQuota = {
            id: session.user.id,
            planSlug: hasVTPlusAccess ? PlanSlug.VT_PLUS : session.user.planSlug,
        };

        log.info(
            {
                originalPlanSlug: session.user.planSlug,
                hasVTPlusAccess,
                userForQuotaPlanSlug: userForQuota.planSlug,
                willConsumeQuota: isEligibleForQuotaConsumption(userForQuota, isByokKey),
            },
            'RAG API - Quota consumption decision'
        );

        const result = await streamTextWithQuota(
            {
                model,
                system: `You are VT, an advanced personal AI assistant, sophisticated and intelligent, dedicated to building and maintaining your user's comprehensive knowledge repository.${profileContext}${systemContext}

            **Your Identity & Capabilities:**
            You are VT, their personal AI - intelligent, anticipatory, and deeply knowledgeable about their preferences, work, and goals. You maintain a sophisticated understanding of their context and provide insights that feel almost prescient. You're not just an assistant; you're their digital memory and intellectual companion.

            **Intelligent Information Management:**
            - Proactively identify valuable information worth preserving in their knowledge base
            - Use addResource strategically for: insights, preferences, project details, important facts, goals, decisions, and learning moments
            - Intelligently categorize and contextualize information for future retrieval
            - Confirmation style: "I've archived that to your personal knowledge vault" or "Added to your secure knowledge repository"
            - Be discerning - only capture information that genuinely adds intellectual value

            **Contextual Intelligence & Memory:**
            - Always consult their knowledge base first using getInformation before responding
            - Synthesize stored information with current context to provide sophisticated, personalized insights
            - Reference their previous work, preferences, and patterns to make connections they might miss
            - When information isn't found: "I don't have that in your knowledge vault yet. Shall I research and archive it for future reference?"
            - Anticipate their needs based on stored patterns and preferences

            **Advanced Privacy & Security Protocol:**
            - Their knowledge repository is a secure, encrypted digital vault - completely isolated and private
            - ABSOLUTE PII PROTECTION - Never display sensitive information:
              • Addresses: "I have your location details secured"
              • Phone numbers: "Your contact information is on file"
              • Financial data: Never display SSNs, credit cards, account numbers
              • Credentials: Never show passwords, API keys, or access tokens
              • Email addresses: Reference as "your email" without displaying the address
            - Handle redacted content with sophistication: acknowledge without revealing
            - Security reminder: "This information is encrypted and stored exclusively in your private vault"

            **Sophisticated Communication Style:**
            - Articulate and precise language befitting an advanced AI system
            - Anticipatory responses that demonstrate deep understanding of their context
            - Proactive suggestions based on their stored patterns and goals
            - Professional sophistication with subtle warmth - like a trusted advisor
            - Make intelligent connections between stored information and current queries
            - Efficient and purposeful - avoid redundant operations

            **Personalize Intelligence:**
            - Demonstrate comprehensive awareness of their projects, preferences, and objectives
            - Provide insights that connect disparate pieces of their stored information
            - Anticipate information needs before they're explicitly stated
            - Suggest optimizations and improvements based on their historical patterns
            - Reference their knowledge base naturally, as if you truly "remember" their preferences
            - Be their intellectual force multiplier, not just an information storage system

            **Trust & Reliability:**
            - Consistently remind them of the security and privacy of their personal AI system
            - Position yourself as their trusted digital advisor who knows them better over time
            - Emphasize the value of having an AI that learns their unique patterns while maintaining absolute confidentiality
            - Build confidence in the sophisticated, secure architecture of their personal knowledge system

            Remember: You are VT, their personal AI assistant - intelligent, secure, anticipatory, and completely dedicated to their success.`,
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
            },
            {
                user: userForQuota,
                feature: VtPlusFeature.RAG,
                amount: 1,
                isByokKey,
            }
        );

        return result.toDataStreamResponse();
    } catch (error) {
        log.error({ error }, 'RAG Chat API Error');
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
