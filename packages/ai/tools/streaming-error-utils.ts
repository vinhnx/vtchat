import { sendMessage } from '@/app/api/completion/stream-handlers';
import { StreamController } from '@/app/api/completion/types';
import { log } from '@repo/shared/logger';

/**
 * Enhanced streaming error handler that follows the AI SDK error handling patterns
 * Handles regular errors, streaming errors, and stream aborts
 */
export class StreamingErrorHandler {
    /**
     * Handle regular errors in streaming context
     */
    static async handleRegularError(
        controller: StreamController,
        encoder: TextEncoder,
        error: unknown,
        context: {
            threadId: string;
            threadItemId: string;
            parentThreadItemId?: string;
        },
    ) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error({ error, context }, 'Streaming error occurred');

        // Send error event to client
        sendMessage(controller, encoder, {
            type: 'error',
            error: errorMessage,
            threadId: context.threadId,
            threadItemId: context.threadItemId,
            parentThreadItemId: context.parentThreadItemId,
        });

        // Send done event to properly close the stream
        sendMessage(controller, encoder, {
            type: 'done',
            status: 'error',
            error: errorMessage,
            threadId: context.threadId,
            threadItemId: context.threadItemId,
            parentThreadItemId: context.parentThreadItemId,
        });
    }

    /**
     * Handle tool execution errors
     */
    static async handleToolError(
        controller: StreamController,
        encoder: TextEncoder,
        error: unknown,
        context: {
            threadId: string;
            threadItemId: string;
            parentThreadItemId?: string;
            toolName: string;
        },
    ) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error({ error, context }, 'Tool execution error');

        // Send tool-error event to client
        sendMessage(controller, encoder, {
            type: 'tool-error',
            error: errorMessage,
            toolName: context.toolName,
            threadId: context.threadId,
            threadItemId: context.threadItemId,
            parentThreadItemId: context.parentThreadItemId,
        });
    }

    /**
     * Handle stream abort with onAbort callback pattern
     */
    static async handleStreamAbort(
        controller: StreamController,
        encoder: TextEncoder,
        context: {
            threadId: string;
            threadItemId: string;
            parentThreadItemId?: string;
            steps?: any[];
        },
    ) {
        log.info({ context }, 'Stream aborted by user');

        // Send abort event to client
        sendMessage(controller, encoder, {
            type: 'abort',
            threadId: context.threadId,
            threadItemId: context.threadItemId,
            parentThreadItemId: context.parentThreadItemId,
            steps: context.steps || [],
        });

        // Send done event to properly close the stream
        sendMessage(controller, encoder, {
            type: 'done',
            status: 'aborted',
            threadId: context.threadId,
            threadItemId: context.threadItemId,
            parentThreadItemId: context.parentThreadItemId,
        });
    }
}
