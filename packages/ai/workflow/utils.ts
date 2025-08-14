import type { TaskParams, TypedEventEmitter } from '@repo/orchestrator';
import { UserTier, type UserTierType } from '@repo/shared/constants/user-tiers';
import { log } from '@repo/shared/logger';
import { formatDate } from '@repo/shared/utils';
import {
    ACCESS_CONTROL,
    getVTPlusFeatureFromChatMode,
    isEligibleForQuotaConsumption,
} from '@repo/shared/utils/access-control';
import {
    extractReasoningMiddleware,
    generateObject as generateObjectAi,
    type ModelMessage,
    streamText,
    type ToolSet,
} from 'ai';
import type { ZodSchema } from 'zod';
import { CLAUDE_4_CONFIG, ReasoningType } from '../constants/reasoning';
import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import {
    type ErrorContext,
    generateErrorMessage as centralizedGenerateErrorMessage,
} from '../services/error-messages';
import type {
    GenerateTextWithReasoningResult,
    ReasoningDetail,
    ThinkingModeConfig,
} from '../types/reasoning';
import type { WorkflowEventSchema } from './flow';
import { generateErrorMessage } from './tasks/utils';

export type ChunkBufferOptions = {
    threshold?: number;
    breakOn?: string[];
    onFlush: (chunk: string, fullText: string) => void;
};

export class ChunkBuffer {
    private buffer = '';
    private fullText = '';
    private threshold?: number;
    private breakPatterns: string[];
    private onFlush: (chunk: string, fullText: string) => void;

    constructor(options: ChunkBufferOptions) {
        this.threshold = options.threshold;
        this.breakPatterns = options.breakOn || ['\n\n', '.', '!', '?'];
        this.onFlush = options.onFlush;
    }

    add(chunk: string): void {
        this.fullText += chunk;
        this.buffer += chunk;

        const shouldFlush = (this.threshold && this.buffer.length >= this.threshold)
            || this.breakPatterns.some(
                (pattern) => chunk.includes(pattern) || chunk.endsWith(pattern),
            );

        if (shouldFlush) {
            this.flush();
        }
    }

    flush(): void {
        if (this.buffer.length > 0) {
            this.onFlush(this.buffer, this.fullText);
            this.buffer = '';
        }
    }

    end(): void {
        this.flush();
        this.fullText = '';
    }
}

