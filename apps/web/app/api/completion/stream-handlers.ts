import { REASONING_BUDGETS } from '@repo/ai/constants/reasoning';
import { runWorkflow } from '@repo/ai/workflow';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import { EnvironmentType, getCurrentEnvironment } from '@repo/shared/types/environment';
import type { Geo } from '@vercel/functions';
import { LARGE_PAYLOAD_THRESHOLD, PING_COMMENT, PING_TIMEOUT_MS } from './constants';
import type { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

/**
 * Safely send a message through SSE with optional connection health check for large payloads
 */
export async function safeSend(
    controller: StreamController,
    encoder: TextEncoder,
    message: string,
    opts: { isLarge?: boolean } = {}
): Promise<boolean> {
    try {
        // Perform health check for large payloads
        if (opts.isLarge) {
            try {
                controller.enqueue(encoder.encode(PING_COMMENT));
                // Micro-sleep to allow enqueue() failure to surface before sending large chunk
                await new Promise((resolve) => setTimeout(resolve, PING_TIMEOUT_MS));
            } catch (pingError) {
                // Connection is dead; bail out silently
                log.warn(
                    {
                        size: message.length,
                        error: pingError instanceof Error ? pingError.message : String(pingError),
                    },
                    'SSE health check failed before large payload'
                );
                return false;
            }
        }

        // Send the actual message
        controller.enqueue(encoder.encode(message));
        // Send empty chunk to ensure flushing on edge environments
        controller.enqueue(new Uint8Array(0));
        return true;
    } catch (error) {
        // Connection is dead
        log.warn(
            {
                size: message.length,
                error: error instanceof Error ? error.message : String(error),
            },
            'Failed to send SSE message'
        );
        return false;
    }
}

/**
 * Get thinking mode configuration for specific chat modes
 * Automatically enables high-effort reasoning for research modes
 */
function getThinkingModeForChatMode(
    mode: ChatMode,
    userThinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    }
) {
    // Auto-enable reasoning for research modes with high budgets
    if (mode === ChatMode.Deep) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.DEEP, // 50K tokens - highest effort
            includeThoughts: userThinkingMode?.includeThoughts ?? true,
        };
    }

    if (mode === ChatMode.Pro) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.BALANCED, // 15K tokens - optimized for Claude 4
            includeThoughts: userThinkingMode?.includeThoughts ?? true,
        };
    }

    // For other modes, use user settings or defaults
    return (
        userThinkingMode || {
            enabled: false,
            budget: 0,
            includeThoughts: false,
        }
    );
}

export async function sendMessage(
    controller: StreamController,
    encoder: TextEncoder,
    payload: Record<string, any>,
    isLargePayload = false
): Promise<boolean> {
    try {
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;

        // Use safeSend with health check for large payloads
        const isLarge = isLargePayload || message.length > LARGE_PAYLOAD_THRESHOLD;
        const success = await safeSend(controller, encoder, message, { isLarge });

        if (!success) {
            log.debug(
                {
                    payloadType: payload.type,
                    threadId: payload.threadId,
                    payloadSize: message.length,
                },
                'Failed to send message, client likely disconnected'
            );
        }

        return success;
    } catch (error) {
        // This is critical - we should log errors in message serialization
        log.error(
            {
                error,
                payloadType: payload.type,
                threadId: payload.threadId,
            },
            'Error serializing message payload'
        );

        // Only try to send error message if controller is still open
        try {
            const errorMessage = `event: done\ndata: ${JSON.stringify({
                type: 'done',
                status: 'error',
                error: 'Failed to serialize payload',
                threadId: payload.threadId,
                threadItemId: payload.threadItemId,
                parentThreadItemId: payload.parentThreadItemId,
            })}\n\n`;
            return await safeSend(controller, encoder, errorMessage);
        } catch {
            // Controller closed during error handling, ignore
            log.debug('Controller closed during error message sending');
            return false;
        }
    }
}

export function normalizeMarkdownContent(content: string): string {
    const normalizedContent = content.replace(/\\n/g, '\n');
    return normalizedContent;
}

export async function executeStream({
    controller,
    encoder,
    data,
    abortController,
    gl,
    userId,
    onFinish,
}: {
    controller: StreamController;
    encoder: TextEncoder;
    data: CompletionRequestType;
    abortController: AbortController;
    userId?: string;
    gl?: Geo;
    onFinish?: () => Promise<void>;
}): Promise<{ success: boolean } | Response> {
    try {
        const { signal } = abortController;

        const workflow = runWorkflow({
            mode: data.mode,
            question: data.prompt,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            messages: data.messages,
            customInstructions: data.customInstructions,
            webSearch: data.webSearch,
            mathCalculator: data.mathCalculator,
            charts: data.charts,
            config: {
                maxIterations: data.maxIterations || 3,
                signal,
            },
            gl,
            showSuggestions: data.showSuggestions,
            onFinish,
            apiKeys: data.apiKeys,
            thinkingMode: getThinkingModeForChatMode(data.mode, data.thinkingMode),
            userTier: data.userTier ?? 'FREE',
            userId,
        });

        workflow.onAll(async (event, payload) => {
            const messagePayload = {
                type: event,
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                query: data.prompt,
                mode: data.mode,
                webSearch: data.webSearch,
                showSuggestions: data.showSuggestions,
                [event]: payload,
            };

            // Detect large payloads (answers, reasoning, content over 5KB)
            const isLargePayload =
                event === 'answer' ||
                event === 'reasoning' ||
                (payload && typeof payload === 'object' && JSON.stringify(payload).length > 5000);

            await sendMessage(controller, encoder, messagePayload, isLargePayload);
        });

        if (getCurrentEnvironment() === EnvironmentType.DEVELOPMENT) {
            log.debug('Starting workflow', { threadId: data.threadId });
        }

        await workflow.start('router', {
            question: data.prompt,
        });

        if (getCurrentEnvironment() === EnvironmentType.DEVELOPMENT) {
            log.debug('Workflow completed', { threadId: data.threadId });
        }

        await sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        });

        return { success: true };
    } catch (error) {
        if (abortController.signal.aborted) {
            // Aborts are normal user actions, not errors
            if (getCurrentEnvironment() === EnvironmentType.DEVELOPMENT) {
                log.debug('Workflow aborted', { threadId: data.threadId });
            }

            await sendMessage(controller, encoder, {
                type: 'done',
                status: 'aborted',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            // Actual errors during workflow execution are important
            log.error(
                {
                    error,
                    userId,
                    threadId: data.threadId,
                    mode: data.mode,
                },
                'Workflow execution error'
            );

            await sendMessage(controller, encoder, {
                type: 'done',
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }

        throw error;
    }
}
