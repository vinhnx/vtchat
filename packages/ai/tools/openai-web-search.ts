import { openai } from "@ai-sdk/openai";
import { log } from "@repo/shared/lib/logger";
import { generateText, tool } from "ai";
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
export const openaiWebSearchTool = () =>
    tool({
        description:
            "Search the web for current information and return relevant results with sources",
        parameters: z.object({
            query: z.string().describe("The search query to find information about"),
        }),
        execute: async ({ query }) => {
            try {
                const { text, sources } = await generateText({
                    model: openai.responses("gpt-4o-mini"),
                    prompt: query,
                    tools: {
                        web_search_preview: openai.tools.webSearchPreview(),
                    },
                });

                // Add detailed logging for debugging source issues
                log.info(
                    {
                        query,
                        sourcesReceived: sources?.length || 0,
                        sourcesData:
                            sources?.map((source: any) => ({
                                title: source?.title,
                                url: source?.url,
                                snippet: source?.snippet?.substring(0, 100) + "...",
                            })) || [],
                    },
                    "OpenAI web search sources received",
                );

                // Validate and clean sources
                const validSources = (sources || []).filter((source: any) => {
                    const hasValidUrl =
                        source?.url &&
                        typeof source.url === "string" &&
                        source.url.trim().length > 0;
                    if (!hasValidUrl) {
                        log.warn(
                            {
                                source: source,
                                hasUrl: !!source?.url,
                                urlType: typeof source?.url,
                                urlLength: source?.url?.length || 0,
                            },
                            "Invalid source detected - missing or invalid URL",
                        );
                    }
                    return hasValidUrl;
                });

                log.info(
                    {
                        originalCount: sources?.length || 0,
                        validCount: validSources.length,
                        filteredOut: (sources?.length || 0) - validSources.length,
                    },
                    "Source validation results",
                );

                return {
                    success: true,
                    text,
                    sources: validSources,
                    query,
                };
            } catch (error: any) {
                log.error({ error }, "Error in OpenAI web search");
                return {
                    success: false,
                    error: error.message || "Failed to perform web search",
                    query,
                };
            }
        },
    });

/**
 * Checks if a model supports OpenAI's Responses API web search
 * Currently available for GPT-4o Mini and other supported models
 */
export const supportsOpenAIWebSearch = (modelId: string): boolean => {
    const supportedModels = [
        "gpt-4o-mini",
        "gpt-4o",
        // Add other models as they become available for Responses API
    ];

    return supportedModels.includes(modelId);
};

/**
 * Advanced web search with custom model selection for Responses API
 */
export const openaiWebSearchWithModel = (modelId = "gpt-4o-mini") =>
    tool({
        description: `Search the web using OpenAI's ${modelId} model with built-in web search capabilities`,
        parameters: z.object({
            query: z.string().describe("The search query to find information about"),
            maxResults: z
                .number()
                .optional()
                .describe("Maximum number of results to return (if supported)"),
        }),
        execute: async ({ query, maxResults }) => {
            try {
                if (!supportsOpenAIWebSearch(modelId)) {
                    throw new Error(
                        `Model ${modelId} does not support OpenAI Responses API web search`,
                    );
                }

                const { text, sources } = await generateText({
                    model: openai.responses(modelId),
                    prompt: query,
                    tools: {
                        web_search_preview: openai.tools.webSearchPreview(),
                    },
                    maxSteps: 5, // Allow multiple search steps if needed
                });

                return {
                    success: true,
                    text,
                    sources: sources || [],
                    query,
                    modelUsed: modelId,
                    maxResults,
                };
            } catch (error: any) {
                log.error({ modelId, error }, `Error in OpenAI web search with model ${modelId}`);
                return {
                    success: false,
                    error: error.message || "Failed to perform web search",
                    query,
                    modelUsed: modelId,
                };
            }
        },
    });