export const generateTextWithGeminiSearch = async ({
    prompt,
    model,
    onChunk,
    messages,
    signal,
    byokKeys,
    thinkingMode,
    userTier,
    userId,
}: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: ModelMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
}): Promise<GenerateTextWithReasoningResult> => {
    // Add comprehensive runtime logging
    log.info('=== generateTextWithGeminiSearch START ===');
    log.info(
        {
            prompt: `${prompt?.slice(0, 100)}...`,
            model,
            hasOnChunk: !!onChunk,
            messagesLength: messages?.length,
            hasSignal: !!signal,
            byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        },
        'generateTextWithGeminiSearch parameters',
    ); // Declare variables outside try block so they're available in catch block
    let hasUserGeminiKey = false;
    let hasSystemGeminiKey = false;
    let isFreeGeminiModel = false;
    let isVtPlusUser = false;

    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        // Check if we have a valid API key for Google models
        let windowApiKey = false;
        try {
            windowApiKey = typeof window !== 'undefined' && !!(window as any).AI_API_KEYS?.google;
        } catch {
            // window is not available in this environment
            windowApiKey = false;
        }

        hasUserGeminiKey = !!(
            byokKeys?.GEMINI_API_KEY && byokKeys.GEMINI_API_KEY.trim().length > 0
        );
        hasSystemGeminiKey = !!(
            (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
            || windowApiKey
        );

        // For GEMINI_2_5_FLASH_LITE model, allow using system API key when user doesn't have BYOK
        isFreeGeminiModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
        isVtPlusUser = userTier === UserTier.PLUS;

        // Handle different scenarios for API key requirements
        if (!hasUserGeminiKey && !hasSystemGeminiKey) {
            log.warn(
                {
                    isFreeGeminiModel,
                    isVtPlusUser,
                    hasUserGeminiKey,
                    hasSystemGeminiKey,
                    environment: process.env.NODE_ENV,
                },
                'Web search failed: No API key available',
            );

            if (isFreeGeminiModel && !isVtPlusUser) {
                // Free tier user with free model - require BYOK for web search
                throw new Error(
                    'Web search requires an API key. Please add your own Gemini API key in settings for unlimited usage.',
                );
            }
            if (isVtPlusUser) {
                throw new Error(
                    'Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.',
                );
            }
            throw new Error('Gemini API key is required for web search functionality');
        }

        // If user has BYOK, use their key (unlimited usage)
        // If user doesn't have BYOK but system key is available:
        //   - For VT+ users: use system key (unlimited usage for VT+ users)
        //   - For free users with free model: use system key only if available (counted usage)
        const useSystemKey = !hasUserGeminiKey && hasSystemGeminiKey
            && (isFreeGeminiModel || isVtPlusUser);

        log.info('API key usage decision:', {
            hasUserKey: hasUserGeminiKey,
            hasSystemKey: hasSystemGeminiKey,
            isFreeModel: isFreeGeminiModel,
            isVtPlusUser,
            useSystemKey,
        });

        log.info('Getting language model for:', { data: model });

        // Use system key for free model users without BYOK
        const effectiveByokKeys = useSystemKey ? undefined : byokKeys;
        const selectedModel = getLanguageModel(
            model,
            undefined,
            effectiveByokKeys,
            true,
            undefined,
            thinkingMode?.claude4InterleavedThinking,
            isVtPlusUser,
        );
        log.info('Selected model result:', {
            selectedModel: selectedModel ? 'object' : selectedModel,
            modelType: typeof selectedModel,
            modelKeys: selectedModel ? Object.keys(selectedModel) : undefined,
        });

        if (!selectedModel) {
            throw new Error('Failed to initialize Gemini model');
        }

        // Additional validation for the model object
        if (typeof selectedModel !== 'object' || selectedModel === null) {
            log.error('Invalid model object:', { data: selectedModel });
            throw new Error('Invalid model configuration. Model must be a valid object.');
        }

        log.info('Preparing streamText call with:', {
            hasMessages: !!messages?.length,
            messagesCount: messages?.length,
            promptLength: prompt?.length,
        });

        // Filter out messages with empty content to prevent Gemini API errors
        let filteredMessages = messages;
        if (messages?.length) {
            filteredMessages = messages.filter((message) => {
                const hasContent = message.content
                    && (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                        ? message.content.length > 0
                        : true);

                if (!hasContent) {
                    log.warn('Filtering out message with empty content in GeminiSearch:', {
                        role: message.role,
                        contentType: typeof message.content,
                    });
                }

                return hasContent;
            });

            log.info('GeminiSearch message filtering:', {
                originalCount: messages.length,
                filteredCount: filteredMessages.length,
                removedCount: messages.length - filteredMessages.length,
            });
        }

        let streamResult;

        try {
            // Import reasoning utilities
            const { supportsReasoning, getReasoningType } = await import('../models');

            // Set up provider options based on model's reasoning type
            const providerOptions: any = {};
            const reasoningType = getReasoningType(model);

            if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
                switch (reasoningType) {
                    case ReasoningType.GEMINI_THINKING:
                        // Gemini models use thinkingConfig
                        providerOptions.google = {
                            thinkingConfig: {
                                includeThoughts: thinkingMode.includeThoughts ?? true,
                                maxOutputTokens: thinkingMode.budget,
                            },
                        };
                        break;

                    case ReasoningType.ANTHROPIC_REASONING:
                        // Anthropic Claude 4 models support reasoning with extended thinking
                        providerOptions.anthropic = {
                            thinking: {
                                type: 'enabled' as const,
                                budgetTokens: CLAUDE_4_CONFIG.DEFAULT_THINKING_BUDGET,
                            },
                        };
                        break;

                    case ReasoningType.DEEPSEEK_REASONING:
                        // DeepSeek reasoning models work through middleware extraction
                        // No special provider options needed as middleware handles <think> tags
                        break;
                }
            }

            const streamTextConfig = filteredMessages?.length
                ? {
                    model: selectedModel,
                    messages: [
                        {
                            role: 'system',
                            content: prompt,
                        },
                        ...filteredMessages,
                    ],
                    abortSignal: signal,
                    ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                }
                : {
                    prompt,
                    model: selectedModel,
                    abortSignal: signal,
                    ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                };

            log.info('StreamText config:', {
                configType: filteredMessages?.length ? 'with-messages' : 'prompt-only',
                hasSystem: !!(streamTextConfig as any).system,
                hasPrompt: !!(streamTextConfig as any).prompt,
                hasModel: !!streamTextConfig.model,
                hasAbortSignal: !!streamTextConfig.abortSignal,
                hasProviderOptions: Object.keys(providerOptions).length > 0,
            });

            // Use quota-enforced streamText for VT+ users with Pro Search
            const user = { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN };
            const isByokKey = !!(byokKeys && Object.keys(byokKeys).length > 0);

            if (userId && userTier === 'PLUS' && isEligibleForQuotaConsumption(user, isByokKey)) {
                const { streamTextWithQuota } = await import('@repo/common/lib/geminiWithQuota');
                const { isUsingByokKeys } = await import('@repo/common/lib/geminiWithQuota');
                const { VtPlusFeature } = await import('@repo/common/config/vtPlusLimits');

                streamResult = await streamTextWithQuota(streamTextConfig as any, {
                    user: { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN },
                    feature: VtPlusFeature.PRO_SEARCH,
                    amount: 1,
                    isByokKey: isUsingByokKeys(byokKeys),
                });
            } else {
                // Import streamText dynamically to ensure proper loading
                log.info('Importing streamText function...');
                const { streamText: streamTextFn } = await import('ai');
                log.info('StreamText imported successfully:', { hasFunction: typeof streamTextFn });

                // Validate model before passing to streamText
                if (!streamTextConfig.model) {
                    throw new Error('Model is required for streamText configuration');
                }

                log.info('Calling streamText with config:', {
                    hasModel: !!streamTextConfig.model,
                    modelType: typeof streamTextConfig.model,
                    configKeys: Object.keys(streamTextConfig),
                });

                streamResult = streamTextFn(streamTextConfig as any);
            }
            log.info('StreamText call successful, result type:', {
                data: typeof streamResult,
            });
        } catch (error: any) {
            log.error('Error creating streamText:', { data: error });
            log.error('Error stack:', { data: error.stack });

            // Enhanced error handling with provider-specific error extraction
            const { ProviderErrorExtractor } = await import('../services/provider-error-extractor');
            const errorResult = ProviderErrorExtractor.extractError(error, model?.provider as any);

            if (errorResult.success && errorResult.error) {
                const providerError = errorResult.error;
                log.error('Provider error extracted:', {
                    provider: providerError.provider,
                    errorCode: providerError.errorCode,
                    userMessage: providerError.userMessage,
                    isRetryable: providerError.isRetryable,
                });

                // Create a user-friendly error with provider details
                const enhancedError = new Error(providerError.userMessage);
                (enhancedError as any).provider = providerError.provider;
                (enhancedError as any).errorCode = providerError.errorCode;
                (enhancedError as any).isRetryable = providerError.isRetryable;
                (enhancedError as any).suggestedAction = providerError.suggestedAction;
                (enhancedError as any).originalError = providerError.originalError;

                throw enhancedError;
            }

            // Fallback for legacy error handling
            if (error.message?.includes('undefined to object')) {
                throw new Error(
                    'Google Generative AI configuration error. This may be due to missing API key or invalid model configuration.',
                );
            }
            throw error;
        }

        if (!streamResult) {
            log.error('StreamResult is null/undefined');
            throw new Error('Failed to initialize text stream');
        }

        log.info('StreamResult properties:', { data: Object.keys(streamResult) });

        // Don't destructure sources and providerMetadata immediately
        log.info('Accessing fullStream...');
        const { fullStream } = streamResult;
        log.info('FullStream extracted:', {
            hasFullStream: !!fullStream,
            fullStreamType: typeof fullStream,
        });

        if (!fullStream) {
            log.error('FullStream is null/undefined');
            throw new Error('Failed to get fullStream from streamText result');
        }

        let fullText = '';
        log.info('Starting to iterate over fullStream...');

        try {
            for await (const chunk of fullStream) {
                if (signal?.aborted) {
                    throw new Error('Operation aborted');
                }

                if (chunk.type === 'text') {
                    fullText += chunk.textDelta;
                    onChunk?.(chunk.textDelta, fullText);
                }
            }
        } catch (error: any) {
            log.error('Error iterating over fullStream:', { data: error });
            log.error('Error stack:', { data: error.stack });
            throw error;
        }

        log.info('Stream iteration completed, fullText length:', {
            data: fullText.length,
        });

        // Safely handle potentially undefined sources and metadata
        log.info('Resolving sources and metadata...');
        let resolvedSources: any[] = [];
        let groundingMetadata: any = null;

        try {
            log.info('Checking streamResult.sources:', {
                hasSources: !!streamResult?.sources,
                sourcesType: typeof streamResult?.sources,
            });
            if (streamResult?.sources) {
                resolvedSources = (await streamResult.sources) || [];
                log.info('Sources resolved:', { data: resolvedSources.length });
            }
        } catch (error) {
            log.warn('Failed to resolve sources:', { data: error });
            resolvedSources = [];
        }

        try {
            log.info('Checking streamResult.providerMetadata:', {
                hasProviderMetadata: !!streamResult?.providerOptions,
                providerMetadataType: typeof streamResult?.providerOptions,
            });
            if (streamResult?.providerOptions) {
                const metadata = await streamResult.providerOptions;
                log.info('ProviderMetadata resolved:', {
                    hasMetadata: !!metadata,
                    hasGoogle: !!metadata?.google,
                    hasGroundingMetadata: !!metadata?.google?.groundingMetadata,
                });
                groundingMetadata = metadata?.google?.groundingMetadata || null;
            }
        } catch (error) {
            log.warn('Failed to resolve provider metadata:', { data: error });
            groundingMetadata = null;
        }

        // Extract reasoning details if available
        let reasoning = '';
        let reasoningDetails: any[] = [];

        try {
            if (streamResult?.reasoningText) {
                reasoning = (await streamResult.reasoningText) || '';
                log.info('Reasoning extracted:', { data: reasoning.length });
            }
        } catch (error) {
            log.warn('Failed to resolve reasoning:', { data: error });
        }

        try {
            if (streamResult?.reasoning) {
                reasoningDetails = (await streamResult.reasoning) || [];
                log.info('ReasoningDetails extracted:', {
                    data: reasoningDetails.length,
                });
            }
        } catch (error) {
            log.warn('Failed to resolve reasoningDetails:', { data: error });
        }

        const result = {
            text: fullText,
            sources: resolvedSources,
            groundingMetadata,
            reasoningText,
            reasoning,
        };

        log.info('=== generateTextWithGeminiSearch END ===');
        log.info('Returning result:', {
            textLength: result.text.length,
            sourcesCount: result.sources.length,
            hasGroundingMetadata: !!result.groundingMetadata,
            hasReasoning: !!result.reasoningText,
            reasoningDetailsCount: result.reasoning.length,
        });

        return result;
    } catch (error: any) {
        log.error('Error in generateTextWithGeminiSearch:', { data: error });

        // Use centralized error message service for better user feedback
        const errorContext = {
            provider: 'google' as any,
            model: model.toString(),
            userId,
            hasApiKey: hasUserGeminiKey,
            isVtPlus: isVtPlusUser,
            originalError: error.message,
        };

        const errorMsg = centralizedGenerateErrorMessage(error, errorContext);

        // Preserve QuotaExceededError type for proper frontend handling
        if (error.name === 'QuotaExceededError') {
            const quotaError = new Error(errorMsg.message);
            quotaError.name = 'QuotaExceededError';
            quotaError.cause = error;
            throw quotaError;
        }

        throw new Error(errorMsg.message);
    }
};

