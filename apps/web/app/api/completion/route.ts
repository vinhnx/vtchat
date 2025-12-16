import { auth } from '@/lib/auth-server';
import { log } from '@repo/shared/lib/logger';
import { hasImageAttachments, validateByokForImageAnalysis } from '@repo/shared/utils';
import type { NextRequest } from 'next/server';
import { HEARTBEAT_COMMENT, HEARTBEAT_INTERVAL_MS, HEARTBEAT_JITTER_MS } from './constants';
import { executeStream, markControllerClosed } from './stream-handlers';
import { registerStream, unregisterStream } from './stream-registry';
import { completionRequestSchema, SSE_HEADERS } from './types';
import { getIp } from './utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getHeartbeatInterval(): number {
    const jitter = Math.floor(Math.random() * (HEARTBEAT_JITTER_MS * 2)) - HEARTBEAT_JITTER_MS;
    return HEARTBEAT_INTERVAL_MS + jitter;
}

function scheduleHeartbeat(
    controller: ReadableStreamDefaultController<Uint8Array>,
    encoder: TextEncoder,
): () => void {
    const sendHeartbeat = () => {
        try {
            controller.enqueue(encoder.encode(HEARTBEAT_COMMENT));
        } catch {
            // Ignore enqueue errors; caller will handle close/abort
        }
    };

    const timer = setInterval(sendHeartbeat, getHeartbeatInterval());
    return () => clearInterval(timer);
}

export async function POST(request: NextRequest) {
    let body: unknown;

    try {
        try {
            body = await request.json();
        } catch (error) {
            log.warn({ error }, 'Invalid JSON in completion request');
            return new Response(JSON.stringify({ error: 'Invalid request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const parsed = completionRequestSchema.safeParse(body);
        if (!parsed.success) {
            log.warn({ issues: parsed.error.issues }, 'Completion request validation failed');
            return new Response(
                JSON.stringify({ error: 'Invalid request payload', details: parsed.error.issues }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const data = parsed.data;

        // Always enrich with managed Gemini key for server-side web search (Pro/Deep)
        const managedGeminiKey = (process.env.GEMINI_API_KEY
            || process.env.GOOGLE_GENERATIVE_AI_API_KEY
            || '').trim();
        const apiKeys = {
            ...data.apiKeys,
            ...(managedGeminiKey ? { GEMINI_API_KEY: managedGeminiKey } : {}),
        };

        // Enforce BYOK for image analysis when required
        const hasImages = hasImageAttachments({
            imageAttachment: (body as any)?.imageAttachment,
            attachments: (body as any)?.attachments,
            messages: data.messages,
        });
        const validation = validateByokForImageAnalysis({
            chatMode: data.mode,
            apiKeys,
            hasImageAttachments: hasImages,
        });

        if (!validation.isValid) {
            log.warn(
                {
                    threadId: data.threadId,
                    requiredApiKey: validation.requiredApiKey,
                    providerName: validation.providerName,
                },
                'Missing BYOK API key for image analysis request',
            );
            return new Response(
                JSON.stringify({
                    error: validation.errorMessage || 'API key required for image analysis',
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // Auth context (optional for anonymous)
        const session = await auth.api.getSession({ headers: request.headers });
        const userId = session?.user?.id;

        // SSE stream setup
        const encoder = new TextEncoder();
        const abortController = new AbortController();
        const requestId = `${data.threadId}-${data.threadItemId}-${Date.now()}`;

        registerStream(requestId, abortController, { userId, threadId: data.threadId });

        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const cleanupHeartbeat = scheduleHeartbeat(controller, encoder);

                const cleanup = () => {
                    cleanupHeartbeat();
                    unregisterStream(requestId);
                    markControllerClosed(controller);
                };

                try {
                    const result = await executeStream({
                        controller,
                        encoder,
                        data: {
                            ...data,
                            apiKeys,
                        },
                        abortController,
                        gl: request.geo,
                        userId,
                        onFinish: async () => {
                            cleanup();
                            controller.close();
                        },
                    });

                    if (result instanceof Response) {
                        cleanup();
                        controller.close();
                        return;
                    }

                    cleanup();
                    controller.close();
                } catch (error) {
                    log.error(
                        {
                            error,
                            threadId: data.threadId,
                            threadItemId: data.threadItemId,
                            ip: getIp(request),
                        },
                        'Completion stream failed',
                    );
                    cleanup();
                    try {
                        controller.close();
                    } catch {
                        // ignore
                    }
                }
            },
            cancel() {
                abortController.abort();
                unregisterStream(requestId);
            },
        });

        return new Response(stream, {
            status: 200,
            headers: SSE_HEADERS,
        });
    } catch (error) {
        log.error({ error }, 'Unhandled error in completion route');
        return new Response(
            JSON.stringify({ error: 'Service unavailable', detail: String(error) }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
