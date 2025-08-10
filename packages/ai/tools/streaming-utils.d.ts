/**
 * Enhanced tool call utilities for AI SDK streaming integration
 * Based on AI SDK's tool call streaming patterns
 */
import type { ToolCall, ToolResult } from "@repo/shared/types";
export type ToolCallStreamingState = "partial-call" | "call" | "executing" | "result" | "error";
/**
 * Creates a partial tool call for streaming display
 */
export declare function createPartialToolCall(toolCallId: string, toolName: string, partialArgs?: any): ToolCall;
/**
 * Creates a full tool call
 */
export declare function createFullToolCall(toolCallId: string, toolName: string, args: any): ToolCall;
/**
 * Updates a tool call to executing state
 */
export declare function setToolCallExecuting(toolCall: ToolCall): ToolCall;
/**
 * Creates a tool result from a successful execution
 */
export declare function createToolResult(toolCall: ToolCall, result: any, executionTime?: number): ToolResult;
/**
 * Creates a tool error result
 */
export declare function createToolError(toolCall: ToolCall, error: any, executionTime?: number): ToolResult;
/**
 * Utility to check if a tool invocation is in a specific state
 */
export declare function isToolInState(toolCall: ToolCall | ToolResult, state: ToolCallStreamingState): boolean;
/**
 * Gets the display priority for tool states (for sorting)
 */
export declare function getToolStatePriority(state: ToolCallStreamingState): number;
/**
 * Enhanced tool call executor with streaming support
 */
export declare class StreamingToolExecutor {
    private onToolCallUpdate?;
    private onToolResult?;
    constructor(callbacks?: {
        onToolCallUpdate?: (toolCall: ToolCall) => void;
        onToolResult?: (toolResult: ToolResult) => void;
    });
    /**
     * Execute a tool with streaming updates
     */
    executeToolWithStreaming(toolCall: ToolCall, executor: (args: any) => Promise<any>): Promise<ToolResult>;
    /**
     * Handle partial tool call streaming (for OpenAI streaming)
     */
    handlePartialToolCall(toolCallId: string, toolName: string, partialArgs: any): void;
    /**
     * Handle complete tool call
     */
    handleCompleteToolCall(toolCallId: string, toolName: string, args: any): ToolCall;
}
//# sourceMappingURL=streaming-utils.d.ts.map