// Cache for generated text to prevent multiple identical requests
const textGenerationCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-flight request tracking to prevent multiple concurrent requests
const inFlightRequests = new Map<string, Promise<any>>();

export const generateText = async ({
    prompt,
    model,
    onChunk,
    messages,
    onReasoning,
    onReasoningDetails,
    tools,
    onToolCall,
    onToolResult,
    signal,
    toolChoice = 'auto',
    maxSteps = 2,
    byokKeys,
    useSearchGrounding = false,
    thinkingMode,
    userTier,
    userId,
    mode,
}: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: ModelMessage[];
    onReasoning?: (chunk: string, fullText: string) => void;
    onReasoningDetails?: (details: ReasoningDetail[]) => void;
    tools?: ToolSet;
    onToolCall?: (toolCall: any) => void;
    onToolResult?: (toolResult: any) => void;
    signal?: AbortSignal;
    toolChoice?: 'auto' | 'none' | 'required';
    maxSteps?: number;
    byokKeys?: Record<string, string>;
    useSearchGrounding?: boolean;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
    mode?: string;
}) => {
    try {
        // Create a cache key from the parameters
        const cacheKey = `generateText:${model}:${prompt}:${JSON.stringify(messages || [])}:${
            JSON.stringify(tools || {})
        }:${toolChoice}:${maxSteps}`;

        // Check cache first
        const cachedResult = textGenerationCache.get(cacheKey);
        if (cachedResult) {
            const { timestamp, result } = cachedResult;
            if (Date.now() - timestamp < CACHE_TTL) {
                log.info(
                    { model, prompt: prompt.substring(0, 50) },
                    'Returning cached generateText result',
                );
                return result;
            } else {
                // Expired cache, remove it
                textGenerationCache.delete(cacheKey);
            }
        }

        // Check if there's already an in-flight request for this query
        if (inFlightRequests.has(cacheKey)) {
            log.info(
                { model, prompt: prompt.substring(0, 50) },
                'Returning existing in-flight generateText request',
            );
            return await inFlightRequests.get(cacheKey);
        }

        // Create a new request promise and store it to prevent concurrent requests
        const requestPromise = (async () => {
            try {
                log.info(
                    {
                        model: model.toString(),
                        hasAnthropicKey: !!byokKeys?.ANTHROPIC_API_KEY,
                        anthropicKeyLength: byokKeys?.ANTHROPIC_API_KEY?.length,
                        mode,
                        userTier,
                    },
                    'generateText called',
                );

                // Debug logging for generateText
                log.info(
                    {
                        model: model.toString(),
                        hasAnthropicKey: !!byokKeys?.ANTHROPIC_API_KEY,
                        anthropicKeyLength: byokKeys?.ANTHROPIC_API_KEY?.length,
                        mode,
                        userTier,
                    },
                    '🤖 generateText called',
                );

                if (signal?.aborted) {
                    throw new Error('Operation aborted');
                }

                // Filter out messages with empty content to prevent Gemini API errors
                let filteredMessages = messages;
                if (messages?.length) {
                    filteredMessages = messages.filter((message) => {
                        const hasContent = message.content
                            && (typeof message.content === 'string'
                                ? message.content.trim() !== ''
                                : Array.isArray(message.content)
                                ? message.content.length > 0
                                : true);
                        return hasContent;
                    });
                }

                // Import reasoning utilities
                const { supportsReasoning, getReasoningType, getReasoningTagName } = await import(
                    '../models'
                );

                // Set up middleware based on model's reasoning capabilities
                let middleware: any;
                const reasoningTagName = getReasoningTagName(model);

                if (reasoningTagName && supportsReasoning(model)) {
                    middleware = extractReasoningMiddleware({
                        tagName: reasoningTagName,
                        separator: '\n',
                    });
                }

                // Handle API key logic for VT+ users and Gemini models
                const isGeminiModel = model.toString().toLowerCase().includes('gemini');
                const isVtPlusUser = userTier === UserTier.PLUS;

                if (isGeminiModel && isVtPlusUser) {
                    // For VT+ users with Gemini models, check if they have BYOK
                    const hasUserGeminiKey = byokKeys?.GEMINI_API_KEY
                        && byokKeys.GEMINI_API_KEY.trim().length > 0;
                    const hasSystemGeminiKey = typeof process !== 'undefined'
                        && !!process.env?.GEMINI_API_KEY;

                    if (!hasUserGeminiKey && hasSystemGeminiKey) {
                        // VT+ user without BYOK - use system key
                        byokKeys = undefined;
                        log.info('VT+ user without BYOK - using system API key for generateText');
                    }
                }

                const selectedModel = getLanguageModel(
                    model,
                    middleware,
                    byokKeys,
                    useSearchGrounding,
                    undefined,
                    thinkingMode?.claude4InterleavedThinking,
                    isVtPlusUser,
                );

                // Set up provider options based on model's reasoning type
                const providerOptions: any = {};
                const reasoningType = getReasoningType(model);

                if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
                    switch (reasoningType) {
                        case 'gemini-thinking':
                            // Gemini models use thinkingConfig
                            providerOptions.google = {
                                thinkingConfig: {
                                    includeThoughts: thinkingMode.includeThoughts ?? true,
                                    maxOutputTokens: thinkingMode.budget,
                                },
                            };
                            break;

                        case 'anthropic-reasoning':
                            // Anthropic Claude 4 models support reasoning through beta features
                            providerOptions.anthropic = {
                                reasoningText: true,
                            };
                            break;

                        case 'deepseek-reasoning':
                            // DeepSeek reasoning models work through middleware extraction
                            // No special provider options needed as middleware handles <think> tags
                            break;
                    }
                }

                const streamConfig = filteredMessages?.length
                    ? {
                        model: selectedModel,
                        messages: [
                            {
                                role: 'system',
                                content: prompt,
                            },
                            ...filteredMessages,
                        ],
                        tools,
                        maxSteps,
                        toolChoice: toolChoice as any,
                        abortSignal: signal,
                        ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                    }
                    : {
                        prompt,
                        model: selectedModel,
                        tools,
                        maxSteps,
                        toolChoice: toolChoice as any,
                        abortSignal: signal,
                        ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                    };

                // Use quota-enforced streamText for VT+ users with correct feature based on mode
                let streamResult;
                const user = { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN } as const;
                const isByokKey = !!(byokKeys && Object.keys(byokKeys).length > 0);

                // Determine if this mode requires VT+ quota consumption
                const vtplusFeature = getVTPlusFeatureFromChatMode(mode);
                const requiresQuotaConsumption = userId
                    && userTier === 'PLUS'
                    && isEligibleForQuotaConsumption(user, isByokKey)
                    && vtplusFeature !== null;

                if (requiresQuotaConsumption) {
                    const { streamTextWithQuota } = await import(
                        '@repo/common/lib/geminiWithQuota'
                    );
                    const { isUsingByokKeys } = await import('@repo/common/lib/geminiWithQuota');
                    const { VtPlusFeature } = await import('@repo/common/config/vtPlusLimits');

                    // Convert string feature code to enum
                    const feature = vtplusFeature === 'DR'
                        ? VtPlusFeature.DEEP_RESEARCH
                        : VtPlusFeature.PRO_SEARCH;

                    streamResult = await streamTextWithQuota(streamConfig, {
                        user: { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN },
                        feature: feature,
                        amount: 1,
                        isByokKey: isUsingByokKeys(byokKeys),
                    });
                } else {
                    // Regular chat or VT+ user with unlimited models
                    try {
                        streamResult = streamText(streamConfig);
                    } catch (error: any) {
                        log.error('Error in streamText call:', { error: error.message });

                        // Enhanced error handling with provider-specific error extraction
                        const { ProviderErrorExtractor } = await import(
                            '../services/provider-error-extractor'
                        );
                        const errorResult = ProviderErrorExtractor.extractError(
                            error,
                            model?.provider as any,
                        );

                        if (errorResult.success && errorResult.error) {
                            const providerError = errorResult.error;
                            log.error('Provider error extracted:', {
                                provider: providerError.provider,
                                errorCode: providerError.errorCode,
                                userMessage: providerError.userMessage,
                                isRetryable: providerError.isRetryable,
                            });

                            // Create a user-friendly error with provider details
                            const enhancedError = new Error(providerError.userMessage);
                            (enhancedError as any).provider = providerError.provider;
                            (enhancedError as any).errorCode = providerError.errorCode;
                            (enhancedError as any).isRetryable = providerError.isRetryable;
                            (enhancedError as any).suggestedAction = providerError.suggestedAction;
                            (enhancedError as any).originalError = providerError.originalError;

                            throw enhancedError;
                        }

                        // Fallback to more descriptive error message if we can determine the provider
                        if (model) {
                            const modelInfo = models.find((m) => m.id === model);
                            if (modelInfo) {
                                const providerName = modelInfo.provider;
                                const hasApiKey = byokKeys && Object.keys(byokKeys).length > 0;

                                if (!hasApiKey) {
                                    throw new Error(
                                        `API key required for ${modelInfo.name}. Please add your ${providerName} API key in Settings.`,
                                    );
                                }
                            }
                        }

                        throw error;
                    }
                }
                const { fullStream } = streamResult;
                let fullText = '';
                let reasoning = '';

                for await (const chunk of fullStream) {
                    if (signal?.aborted) {
                        throw new Error('Operation aborted');
                    }

                    if (chunk.type === 'text') {
                        fullText += chunk.textDelta;
                        onChunk?.(chunk.textDelta, fullText);
                    }
                    if (chunk.type === 'reasoning') {
                        reasoning += chunk.textDelta;
                        onReasoning?.(chunk.textDelta, reasoning);
                    }
                    if (chunk.type === 'tool-call') {
                        onToolCall?.(chunk);
                    }
                    if (chunk.type === ('tool-result' as any)) {
                        onToolResult?.(chunk);
                    }

                    if (chunk.type === 'error') {
                        log.error(chunk.error);
                        return Promise.reject(chunk.error);
                    }
                }

                // Extract reasoning details if available
                try {
                    if (streamResult?.reasoning) {
                        const reasoningDetails = (await streamResult.reasoning) || [];
                        if (reasoningDetails.length > 0) {
                            onReasoningDetails?.(reasoningDetails);
                        }
                    }
                } catch (error) {
                    log.warn('Failed to resolve reasoningDetails:', { data: error });
                }

                // Cache the result before returning
                textGenerationCache.set(cacheKey, {
                    timestamp: Date.now(),
                    result: fullText,
                });

                return fullText;
            } catch (error) {
                log.error('Error in generateText:', error);
                throw error;
            } finally {
                // Remove the in-flight request when done
                inFlightRequests.delete(cacheKey);
            }
        })();

        // Store the in-flight request
        inFlightRequests.set(cacheKey, requestPromise);

        // Wait for the request to complete and return the result
        return await requestPromise;
    } catch (error) {
        log.error(error);
        return Promise.reject(error);
    }
};

