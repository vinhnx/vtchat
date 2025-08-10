import { z } from "zod";
/**
 * OpenAI Web Search Tool using the Responses API
 *
 * This tool provides web search capabilities using OpenAI's built-in web_search_preview tool
 * available through the Responses API. It requires OpenAI models that support the Responses API.
 *
 * @example
 * ```ts
 * import { openaiWebSearchTool } from '@repo/ai/tools/openai-web-search';
 *
 * const tools = {
 *   web_search: openaiWebSearchTool(),
 * };
 * ```
 */
export declare const openaiWebSearchTool: () => import("ai").Tool<z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>, any> & {
    execute: (args: {
        query: string;
    }, options: import("ai").ToolExecutionOptions) => PromiseLike<any>;
};
/**
 * Checks if a model supports OpenAI's Responses API web search
 * Currently available for GPT-4o Mini and other supported models
 */
export declare const supportsOpenAIWebSearch: (modelId: string) => boolean;
/**
 * Advanced web search with custom model selection for Responses API
 */
export declare const openaiWebSearchWithModel: (modelId?: string) => import("ai").Tool<z.ZodObject<{
    query: z.ZodString;
    maxResults: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    maxResults?: number | undefined;
}, {
    query: string;
    maxResults?: number | undefined;
}>, any> & {
    execute: (args: {
        query: string;
        maxResults?: number | undefined;
    }, options: import("ai").ToolExecutionOptions) => PromiseLike<any>;
};
//# sourceMappingURL=openai-web-search.d.ts.map