import { REASONING_BUDGETS } from '@repo/ai/constants/reasoning';
import { StreamingErrorHandler } from '@repo/ai/tools/streaming-error-utils';
import { runWorkflow } from '@repo/ai/workflow';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import { EnvironmentType, getCurrentEnvironment } from '@repo/shared/types/environment';
import type { Geo } from '@vercel/functions';
import type { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

// Track closed controllers to prevent infinite loops
const closedControllers = new WeakSet<StreamController>();

/**
 * Mark a controller as closed to prevent further message sending
 */
export function markControllerClosed(controller: StreamController) {
    closedControllers.add(controller);
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
    },
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

export function sendMessage(
    controller: StreamController,
    encoder: TextEncoder,
    payload: Record<string, any>,
) {
    // Check if controller is already marked as closed
    if (closedControllers.has(controller)) {
        return; // Exit silently for closed controllers
    }

    try {
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;

        // Check if controller is still open before enqueueing
        try {
            controller.enqueue(encoder.encode(message));
            controller.enqueue(new Uint8Array(0));
        } catch (controllerError) {
            // Controller is closed, client likely disconnected
            if ((controllerError as any)?.code === 'ERR_INVALID_STATE') {
                // Mark controller as closed to prevent future attempts
                closedControllers.add(controller);
                log.warn(
                    {
                        payloadType: payload.type,
                        threadId: payload.threadId,
                    },
                    'Controller closed, client likely disconnected',
                );
                return; // Exit silently when controller is closed
            }
            throw controllerError; // Re-throw other errors
        }
    } catch (error) {
        // This is critical - we should log errors in message serialization
        log.error(
            {
                error,
                payloadType: payload.type,
                threadId: payload.threadId,
            },
            'Error serializing message payload',
        );

        // Don't try to send error message if controller is closed
        if (closedControllers.has(controller)) {
            return;
        }

        try {
            const errorMessage = `event: done\ndata: ${
                JSON.stringify({
                    type: 'done',
                    status: 'error',
                    error:
                        'Stream data serialization failed. Please refresh the page and try again.',
                    threadId: payload.threadId,
                    threadItemId: payload.threadItemId,
                    parentThreadItemId: payload.parentThreadItemId,
                })
            }\n\n`;
            controller.enqueue(encoder.encode(errorMessage));
        } catch (enqueueError) {
            // If we can't enqueue the error message, mark controller as closed
            if ((enqueueError as any)?.code === 'ERR_INVALID_STATE') {
                closedControllers.add(controller);
            }
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
}): Promise<{ success: boolean; } | Response> {
    try {
        const { signal } = abortController;

        // Sanitize custom instructions: treat empty/whitespace as undefined
        const sanitizedCustomInstructions =
            typeof data.customInstructions === 'string' && data.customInstructions.trim().length > 0
                ? data.customInstructions
                : undefined;

        const workflow = runWorkflow({
            mode: data.mode,
            question: data.prompt,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            messages: data.messages,
            customInstructions: sanitizedCustomInstructions,
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

        let answerEventReceived = false;
        let answerEventPayload: any = null;

        workflow.onAll((event, payload) => {
            // Debug logging for key events
            if (event === 'answer') {
                answerEventReceived = true;
                answerEventPayload = payload;
                log.info('🎯 Answer event received:', {
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    hasFinalText: !!payload.finalText,
                    finalTextLength: payload.finalText?.length || 0,
                    status: payload.status,
                    textPreview: payload.finalText?.substring(0, 100) + '...',
                });
            } else if (event === 'suggestions') {
                log.info('💡 Suggestions event received:', {
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    suggestionsCount: payload?.length || 0,
                });
            } else if (event === 'status' && payload === 'COMPLETED') {
                log.info('🏁 Workflow status COMPLETED:', {
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    answerReceived: answerEventReceived,
                    answerHasContent: answerEventPayload?.finalText?.length > 0,
                });

                // Warn if workflow completed without sending answer
                if (!answerEventReceived) {
                    log.error('❌ CRITICAL: Workflow completed without sending answer event!', {
                        threadId: data.threadId,
                        threadItemId: data.threadItemId,
                        webSearch: data.webSearch,
                    });
                }
            }

            // Handle error events specifically
            if (event === 'error') {
                sendMessage(controller, encoder, {
                    type: 'error',
                    error: payload.error || 'Unknown error occurred',
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    parentThreadItemId: data.parentThreadItemId,
                });
                return;
            }

            // Handle tool-error events specifically
            if (event === 'tool-error') {
                sendMessage(controller, encoder, {
                    type: 'tool-error',
                    error: payload.error || 'Tool execution failed',
                    toolName: payload.toolName || 'Unknown tool',
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    parentThreadItemId: data.parentThreadItemId,
                });
                return;
            }

            // Handle abort events specifically
            if (event === 'abort') {
                sendMessage(controller, encoder, {
                    type: 'abort',
                    threadId: data.threadId,
                    threadItemId: data.threadItemId,
                    parentThreadItemId: data.parentThreadItemId,
                    steps: payload.steps || [],
                });
                return;
            }

            // Debug: Log all events being sent
            log.debug('📤 Sending event to client:', {
                type: event,
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                eventKeys: Object.keys(payload || {}),
                hasAnswer: event === 'answer',
                answerStatus: payload?.status,
                finalTextLength: payload?.finalText?.length || 0,
            });

            sendMessage(controller, encoder, {
                type: event,
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                query: data.prompt,
                mode: data.mode,
                webSearch: data.webSearch,
                showSuggestions: data.showSuggestions,
                [event]: payload,
            });
        });

        if (getCurrentEnvironment() === EnvironmentType.DEVELOPMENT) {
            log.debug('Starting workflow', { threadId: data.threadId });
        }

        await workflow.start('router', {
            question: data.prompt,
        });

        log.info('🎉 Workflow execution finished:', {
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            webSearch: data.webSearch,
        });

        if (getCurrentEnvironment() === EnvironmentType.DEVELOPMENT) {
            log.debug('Workflow completed', { threadId: data.threadId });
        }

        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        });

        return { success: true };
    } catch (error) {
        if (abortController.signal.aborted) {
            // Handle stream abort with enhanced error handling
            await StreamingErrorHandler.handleStreamAbort(controller, encoder, {
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            // Use comprehensive error handling for workflow execution errors
            const { handleStreamError } = await import('./stream-error-handler');
            await handleStreamError({
                error,
                controller,
                encoder,
                data,
                userId,
                abortController: { signal: { aborted: false } } as AbortController, // Not aborted if we're here
            });
        }

        throw error;
    }
}