export const generateObject = async ({
    prompt,
    model,
    schema,
    messages,
    signal,
    byokKeys,
    thinkingMode,
    userTier,
    userId,
    feature,
}: {
    prompt: string;
    model: ModelEnum;
    schema: ZodSchema;
    messages?: ModelMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
    userTier?: UserTierType;
    userId?: string;
    feature?: string; // VtPlusFeature
}) => {
    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        log.info('=== generateObject START ===');
        log.info('Input parameters:', {
            prompt: `${prompt?.slice(0, 100)}...`,
            model,
            hasSchema: !!schema,
            messagesLength: messages?.length,
            hasSignal: !!signal,
            byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        });

        // Filter out messages with empty content to prevent Gemini API errors
        let filteredMessages = messages;
        if (messages?.length) {
            filteredMessages = messages.filter((message) => {
                const hasContent = message.content
                    && (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                        ? message.content.length > 0
                        : true);

                if (!hasContent) {
                    log.warn('Filtering out message with empty content:', {
                        role: message.role,
                        contentType: typeof message.content,
                        contentLength: Array.isArray(message.content)
                            ? message.content.length
                            : typeof message.content === 'string'
                            ? message.content.length
                            : 0,
                    });
                }

                return hasContent;
            });

            log.info('Message filtering:', {
                originalCount: messages.length,
                filteredCount: filteredMessages.length,
                removedCount: messages.length - filteredMessages.length,
            });
        }

        // Import reasoning utilities
        const { supportsReasoning, getReasoningType } = await import('../models');

        // Handle API key logic for Gemini models (both free tier and VT+ users)
        const isGeminiModel = model.toString().toLowerCase().includes('gemini');
        const isVtPlusUser = userTier === UserTier.PLUS;
        const isFreeGeminiModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;

        if (isGeminiModel) {
            const hasUserGeminiKey = byokKeys?.GEMINI_API_KEY
                && byokKeys.GEMINI_API_KEY.trim().length > 0;
            const hasSystemGeminiKey = typeof process !== 'undefined'
                && !!process.env?.GEMINI_API_KEY;

            // Handle different scenarios for API key requirements
            if (!hasUserGeminiKey && !hasSystemGeminiKey) {
                if (isFreeGeminiModel && !isVtPlusUser) {
                    // Free tier user with free model - require BYOK for planning
                    throw new Error(
                        'Planning requires an API key. Please add your own Gemini API key in settings for unlimited usage.',
                    );
                }
                if (isVtPlusUser) {
                    throw new Error(
                        'Planning is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.',
                    );
                }
                throw new Error('Gemini API key is required for planning functionality');
            }

            // Use system key when available and user doesn't have BYOK
            if (!hasUserGeminiKey && hasSystemGeminiKey) {
                byokKeys = undefined;
                log.info('Using system API key for generateObject');
            }
        }

        const selectedModel = getLanguageModel(
            model,
            undefined,
            byokKeys,
            undefined,
            undefined,
            thinkingMode?.claude4InterleavedThinking,
            isVtPlusUser,
        );
        log.info('Selected model for generateObject:', {
            hasModel: !!selectedModel,
            modelType: typeof selectedModel,
        });

        // Set up provider options based on model's reasoning type
        const providerOptions: any = {};
        const reasoningType = getReasoningType(model);

        if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
            switch (reasoningType) {
                case ReasoningType.GEMINI_THINKING:
                    // Gemini models use thinkingConfig
                    providerOptions.google = {
                        thinkingConfig: {
                            includeThoughts: thinkingMode.includeThoughts ?? true,
                            maxOutputTokens: thinkingMode.budget,
                        },
                    };
                    break;

                case ReasoningType.ANTHROPIC_REASONING:
                    // Anthropic Claude 4 models support reasoning through beta features
                    providerOptions.anthropic = {
                        reasoningText: true,
                    };
                    break;

                case ReasoningType.DEEPSEEK_REASONING:
                    // DeepSeek reasoning models work through middleware extraction
                    // No special provider options needed as middleware handles <think> tags
                    break;
            }
        }

        log.info('Calling generateObjectAi with:', {
            configType: filteredMessages?.length ? 'with-messages' : 'prompt-only',
            hasPrompt: !!prompt,
            hasSchema: !!schema,
            messagesCount: filteredMessages?.length,
            hasProviderOptions: Object.keys(providerOptions).length > 0,
        });

        const generateConfig = filteredMessages?.length
            ? {
                model: selectedModel,
                schema,
                messages: [
                    {
                        role: 'system',
                        content: prompt,
                    },
                    ...filteredMessages,
                ],
                abortSignal: signal,
                ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
            }
            : {
                prompt,
                model: selectedModel,
                schema,
                abortSignal: signal,
                ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
            };

        // Consume quota for VT+ users if using server-funded models
        if (userId && userTier === 'PLUS' && !byokKeys && feature) {
            const { consumeQuota } = await import('@repo/common/lib/vtplusRateLimiter');
            const { VtPlusFeature } = await import('@repo/common/config/vtPlusLimits');

            // Convert feature string to VtPlusFeature enum
            const vtPlusFeature = feature === 'DR'
                ? VtPlusFeature.DEEP_RESEARCH
                : feature === 'PS'
                ? VtPlusFeature.PRO_SEARCH
                : null;

            if (vtPlusFeature) {
                log.info(
                    {
                        userId,
                        feature: vtPlusFeature,
                        amount: 1,
                    },
                    'Consuming VT+ quota for generateObject',
                );

                await consumeQuota({
                    userId,
                    feature: vtPlusFeature,
                    amount: 1,
                });
            }
        }

        const { object } = await generateObjectAi(generateConfig);

        log.info('generateObjectAi successful, result:', {
            hasObject: !!object,
            objectType: typeof object,
        });

        log.info('=== generateObject END ===');
        return JSON.parse(JSON.stringify(object));
    } catch (error: any) {
        log.error('Error in generateObject:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            data: error,
        });

        // Use centralized error message service for better user feedback
        const errorContext: ErrorContext = {
            provider: model.toString().toLowerCase().includes('gemini')
                ? ('google' as any)
                : model.toString().toLowerCase().includes('claude')
                ? ('anthropic' as any)
                : model.toString().toLowerCase().includes('gpt')
                ? ('openai' as any)
                : undefined,
            model: model.toString(),
            userId,
            hasApiKey: !!(byokKeys && Object.keys(byokKeys).length > 0),
            isVtPlus: userTier === UserTier.PLUS,
            originalError: error.message,
        };

        const errorMsg = centralizedGenerateErrorMessage(error, errorContext);

        // Preserve QuotaExceededError type for proper frontend handling
        if (error.name === 'QuotaExceededError') {
            const quotaError = new Error(errorMsg.message);
            quotaError.name = 'QuotaExceededError';
            quotaError.cause = error;
            throw quotaError;
        }

        throw new Error(errorMsg.message);
    }
};

