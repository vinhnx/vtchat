/**
 * Enhanced Tool Registry for VT Chat
 * Integrates AI SDK tool streaming patterns with existing VT Chat tools
 */

import type { ToolCall, ToolResult } from '@repo/shared/types';
import { ModelEnum } from '../models';
import { openaiWebSearchTool, supportsOpenAIWebSearch } from './openai-web-search';
import { StreamingToolExecutor } from './streaming-utils';

// Type aliases for plan-based tool access
export type UserTier = 'VT_BASE' | 'VT_PLUS';
export const USER_TIER: Record<string, UserTier> = {
    VT_BASE: 'VT_BASE' as UserTier,
    VT_PLUS: 'VT_PLUS' as UserTier,
} as const;

export interface ToolDefinition {
    name: string;
    description: string;
    category: 'web-search' | 'math' | 'chart' | 'document' | 'reasoning' | 'other';
    supportedModels?: ModelEnum[];
    supportsStreaming: boolean;
    autoExecute: boolean; // Whether to auto-execute on server or require user interaction
    requiredTier?: UserTier; // User tier required to access this tool
    tool: any; // The actual tool implementation
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
export class ToolRegistry {
    private tools: Map<string, ToolDefinition> = new Map();
    private streamingExecutor?: StreamingToolExecutor;

    constructor() {
        this.registerDefaultTools();
    }

    /**
     * Get models that support web search based on environment
     */
    private getWebSearchSupportedModels(): ModelEnum[] {
        // Models that support web search functionality
        const webSearchCapableModels = [
            // OpenAI models with web search
            ModelEnum.GPT_4o_Mini,
            ModelEnum.GPT_4o,
            ModelEnum.GPT_4_1_Mini,
            ModelEnum.GPT_4_1,
            ModelEnum.O3,
            ModelEnum.O3_Mini,
            ModelEnum.O4_Mini,

            // Gemini models with grounding/web search
            ModelEnum.GEMINI_3_PRO,
            ModelEnum.GEMINI_3_FLASH,
            ModelEnum.GEMINI_3_FLASH_LITE,
        ];

        // In production, filter by available API keys or environment config
        // For now, return all web search capable models
        return webSearchCapableModels.filter((_model) => {
            // Check if model is available in current environment
            // This could be expanded to check for API keys, feature flags, etc.
            return true; // For now, include all web search capable models
        });
    }

    /**
     * Register default VT Chat tools
     */
    private registerDefaultTools(): void {
        // Web Search Tool - VT+ ONLY feature for supported models
        const webSearchSupportedModels = this.getWebSearchSupportedModels();

        if (webSearchSupportedModels.length > 0) {
            this.register({
                name: 'web_search',
                description:
                    'Search the web using built-in web search capabilities (VT+ subscription required)',
                category: 'web-search',
                supportedModels: webSearchSupportedModels,
                supportsStreaming: true,
                autoExecute: true,
                requiredTier: USER_TIER.VT_PLUS,
                tool: openaiWebSearchTool, // This will need to be generalized for multi-provider support
            });
        }

        // Math Calculator Tool (existing)
        this.register({
            name: 'math_calculator',
            description: 'Perform mathematical calculations',
            category: 'math',
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing math tool
        });

        // Chart Visualization Tool (existing)
        this.register({
            name: 'chart_visualization',
            description: 'Create interactive charts and graphs',
            category: 'chart',
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing chart tool
        });

        // Document Processing Tool (existing)
        this.register({
            name: 'document_processing',
            description: 'Process and analyze documents',
            category: 'document',
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing document tool
        });
    }

    /**
     * Register a new tool
     */
    register(definition: ToolDefinition): void {
        this.tools.set(definition.name, definition);
    }

    /**
     * Get available tools for a given context
     */
    getAvailableTools(context: ToolExecutionContext): Record<string, any> {
        const availableTools: Record<string, any> = {};

        for (const [name, definition] of Array.from(this.tools.entries())) {
            // Check model compatibility
            if (definition.supportedModels?.length) {
                if (!definition.supportedModels.includes(context.model)) {
                    continue;
                }
            }

            // User tier restriction: Check if user has required tier for this tool
            if (definition.requiredTier && context.userTier !== definition.requiredTier) {
                continue;
            }

            // Special handling for web search functionality
            if (name === 'web_search') {
                if (!supportsOpenAIWebSearch(context.model)) {
                    continue;
                }
            }

            // Add the tool if it passes all checks
            if (definition.tool) {
                availableTools[name] = definition.tool();
            }
        }

        return availableTools;
    }

