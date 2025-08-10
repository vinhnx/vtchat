/**
 * Enhanced Tool Registry for VT Chat
 * Integrates AI SDK tool streaming patterns with existing VT Chat tools
 */
import type { ToolCall, ToolResult } from "@repo/shared/types";
import { ModelEnum } from "../models";
export type UserTier = "VT_BASE" | "VT_PLUS";
export declare const USER_TIER: Record<string, UserTier>;
export interface ToolDefinition {
    name: string;
    description: string;
    category: "web-search" | "math" | "chart" | "document" | "reasoning" | "other";
    supportedModels?: ModelEnum[];
    supportsStreaming: boolean;
    autoExecute: boolean;
    requiredTier?: UserTier;
    tool: any;
}
export interface ToolExecutionContext {
    model: ModelEnum;
    userTier?: UserTier;
    byokKeys?: Record<string, string>;
    onToolCallUpdate?: (toolCall: ToolCall) => void;
    onToolResult?: (toolResult: ToolResult) => void;
}
/**
 * Enhanced tool registry that supports AI SDK patterns
 */
export declare class ToolRegistry {
    private tools;
    private streamingExecutor?;
    constructor();
    /**
     * Get models that support web search based on environment
     */
    private getWebSearchSupportedModels;
    /**
     * Register default VT Chat tools
     */
    private registerDefaultTools;
    /**
     * Register a new tool
     */
    register(definition: ToolDefinition): void;
    /**
     * Get available tools for a given context
     */
    getAvailableTools(context: ToolExecutionContext): Record<string, any>;
    /**
     * Get tools that support streaming
     */
    getStreamingTools(context: ToolExecutionContext): Record<string, any>;
    /**
     * Get tools that require user interaction
     */
    getUserInteractionTools(): ToolDefinition[];
    /**
     * Get tool definition by name
     */
    getToolDefinition(name: string): ToolDefinition | undefined;
    /**
     * Check if a tool supports a specific model
     */
    isToolSupportedForModel(toolName: string, model: ModelEnum): boolean;
    /**
     * Set up streaming executor for tool execution callbacks
     */
    setupStreaming(context: ToolExecutionContext): void;
    /**
     * Execute a tool with streaming support
     */
    executeToolWithStreaming(toolCall: ToolCall, executor: (args: any) => Promise<any>): Promise<ToolResult | null>;
    /**
     * Handle partial tool call from streaming
     */
    handlePartialToolCall(toolCallId: string, toolName: string, partialArgs: any): void;
    /**
     * Handle complete tool call
     */
    handleCompleteToolCall(toolCallId: string, toolName: string, args: any): ToolCall | null;
}
/**
 * Global tool registry instance
 */
export declare const toolRegistry: ToolRegistry;
/**
 * Helper function to get tools for AI SDK streamText calls
 * Note: Web search functionality requires VT+ subscription (userTier: USER_TIER.VT_PLUS)
 */
export declare function getToolsForModel(model: ModelEnum, options?: {
    userTier?: UserTier;
    byokKeys?: Record<string, string>;
    enableWebSearch?: boolean;
    enableMath?: boolean;
    enableCharts?: boolean;
    onToolCallUpdate?: (toolCall: ToolCall) => void;
    onToolResult?: (toolResult: ToolResult) => void;
}): Record<string, any>;
//# sourceMappingURL=registry.d.ts.map