export type EventSchema<T extends Record<string, any>> = {
    [K in keyof T]: (current: T[K] | undefined) => T[K];
};

export class EventEmitter<T extends Record<string, any>> {
    private listeners: Map<string, ((data: any) => void)[]> = new Map();
    private state: Partial<T> = {};

    constructor(initialState?: Partial<T>) {
        this.state = initialState || {};
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
        return this;
    }

    off(event: string, callback: (data: any) => void) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }

    emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
        return this;
    }

    getState(): Partial<T> {
        return { ...this.state };
    }

    updateState<K extends keyof T>(key: K, updater: (current: T[K] | undefined) => T[K]) {
        this.state[key] = updater(this.state[key]);
        return this;
    }
}

export function createEventManager<T extends Record<string, any>>(
    initialState?: Partial<T>,
    _schema?: EventSchema<T>,
) {
    const emitter = new EventEmitter<T>(initialState);

    return {
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter),
        getState: emitter.getState.bind(emitter),
        update: <K extends keyof T>(
            key: K,
            value: T[K] | ((current: T[K] | undefined) => T[K]),
        ) => {
            const updater = typeof value === 'function'
                ? (value as (current: T[K] | undefined) => T[K])
                : () => value;

            emitter.updateState(key, updater);
            emitter.emit('stateChange', {
                key,
                value: emitter.getState()[key],
            });
            return emitter.getState();
        },
    };
}

