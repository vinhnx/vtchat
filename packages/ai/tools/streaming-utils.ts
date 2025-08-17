/**
 * Enhanced tool call utilities for AI SDK streaming integration
 * Based on AI SDK's tool call streaming patterns
 */

import type { ToolCall, ToolResult } from '@repo/shared/types';

export type ToolCallStreamingState = 'partial-call' | 'call' | 'executing' | 'result' | 'error';

/**
 * Creates a partial tool call for streaming display
 */
export function createPartialToolCall(
    toolCallId: string,
    toolName: string,
    partialArgs: any = {},
): ToolCall {
    return {
        type: 'tool-call',
        toolCallId,
        toolName,
        args: partialArgs,
        state: 'partial-call',
        timestamp: Date.now(),
    };
}

/**
 * Creates a full tool call
 */
export function createFullToolCall(toolCallId: string, toolName: string, args: any): ToolCall {
    return {
        type: 'tool-call',
        toolCallId,
        toolName,
        args,
        state: 'call',
        timestamp: Date.now(),
    };
}

/**
 * Updates a tool call to executing state
 */
export function setToolCallExecuting(toolCall: ToolCall): ToolCall {
    return {
        ...toolCall,
        state: 'executing',
        timestamp: Date.now(),
    };
}

/**
 * Creates a tool result from a successful execution
 */
export function createToolResult(
    toolCall: ToolCall,
    result: any,
    executionTime?: number,
): ToolResult {
    return {
        type: 'tool-result',
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        args: toolCall.args,
        result,
        state: 'result',
        executionTime,
        timestamp: Date.now(),
    };
}

/**
 * Creates a tool error result
 */
export function createToolError(
    toolCall: ToolCall,
    error: any,
    executionTime?: number,
): ToolResult {
    return {
        type: 'tool-result',
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        args: toolCall.args,
        result: error,
        state: 'error',
        executionTime,
        timestamp: Date.now(),
    };
}

/**
 * Utility to check if a tool invocation is in a specific state
 */
export function isToolInState(
    toolCall: ToolCall | ToolResult,
    state: ToolCallStreamingState,
): boolean {
    if (toolCall.type === 'tool-call') {
        return toolCall.state === state;
    } else {
        return toolCall.state === state;
    }
}

/**
 * Gets the display priority for tool states (for sorting)
 */
export function getToolStatePriority(state: ToolCallStreamingState): number {
    const priorities = {
        'partial-call': 1,
        call: 2,
        executing: 3,
        result: 4,
        error: 5,
    };
    return priorities[state] || 0;
}

/**
 * Enhanced tool call executor with streaming support
 */
export class StreamingToolExecutor {
    private onToolCallUpdate?: (toolCall: ToolCall) => void;
    private onToolResult?: (toolResult: ToolResult) => void;

    constructor(
        callbacks: {
            onToolCallUpdate?: (toolCall: ToolCall) => void;
            onToolResult?: (toolResult: ToolResult) => void;
        } = {},
    ) {
        this.onToolCallUpdate = callbacks.onToolCallUpdate;
        this.onToolResult = callbacks.onToolResult;
    }

    /**
     * Execute a tool with streaming updates
     */
    async executeToolWithStreaming(
        toolCall: ToolCall,
        executor: (args: any) => Promise<any>,
    ): Promise<ToolResult> {
        const startTime = Date.now();

        try {
            // Update to executing state
            const executingCall = setToolCallExecuting(toolCall);
            this.onToolCallUpdate?.(executingCall);

            // Execute the tool
            const result = await executor(toolCall.args);
            const executionTime = Date.now() - startTime;

            // Create and emit result
            const toolResult = createToolResult(toolCall, result, executionTime);
            this.onToolResult?.(toolResult);

            return toolResult;
        } catch (error) {
            const executionTime = Date.now() - startTime;
            const toolError = createToolError(toolCall, error, executionTime);
            this.onToolResult?.(toolError);

            // Also emit a tool-error event for enhanced error handling
            if (this.onToolCallUpdate) {
                const errorCall = {
                    ...toolCall,
                    state: 'error' as ToolCallStreamingState,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: Date.now(),
                };
                this.onToolCallUpdate(errorCall);
            }

            return toolError;
        }
    }

    /**
     * Handle partial tool call streaming (for OpenAI streaming)
     */
    handlePartialToolCall(toolCallId: string, toolName: string, partialArgs: any): void {
        const partialCall = createPartialToolCall(toolCallId, toolName, partialArgs);
        this.onToolCallUpdate?.(partialCall);
    }

    /**
     * Handle complete tool call
     */
    handleCompleteToolCall(toolCallId: string, toolName: string, args: any): ToolCall {
        const fullCall = createFullToolCall(toolCallId, toolName, args);
        this.onToolCallUpdate?.(fullCall);
        return fullCall;
    }
}
