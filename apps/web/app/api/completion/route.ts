import { auth } from '@/lib/auth';
import { ChatModeConfig } from '@repo/shared/config';
import { Geo, geolocation } from '@vercel/functions';
import { NextRequest } from 'next/server';
import { checkRateLimit, checkVTPlusAccess } from '../subscription/access-control';

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

        console.log('ip', ip);

        if (!!ChatModeConfig[data.mode]?.isAuthRequired && !userId) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check VT+ access for gated features
        const modeConfig = ChatModeConfig[data.mode];
        if (modeConfig?.requiredFeature || modeConfig?.requiredPlan) {
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

        // Rate limiting for free tier users
        const rateLimitResult = await checkRateLimit({ userId, ip });
        if (!rateLimitResult.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'Rate limit exceeded',
                    remaining: rateLimitResult.remaining || 0,
                    resetTime: rateLimitResult.resetTime?.toISOString(),
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const enhancedHeaders = {
            ...SSE_HEADERS,
        };

        const encoder = new TextEncoder();
        const abortController = new AbortController();

        request.signal.addEventListener('abort', () => {
            abortController.abort();
        });

        const gl = geolocation(request);

        console.log('gl', gl);

        const stream = createCompletionStream({
            data,
            userId,
            ip,
            abortController,
            gl,
        });

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

function createCompletionStream({
    data,
    userId,
    ip,
    abortController,
    gl,
}: {
    data: any;
    userId?: string;
    ip?: string;
    abortController: AbortController;
    gl: Geo;
}) {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            let heartbeatInterval: NodeJS.Timeout | null = null;

            heartbeatInterval = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 15000);

            try {
                await executeStream({
                    controller,
                    encoder,
                    data,
                    abortController,
                    gl,
                    userId: userId ?? undefined,
                    onFinish: async () => {
                        // Completion finished successfully
                    },
                });
            } catch (error) {
                if (abortController.signal.aborted) {
                    console.log('abortController.signal.aborted');
                    sendMessage(controller, encoder, {
                        type: 'done',
                        status: 'aborted',
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        parentThreadItemId: data.parentThreadItemId,
                    });
                } else {
                    console.log('sending error message');
                    sendMessage(controller, encoder, {
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
            console.log('cancelling stream');
            abortController.abort();
        },
    });
}