export const getHumanizedDate = () => {
    return formatDate(new Date(), 'MMMM dd, yyyy, h:mm a');
};

export const getWebPageContent = async (url: string) => {
    try {
        const result = await readURL(url);
        const title = result?.title ? `# ${result.title}\n\n` : '';
        const description = result?.description
            ? `${result.description}\n\n ${result.markdown}\n\n`
            : '';
        const sourceUrl = result?.url ? `Source: [${result.url}](${result.url})\n\n` : '';
        const content = result?.markdown || '';

        if (!content) return '';

        return `${title}${description}${content}${sourceUrl}`;
    } catch (error) {
        log.error(error);
        return `No Result Found for ${url}`;
    }
};

const processContent = (content: string, maxLength = 10_000): string => {
    if (!content) return '';

    const chunks = content.split('\n\n');
    let result = '';

    for (const chunk of chunks) {
        if ((result + chunk).length > maxLength) break;
        result += `${chunk}\n\n`;
    }

    return result.trim();
};

const fetchWithJina = async (url: string): Promise<TReaderResult> => {
    try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                Accept: 'application/json',
                'X-Engine': 'browser',
                // 'X-Md-Link-Style': 'referenced',
                'X-No-Cache': 'true',
                'X-Retain-Images': 'none',
                'X-Return-Format': 'markdown',
                'X-Robots-Txt': 'JinaReader',
                // 'X-With-Links-Summary': 'true',
            },
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            throw new Error(`Jina API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data?.content) {
            return { success: false, error: 'No content found' };
        }

        return {
            success: true,
            title: data.data.title,
            description: data.data.description,
            url: data.data.url,
            markdown: processContent(data.data.content),
            source: 'jina',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const readURL = async (url: string): Promise<TReaderResult> => {
    try {
        if (process.env.JINA_API_KEY) {
            return await fetchWithJina(url);
        }
        log.info('No Jina API key found');

        return { success: false };
    } catch (error) {
        log.error('Error in readURL:', { data: error });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const processWebPages = async (
    results: Array<{ link: string; title: string; }>,
    signal?: AbortSignal,
    options = { batchSize: 4, maxPages: 8, timeout: 30_000 },
) => {
    const processedResults: Array<{
        title: string;
        link: string;
        content: string;
    }> = [];
    const timeoutSignal = AbortSignal.timeout(options.timeout);
    const combinedSignal = new AbortController();

    // Store function references for proper cleanup
    const abortHandler = () => combinedSignal.abort();
    const timeoutAbortHandler = () => combinedSignal.abort();

    signal?.addEventListener('abort', abortHandler);
    timeoutSignal.addEventListener('abort', timeoutAbortHandler);

    try {
        const startTime = Date.now();

        for (let i = 0; i < results.length; i += options.batchSize) {
            if (processedResults.length >= options.maxPages) break;
            if (combinedSignal.signal.aborted) break;
            if (Date.now() - startTime > options.timeout) break;

            const batch = results.slice(i, i + options.batchSize);
            const batchPromises = batch.map((result) =>
                getWebPageContent(result.link)
                    .then((content) => ({
                        title: result.title,
                        link: result.link,
                        content,
                    }))
                    .catch(() => null)
            );

            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter((r): r is NonNullable<typeof r> => r !== null);
            processedResults.push(...validResults);
        }

        return processedResults.slice(0, options.maxPages);
    } catch (error) {
        log.error('Error in processWebPages:', { data: error });
        return processedResults.slice(0, options.maxPages);
    } finally {
        // Clean up event listeners to prevent memory leaks
        signal?.removeEventListener('abort', abortHandler);
        timeoutSignal.removeEventListener('abort', timeoutAbortHandler);
    }
};

export type TReaderResponse = {
    success: boolean;
    title: string;
    url: string;
    markdown: string;
    error?: string;
    source?: 'jina' | 'readability';
};

export type TReaderResult = {
    success: boolean;
    title?: string;
    url?: string;
    description?: string;
    markdown?: string;
    source?: 'jina' | 'readability';
    error?: string;
};

export const handleError = (error: Error, { events }: TaskParams) => {
    const errorMessage = generateErrorMessage(error);
    log.error('Task failed', { data: error });

    events?.update('error', (prev) => ({
        ...prev,
        error: errorMessage,
        status: 'ERROR',
    }));

    return Promise.resolve({
        retry: false,
        result: 'error',
    });
};

export const sendEvents = (events?: TypedEventEmitter<WorkflowEventSchema>) => {
    const nextStepId = () => Object.keys(events?.getState('steps') || {}).length;

    const updateStep = (params: {
        stepId: number;
        text?: string;
        stepStatus: 'PENDING' | 'COMPLETED';
        subSteps: Record<string, { status: 'PENDING' | 'COMPLETED'; data?: any; }>;
    }) => {
        const { stepId, text, stepStatus, subSteps } = params;
        events?.update('steps', (prev) => ({
            ...prev,
            [stepId]: {
                ...prev?.[stepId],
                id: stepId,
                text: text || prev?.[stepId]?.text,
                status: stepStatus,
                steps: {
                    ...prev?.[stepId]?.steps,
                    ...Object.entries(subSteps).reduce((acc, [key, value]) => {
                        return {
                            ...acc,
                            [key]: {
                                ...prev?.[stepId]?.steps?.[key],
                                ...value,
                                data: Array.isArray(value?.data)
                                    ? [...(prev?.[stepId]?.steps?.[key]?.data || []), ...value.data]
                                    : typeof value?.data === 'object'
                                    ? {
                                        ...prev?.[stepId]?.steps?.[key]?.data,
                                        ...value.data,
                                    }
                                    : value?.data
                                    ? value.data
                                    : prev?.[stepId]?.steps?.[key]?.data,
                            },
                        };
                    }, {}),
                },
            },
        }));
    };

    const addSources = (sources: any[]) => {
        events?.update('sources', (prev) => {
            const newSources = sources
                ?.filter((result: any) => !prev?.some((source) => source.link === result.link))
                .map((result: any, index: number) => ({
                    title: result?.title,
                    link: result?.link,
                    snippet: result?.snippet,
                    index: index + (prev?.length || 1),
                }));
            return [...(prev || []), ...newSources];
        });
    };

    const updateAnswer = ({
        text,
        finalText,
        status,
    }: {
        text?: string;
        finalText?: string;
        status?: 'PENDING' | 'COMPLETED';
    }) => {
        events?.update('answer', (prev) => ({
            ...prev,
            text: text || prev?.text,
            finalText: finalText || prev?.finalText,
            status: status || prev?.status,
        }));
    };

    const updateStatus = (status: 'PENDING' | 'COMPLETED' | 'ERROR') => {
        events?.update('status', (_prev) => status);
    };

    const updateObject = (object: any) => {
        events?.update('object', (_prev) => object);
    };

    return {
        updateStep,
        addSources,
        updateAnswer,
        nextStepId,
        updateStatus,
        updateObject,
    };
};

/**
 * Selects an appropriate model based on available API keys
 * Provides fallback mechanism when primary model isn't available
 */
export const selectAvailableModel = (
    preferredModel: ModelEnum,
    byokKeys?: Record<string, string>,
): ModelEnum => {
    log.info('=== selectAvailableModel START ===');

    // Safe window/self checks for debugging
    let hasSelfApiKeys = false;
    let hasWindowApiKeys = false;

    try {
        hasSelfApiKeys = typeof self !== 'undefined' && !!(self as any).AI_API_KEYS;
    } catch {
        // self not available
    }

    try {
        hasWindowApiKeys = typeof window !== 'undefined' && !!(window as any).AI_API_KEYS;
    } catch {
        // window not available
    }

    log.info('Input:', {
        preferredModel,
        availableKeys: byokKeys ? Object.keys(byokKeys).filter((key) => byokKeys[key]) : [],
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        hasSelf: typeof self !== 'undefined',
        hasWindow: (() => {
            try {
                return typeof window !== 'undefined';
            } catch {
                return false;
            }
        })(),
        hasSelfApiKeys,
        hasWindowApiKeys,
    });

    // Check if preferred model's provider has an API key
    const hasApiKeyForModel = (model: ModelEnum): boolean => {
        const providers = {
            // Gemini models
            [ModelEnum.GEMINI_2_5_FLASH]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_5_FLASH_LITE]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_5_PRO]: 'GEMINI_API_KEY',
            // OpenAI models
            [ModelEnum.GPT_5]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4o_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4o]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1_Nano]: 'OPENAI_API_KEY',
            [ModelEnum.O1]: 'OPENAI_API_KEY',
            [ModelEnum.O1_MINI]: 'OPENAI_API_KEY',
            [ModelEnum.O3]: 'OPENAI_API_KEY',
            [ModelEnum.O3_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.O4_Mini]: 'OPENAI_API_KEY',
            // Anthropic models
            [ModelEnum.CLAUDE_4_1_OPUS]: 'ANTHROPIC_API_KEY',
            [ModelEnum.CLAUDE_4_SONNET]: 'ANTHROPIC_API_KEY',
            [ModelEnum.CLAUDE_4_OPUS]: 'ANTHROPIC_API_KEY',
            // Fireworks models
            [ModelEnum.DEEPSEEK_R1_FIREWORKS]: 'FIREWORKS_API_KEY',
            [ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS]: 'FIREWORKS_API_KEY',
            // xAI models
            [ModelEnum.GROK_3]: 'XAI_API_KEY',
            [ModelEnum.GROK_3_MINI]: 'XAI_API_KEY',
            [ModelEnum.GROK_4]: 'XAI_API_KEY',
            // OpenRouter models
            [ModelEnum.DEEPSEEK_V3_0324]: 'OPENROUTER_API_KEY',
            [ModelEnum.DEEPSEEK_R1]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_235B_A22B]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_32B]: 'OPENROUTER_API_KEY',
            [ModelEnum.MISTRAL_NEMO]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_14B]: 'OPENROUTER_API_KEY',
            [ModelEnum.KIMI_K2]: 'OPENROUTER_API_KEY',
            [ModelEnum.GPT_OSS_120B]: 'OPENROUTER_API_KEY',
            [ModelEnum.GPT_OSS_20B]: 'OPENROUTER_API_KEY',
        };

        const requiredApiKey = providers[model];
        if (!requiredApiKey) return false;

        const apiKey = byokKeys?.[requiredApiKey];
        return !!(apiKey && apiKey.trim().length > 0);
    };

    // Try preferred model first
    if (hasApiKeyForModel(preferredModel)) {
        log.info('Using preferred model:', { data: preferredModel });
        return preferredModel;
    }

    // Fallback priority list - most reliable and cost-effective models first
    const fallbackModels = [
        ModelEnum.GEMINI_2_5_FLASH_LITE, // Free Gemini model
        ModelEnum.GEMINI_2_5_FLASH, // Newer Gemini
        ModelEnum.GPT_5, // GPT-5 as top priority for OpenAI models
        ModelEnum.GPT_4o, // More expensive but reliable
        ModelEnum.GPT_4o_Mini, // Most cost-effective OpenAI model
        ModelEnum.CLAUDE_4_SONNET, // Anthropic fallback
    ];

    for (const model of fallbackModels) {
        if (hasApiKeyForModel(model)) {
            log.info('Using fallback model:', { data: model });
            return model;
        }
    }

    // Check if we have server-funded keys available for free models
    const hasServerFundedGeminiKey = typeof process !== 'undefined'
        && !!process.env?.GEMINI_API_KEY;
    if (hasServerFundedGeminiKey) {
        log.info('Using server-funded Gemini model');
        return ModelEnum.GEMINI_2_5_FLASH_LITE;
    }

    log.warn('No API key found for any model, will fail with clear error message');
    // Return the preferred model to let the provider give a clear error message
    return preferredModel;
};
