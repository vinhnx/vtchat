import { auth } from '@/lib/auth-server';
import { ChatModeConfig, ChatMode } from '@repo/shared/config';
import { RATE_LIMIT_MESSAGES } from '@repo/shared/constants';
import { Geo, geolocation } from '@vercel/functions';
import { NextRequest } from 'next/server';
import { checkVTPlusAccess } from '../subscription/access-control';
import { checkRateLimit, recordRequest } from '@/lib/services/rate-limit';
import { getModelFromChatMode, ModelEnum } from '@repo/ai/models';
import { logger } from '@repo/shared/logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

import { executeStream, sendMessage } from './stream-handlers';
import { completionRequestSchema, SSE_HEADERS } from './types';
import { getIp } from './utils';

export async function POST(request: NextRequest) {
    
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: SSE_HEADERS });
    }

    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id ?? undefined;

        const parsed = await request.json().catch(() => ({}));
        
        const validatedBody = completionRequestSchema.safeParse(parsed);

        if (!validatedBody.success) {
            logger.warn({ validationError: validatedBody.error.format() }, 'Request validation failed');
            return new Response(
                JSON.stringify({
                    error: 'Invalid request body',
                    details: validatedBody.error.format(),
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { data } = validatedBody;
        const ip = getIp(request);

        if (!ip) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!!ChatModeConfig[data.mode]?.isAuthRequired && !userId) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Rate limiting for free Gemini 2.5 Flash Lite model
        const selectedModel = getModelFromChatMode(data.mode);
        
        if (selectedModel === ModelEnum.GEMINI_2_5_FLASH_LITE) {
            // BYOK bypass: If user has their own Gemini API key, skip rate limiting entirely
            const geminiApiKey = data.apiKeys?.['GEMINI_API_KEY'];
            const hasByokGeminiKey = !!(geminiApiKey && geminiApiKey.trim().length > 0);
            
            if (!hasByokGeminiKey) {
                // Require authentication for free model access
                if (!userId) {
                    return new Response(
                        JSON.stringify({ 
                            error: 'Authentication required',
                            message: 'Please register to use the free Gemini 2.5 Flash Lite model.',
                            redirect: '/auth/login'
                        }), 
                        {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                }

                // Check rate limits only for users without BYOK
                let rateLimitResult;
                try {
                    rateLimitResult = await checkRateLimit(userId, selectedModel);
                } catch (error) {
                    logger.error({ error }, 'Rate limit check failed');
                    // Continue without rate limiting if check fails (graceful degradation)
                    rateLimitResult = { allowed: true };
                }
                
                if (!rateLimitResult.allowed) {
                    const resetTime = rateLimitResult.reason === 'daily_limit_exceeded' 
                        ? rateLimitResult.resetTime.daily 
                        : rateLimitResult.resetTime.minute;

                    const message = rateLimitResult.reason === 'daily_limit_exceeded'
                        ? RATE_LIMIT_MESSAGES.DAILY_LIMIT_SIGNED_IN
                        : RATE_LIMIT_MESSAGES.MINUTE_LIMIT_SIGNED_IN;

                    return new Response(
                        JSON.stringify({
                            error: 'Rate limit exceeded',
                            message,
                            limitType: rateLimitResult.reason,
                            remainingDaily: rateLimitResult.remainingDaily,
                            remainingMinute: rateLimitResult.remainingMinute,
                            resetTime: resetTime.toISOString(),
                            upgradeUrl: '/plus',
                            usageSettingsAction: 'open_usage_settings'
                        }),
                        {
                            status: 429,
                            headers: { 
                                'Content-Type': 'application/json',
                                'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString()
                            },
                        }
                    );
                }
            }
        }

        // Check VT+ access for gated features
        const modeConfig = ChatModeConfig[data.mode];
        if (modeConfig?.requiredFeature || modeConfig?.requiredPlan) {
            // BYOK bypass: If user has Gemini API key, allow Deep Research and Pro Search without subscription
            const geminiApiKey = data.apiKeys?.['GEMINI_API_KEY'];
            const hasByokGeminiKey = !!(geminiApiKey && geminiApiKey.trim().length > 0);
            const isByokEligibleMode = data.mode === ChatMode.Deep || data.mode === ChatMode.Pro;

            if (!(isByokEligibleMode && hasByokGeminiKey)) {
                const accessResult = await checkVTPlusAccess({ userId, ip });
                if (!accessResult.hasAccess) {
                    return new Response(
                        JSON.stringify({
                            error: 'VT+ subscription required',
                            reason: accessResult.reason,
                            requiredPlan: modeConfig.requiredPlan,
                            requiredFeature: modeConfig.requiredFeature,
                        }),
                        {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                }
            }
        }

        // Backend enforcement: Thinking mode is restricted to VT+ users only
        if (data.thinkingMode?.enabled) {
            const accessResult = await checkVTPlusAccess({ userId, ip });
            if (!accessResult.hasAccess) {
                return new Response(
                    JSON.stringify({
                        error: 'VT+ subscription required for thinking mode',
                        reason: 'Thinking mode is a VT+ exclusive feature',
                        requiredFeature: 'THINKING_MODE',
                    }),
                    {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        }

        // Rate limiting removed - no longer needed

        const enhancedHeaders = {
            ...SSE_HEADERS,
        };

        const _encoder = new TextEncoder();
        const abortController = new AbortController();

        request.signal.addEventListener('abort', () => {
            abortController.abort();
        });

        const gl = geolocation(request);

        const stream = createCompletionStream({
            data,
            userId,
            _ip: ip,
            abortController,
            gl,
            selectedModel,
            hasByokGeminiKey: !!(data.apiKeys?.['GEMINI_API_KEY'] && data.apiKeys['GEMINI_API_KEY'].trim().length > 0),
        });

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        logger.error({ error }, 'Error in POST handler');
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

function createCompletionStream({
    data,
    userId,
    ip: _ip,
    abortController,
    gl,
    selectedModel,
    hasByokGeminiKey,
}: {
    data: any;
    userId?: string;
    _ip?: string;
    abortController: AbortController;
    gl: Geo;
    selectedModel: ModelEnum;
    hasByokGeminiKey: boolean;
}) {
    const _encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            let heartbeatInterval: NodeJS.Timeout | null = null;

            heartbeatInterval = setInterval(() => {
                controller.enqueue(_encoder.encode(': heartbeat\n\n'));
            }, 15000);

            try {
                await executeStream({
                    controller,
                    encoder: _encoder,
                    data,
                    abortController,
                    gl,
                    userId: userId ?? undefined,
                    onFinish: async () => {
                        // Record request for rate limiting (skip for BYOK users)
                        if (userId && selectedModel === ModelEnum.GEMINI_2_5_FLASH_LITE && !hasByokGeminiKey) {
                            await recordRequest(userId, selectedModel);
                        }
                    },
                });
            } catch (error) {
                if (abortController.signal.aborted) {
                    logger.info('abortController.signal.aborted');
                    sendMessage(controller, _encoder, {
                        type: 'done',
                        status: 'aborted',
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                    });
                } else {
                    logger.info('sending error message');
                    sendMessage(controller, _encoder, {
                        type: 'done',
                        status: 'error',
                        error: error instanceof Error ? error.message : String(error),
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                    });
                }
            } finally {
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                }
                controller.close();
            }
        },
        cancel() {
            logger.info('cancelling stream');
            abortController.abort();
        },
    });
}