    /**
     * Get tools that support streaming
     */
    getStreamingTools(context: ToolExecutionContext): Record<string, any> {
        const streamingTools: Record<string, any> = {};

        for (const [name, definition] of Array.from(this.tools.entries())) {
            if (definition.supportsStreaming) {
                const tools = this.getAvailableTools(context);
                if (tools[name]) {
                    streamingTools[name] = tools[name];
                }
            }
        }

        return streamingTools;
    }

    /**
     * Get tools that require user interaction
     */
    getUserInteractionTools(): ToolDefinition[] {
        return Array.from(this.tools.values()).filter((tool) => !tool.autoExecute);
    }

    /**
     * Get tool definition by name
     */
    getToolDefinition(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
    }

    /**
     * Check if a tool supports a specific model
     */
    isToolSupportedForModel(toolName: string, model: ModelEnum): boolean {
        const definition = this.tools.get(toolName);
        if (!definition) return false;

        if (!definition.supportedModels?.length) return true;
        return definition.supportedModels.includes(model);
    }

    /**
     * Set up streaming executor for tool execution callbacks
     */
    setupStreaming(context: ToolExecutionContext): void {
        this.streamingExecutor = new StreamingToolExecutor({
            onToolCallUpdate: context.onToolCallUpdate,
            onToolResult: context.onToolResult,
        });
    }

    /**
     * Execute a tool with streaming support
     */
    async executeToolWithStreaming(
        toolCall: ToolCall,
        executor: (args: any) => Promise<any>,
    ): Promise<ToolResult | null> {
        if (!this.streamingExecutor) {
            throw new Error('Streaming executor not set up. Call setupStreaming() first.');
        }

        return await this.streamingExecutor.executeToolWithStreaming(toolCall, executor);
    }

    /**
     * Handle partial tool call from streaming
     */
    handlePartialToolCall(toolCallId: string, toolName: string, partialArgs: any): void {
        this.streamingExecutor?.handlePartialToolCall(toolCallId, toolName, partialArgs);
    }

    /**
     * Handle complete tool call
     */
    handleCompleteToolCall(toolCallId: string, toolName: string, args: any): ToolCall | null {
        if (!this.streamingExecutor) return null;
        return this.streamingExecutor.handleCompleteToolCall(toolCallId, toolName, args);
    }
}

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();

/**
 * Helper function to get tools for AI SDK streamText calls
 * Note: Web search functionality requires VT+ subscription (userTier: USER_TIER.VT_PLUS)
 */
export function getToolsForModel(
    model: ModelEnum,
    options: {
        userTier?: UserTier;
        byokKeys?: Record<string, string>;
        enableWebSearch?: boolean;
        enableMath?: boolean;
        enableCharts?: boolean;
        onToolCallUpdate?: (toolCall: ToolCall) => void;
        onToolResult?: (toolResult: ToolResult) => void;
    } = {},
): Record<string, any> {
    const context: ToolExecutionContext = {
        model,
        userTier: options.userTier,
        byokKeys: options.byokKeys,
        onToolCallUpdate: options.onToolCallUpdate,
        onToolResult: options.onToolResult,
    };

    // Set up streaming if callbacks are provided
    if (options.onToolCallUpdate || options.onToolResult) {
        toolRegistry.setupStreaming(context);
    }

    const tools = toolRegistry.getAvailableTools(context);
    const filteredTools: Record<string, any> = {};

    // Apply feature flags with VT+ restrictions
    if (options.enableWebSearch && tools.web_search && options.userTier === USER_TIER.VT_PLUS) {
        filteredTools.web_search = tools.web_search;
    }

    if (options.enableMath && tools.math_calculator) {
        filteredTools.math_calculator = tools.math_calculator;
    }

    if (options.enableCharts && tools.chart_visualization) {
        filteredTools.chart_visualization = tools.chart_visualization;
    }

    return filteredTools;
}
