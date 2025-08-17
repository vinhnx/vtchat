import { openai } from '@ai-sdk/openai';
import { log } from '@repo/shared/lib/logger';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// Cache for web search results to prevent multiple identical requests
const webSearchCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-flight request tracking to prevent multiple concurrent requests for the same query
const inFlightRequests = new Map<string, Promise<any>>();

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
            'Search the web for current information and return relevant results with sources',
        parameters: z.object({
            query: z.string().describe('The search query to find information about'),
        }),
        execute: async ({ query }) => {
            try {
                // Check cache first to prevent duplicate requests
                const cacheKey = `openai-web-search:${query}`;
                const cachedResult = webSearchCache.get(cacheKey);

                if (cachedResult) {
                    const { timestamp, result } = cachedResult;
                    if (Date.now() - timestamp < CACHE_TTL) {
                        log.info({ query }, 'Returning cached OpenAI web search result');
                        return result;
                    } else {
                        // Expired cache, remove it
                        webSearchCache.delete(cacheKey);
                    }
                }

                // Check if there's already an in-flight request for this query
                if (inFlightRequests.has(cacheKey)) {
                    log.info({ query }, 'Returning existing in-flight OpenAI web search request');
                    return await inFlightRequests.get(cacheKey);
                }

                // Create a new request promise
                const requestPromise = (async () => {
                    try {
                        const { text, sources } = await generateText({
                            model: openai.responses('gpt-4o-mini'),
                            prompt: query,
                            tools: {
                                web_search_preview: openai.tools.webSearchPreview(),
                            },
                            temperature: 0, // Use temperature 0 for deterministic tool calling
                        });

                        // Add detailed logging for debugging source issues
                        log.info(
                            {
                                query,
                                sourcesReceived: sources?.length || 0,
                                sourcesData: sources?.map((source: any) => ({
                                    title: source?.title,
                                    url: source?.url,
                                    snippet: source?.snippet?.substring(0, 100) + '...',
                                })) || [],
                            },
                            'OpenAI web search sources received',
                        );

                        // Validate and clean sources
                        const validSources = (sources || []).filter((source: any) => {
                            const hasValidUrl = source?.url
                                && typeof source.url === 'string'
                                && source.url.trim().length > 0;
                            if (!hasValidUrl) {
                                log.warn(
                                    {
                                        source: source,
                                        hasUrl: !!source?.url,
                                        urlType: typeof source?.url,
                                        urlLength: source?.url?.length || 0,
                                    },
                                    'Invalid source detected - missing or invalid URL',
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
                            'Source validation results',
                        );

                        const result = {
                            success: true,
                            text,
                            sources: validSources,
                            query,
                        };

                        // Cache the result
                        webSearchCache.set(cacheKey, {
                            timestamp: Date.now(),
                            result,
                        });

                        return result;
                    } catch (error: any) {
                        log.error({ error }, 'Error in OpenAI web search');
                        throw error;
                    } finally {
                        // Remove the in-flight request when done
                        inFlightRequests.delete(cacheKey);
                    }
                })();

                // Store the in-flight request
                inFlightRequests.set(cacheKey, requestPromise);

                // Wait for the request to complete and return the result
                const result = await requestPromise;
                return result;
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message || 'Failed to perform web search',
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
    const supportedModels = ['gpt-4o-mini', 'gpt-4o'];

    return supportedModels.includes(modelId);
};

/**
 * Advanced web search with custom model selection for Responses API
 */
export const openaiWebSearchWithModel = (modelId = 'gpt-4o-mini') =>
    tool({
        description:
            `Search the web using OpenAI's ${modelId} model with built-in web search capabilities`,
        parameters: z.object({
            query: z.string().describe('The search query to find information about'),
            maxResults: z
                .number()
                .nullable()
                .describe('Maximum number of results to return (if supported)'),
        }),
        execute: async ({ query, maxResults }) => {
            try {
                // Check cache first to prevent duplicate requests
                const cacheKey = `openai-web-search-${modelId}:${query}:${maxResults}`;
                const cachedResult = webSearchCache.get(cacheKey);

                if (cachedResult) {
                    const { timestamp, result } = cachedResult;
                    if (Date.now() - timestamp < CACHE_TTL) {
                        log.info(
                            { query, modelId },
                            'Returning cached OpenAI web search result with model',
                        );
                        return result;
                    } else {
                        // Expired cache, remove it
                        webSearchCache.delete(cacheKey);
                    }
                }

                // Check if there's already an in-flight request for this query
                if (inFlightRequests.has(cacheKey)) {
                    log.info(
                        { query, modelId },
                        'Returning existing in-flight OpenAI web search request with model',
                    );
                    return await inFlightRequests.get(cacheKey);
                }

                if (!supportsOpenAIWebSearch(modelId)) {
                    throw new Error(
                        `Model ${modelId} does not support OpenAI Responses API web search`,
                    );
                }

                // Create a new request promise
                const requestPromise = (async () => {
                    try {
                        const { text, sources } = await generateText({
                            model: openai.responses(modelId),
                            prompt: query,
                            tools: {
                                web_search_preview: openai.tools.webSearchPreview(),
                            },
                            maxSteps: 5, // Allow multiple search steps if needed
                            temperature: 0, // Use temperature 0 for deterministic tool calling
                        });

                        const result = {
                            success: true,
                            text,
                            sources: sources || [],
                            query,
                            modelUsed: modelId,
                            maxResults,
                        };

                        // Cache the result
                        webSearchCache.set(cacheKey, {
                            timestamp: Date.now(),
                            result,
                        });

                        return result;
                    } catch (error: any) {
                        log.error(
                            { modelId, error },
                            `Error in OpenAI web search with model ${modelId}`,
                        );
                        throw error;
                    } finally {
                        // Remove the in-flight request when done
                        inFlightRequests.delete(cacheKey);
                    }
                })();

                // Store the in-flight request
                inFlightRequests.set(cacheKey, requestPromise);

                // Wait for the request to complete and return the result
                const result = await requestPromise;
                return result;
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message || 'Failed to perform web search',
                    query,
                    modelUsed: modelId,
                };
            }
        },
    });
