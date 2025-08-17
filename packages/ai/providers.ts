import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModelV1 } from '@ai-sdk/provider';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import { type LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { getMiddlewareForContext, type MiddlewareConfig } from './middleware/config';
export const Providers = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    TOGETHER: 'together',
    GOOGLE: 'google',
    FIREWORKS: 'fireworks',
    XAI: 'xai',
    OPENROUTER: 'openrouter',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

import { CLAUDE_4_CONFIG } from './constants/reasoning';
import { type ModelEnum, models } from './models';
import { generateErrorMessage } from './services/error-messages';

// Define a global type for API keys
declare global {
    interface Window {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
        JINA_API_KEY?: string;
        NEXT_PUBLIC_APP_URL?: string;
    }

    // Extend WorkerGlobalScope for web workers
    interface WorkerGlobalScope {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
    }
}

// Helper function to get API key from env, global, or BYOK keys
// Note: For LM Studio, this returns the base URL instead of an API key
const getApiKey = (
    provider: ProviderEnumType,
    byokKeys?: Record<string, string>,
    isVtPlus?: boolean,
    isFreeModel?: boolean,
): string => {
    // First check BYOK keys if provided
    if (byokKeys) {
        const keyMapping: Record<ProviderEnumType, string> = {
            [Providers.OPENAI]: 'OPENAI_API_KEY',
            [Providers.ANTHROPIC]: 'ANTHROPIC_API_KEY',
            [Providers.TOGETHER]: 'TOGETHER_API_KEY',
            [Providers.GOOGLE]: 'GEMINI_API_KEY',
            [Providers.FIREWORKS]: 'FIREWORKS_API_KEY',
            [Providers.XAI]: 'XAI_API_KEY',
            [Providers.OPENROUTER]: 'OPENROUTER_API_KEY',
        };

        const byokKey = byokKeys[keyMapping[provider]];
        if (byokKey) {
            log.info('getApiKey: Found BYOK key for provider', {
                provider,
                hasByKey: !!byokKey,
                keyLength: byokKey.length,
            });
            return byokKey;
        }
    }

    // Server-funded keys only for whitelisted providers (VT+ policy)
    if (typeof process !== 'undefined' && process.env) {
        switch (provider) {
            case Providers.GOOGLE:
                // Server-funded API key policy for Google/Gemini:
                // 1. VT+ users can always use server-funded API key
                // 2. Free model users can use server-funded API key (counted usage)
                // 3. Other users must use BYOK
                if (isVtPlus || isFreeModel) {
                    // Set both environment variables for compatibility with new Google provider
                    const geminiKey = process.env.GEMINI_API_KEY || '';
                    if (geminiKey && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                        process.env.GOOGLE_GENERATIVE_AI_API_KEY = geminiKey;
                    }
                    log.info('getApiKey: Using server-funded Gemini key', {
                        hasKey: !!geminiKey,
                        keyLength: geminiKey.length,
                    });
                    return geminiKey;
                }
                log.info('getApiKey: No server-funded key for Gemini (non-VT+ user)');
                return '';
            default:
                // All other providers MUST use BYOK - no server-funded keys
                log.info('getApiKey: Provider requires BYOK', { provider });
                return '';
        }
    }

    // For worker environments (use self) - BYOK only
    if (typeof self !== 'undefined') {
        // Check if AI_API_KEYS exists on self (worker environment)
        const workerSelf = self as unknown as WorkerGlobalScope;
        if (workerSelf.AI_API_KEYS?.[provider]) {
            log.info('getApiKey: Found worker AI_API_KEYS for provider', {
                provider,
                hasKey: !!workerSelf.AI_API_KEYS[provider],
                keyLength: workerSelf.AI_API_KEYS[provider].length,
            });
            return workerSelf.AI_API_KEYS[provider];
        }

        // For browser environments (self is also defined in browser)
        try {
            if (typeof window !== 'undefined' && (window as any).AI_API_KEYS) {
                const windowApiKey = (window as any).AI_API_KEYS[provider] || '';
                log.info('getApiKey: Found window AI_API_KEYS for provider', {
                    provider,
                    hasKey: !!windowApiKey,
                    keyLength: windowApiKey.length,
                });
                return windowApiKey;
            }
        } catch {
            // window is not available in this environment
            log.info('getApiKey: Window not available for API key lookup');
        }
    }

    log.info('getApiKey: No API key found for provider', { provider });
    return '';
};

// Define proper return types for provider instances
type ProviderInstance =
    | ReturnType<typeof createOpenAI>
    | ReturnType<typeof createAnthropic>
    | ReturnType<typeof createGoogleGenerativeAI>
    | ReturnType<typeof createTogetherAI>
    | ReturnType<typeof createXai>
    | ReturnType<typeof createOpenRouter>
    | ReturnType<typeof createOpenAICompatible>;

export const getProviderInstance = (
    provider: ProviderEnumType,
    byokKeys?: Record<string, string>,
    isFreeModel?: boolean,
    claude4InterleavedThinking?: boolean,
    isVtPlus?: boolean,
): ProviderInstance => {
    const apiKey = getApiKey(provider, byokKeys, isVtPlus, isFreeModel);

    log.info('Provider instance debug:', {
        provider,
        isFreeModel,
        hasApiKey: !!apiKey,
        hasByokKeys: !!byokKeys,
        byokKeysKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        apiKeyLength: apiKey ? apiKey.length : 0,
        isVtPlus,
        envGeminiKey: provider === 'google' ? !!process.env.GEMINI_API_KEY : undefined,
    });

    // Helper function to validate API key and throw consistent errors
    const validateApiKey = (providerType: ProviderEnumType): void => {
        if (!apiKey) {
            const errorMsg = generateErrorMessage('API key required', {
                provider: providerType,
                hasApiKey: false,
                isVtPlus,
            });

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

    // For free models, provide more helpful error messages if no API key is found
    if (isFreeModel && !apiKey && provider === 'google') {
        log.error('No API key found for free Gemini model - checking environment...');
        log.error('Process env check:', {
            hasProcess: typeof process !== 'undefined',
            hasEnv: typeof process !== 'undefined' ? !!process.env : false,
            hasGeminiKey: typeof process !== 'undefined' ? !!process.env?.GEMINI_API_KEY : false,
        });
    }

    switch (provider) {
        case Providers.OPENAI:
            validateApiKey(Providers.OPENAI);
            return createOpenAI({
                apiKey,
                // Add fetch options to prevent multiple requests
                fetch: (input, init) => {
                    // Add deduplication headers to prevent caching issues
                    const headers = new Headers(init?.headers);
                    headers.set('Cache-Control', 'no-store');
                    headers.set('Pragma', 'no-cache');

                    return globalThis.fetch(input, {
                        ...init,
                        headers,
                    });
                },
            });
        case 'anthropic': {
            validateApiKey(Providers.ANTHROPIC);
            const headers: Record<string, string> = {
                'anthropic-dangerous-direct-browser-access': 'true',
            };

            // Conditionally add Claude 4 interleaved thinking header
            if (claude4InterleavedThinking) {
                headers[CLAUDE_4_CONFIG.BETA_HEADER_KEY] = CLAUDE_4_CONFIG.BETA_HEADER;
            }

            return createAnthropic({
                apiKey,
                headers,
            });
        }
        case 'together':
            validateApiKey(Providers.TOGETHER);
            return createTogetherAI({
                apiKey,
            });
        case 'google':
            validateApiKey(Providers.GOOGLE);
            // Ensure the environment variable is set for the Google provider
            if (apiKey && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
            }
            return createGoogleGenerativeAI({
                apiKey,
            });
        case 'fireworks':
            validateApiKey(Providers.FIREWORKS);
            // Use OpenAI provider for Fireworks to avoid model ID transformation issues
            return createOpenAI({
                baseURL: 'https://api.fireworks.ai/inference/v1',
                apiKey,
            });
        case 'xai':
            validateApiKey(Providers.XAI);
            return createXai({
                apiKey,
            });
        case 'openrouter':
            validateApiKey(Providers.OPENROUTER);
            return createOpenRouter({
                apiKey,
            });
        default:
            if (!apiKey) {
                const errorMsg = generateErrorMessage('API key required', {
                    provider: provider as ProviderEnumType,
                    hasApiKey: false,
                    isVtPlus,
                });

                throw new Error(errorMsg.message);
            }
            // Default to OpenAI-compatible for unknown providers
            return createOpenAI({
                apiKey,
            });
    }
};

export const getLanguageModel = (
    m: ModelEnum,
    middleware?: LanguageModelV1Middleware,
    byokKeys?: Record<string, string>,
    useSearchGrounding?: boolean,
    cachedContent?: string,
    claude4InterleavedThinking?: boolean,
    isVtPlus?: boolean,
    middlewareConfig?: MiddlewareConfig,
) => {
    log.info('=== getLanguageModel START ===');
    log.info('Parameters:', {
        modelEnum: m,
        hasMiddleware: !!middleware,
        hasByokKeys: !!byokKeys,
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        useSearchGrounding,
        isVtPlus,
    });

    const model = models.find((model) => model.id === m);
    log.info('Found model:', {
        found: !!model,
        modelId: model?.id,
        modelName: model?.name,
        modelProvider: model?.provider,
    });

    if (!model) {
        log.error('Model not found:', { data: m });
        throw new Error(`Model ${m} not found`);
    }

    try {
        log.info('Getting provider instance for:', { data: model.provider });
        const instance = getProviderInstance(
            model?.provider as ProviderEnumType,
            byokKeys,
            model?.isFree,
            claude4InterleavedThinking,
            isVtPlus,
        );
        log.info('Provider instance created:', {
            hasInstance: !!instance,
            instanceType: typeof instance,
        });

        // Handle Gemini models with search grounding or caching
        if (model?.provider === 'google' && (useSearchGrounding || cachedContent)) {
            log.info('Creating Gemini model with special options...');
            const modelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;
            const originalModelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;
            log.info('Using model ID:', {
                data: modelId,
                originalModelId,
                provider: model?.provider,
                wasMapped: modelId !== originalModelId,
            });

            try {
                const modelOptions: {
                    useSearchGrounding?: boolean;
                    cachedContent?: string;
                } = {};

                if (useSearchGrounding) {
                    modelOptions.useSearchGrounding = true;
                }

                if (cachedContent) {
                    modelOptions.cachedContent = cachedContent;
                }

                // Type assertion for model creation with options
                const createModel = instance as (
                    id: string,
                    options?: Record<string, unknown>,
                ) => LanguageModelV1;
                const selectedModel = createModel(modelId, modelOptions);
                log.info('Gemini model created with options:', {
                    hasModel: !!selectedModel,
                    modelType: typeof selectedModel,
                    useSearchGrounding,
                    hasCachedContent: !!cachedContent,
                });

                // Combine provided middleware with our configured middleware
                const allMiddleware = [
                    ...(middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : []),
                    ...getMiddlewareForContext(m, middlewareConfig),
                ];

                if (allMiddleware.length > 0) {
                    log.info('Wrapping model with middleware...', {
                        middlewareCount: allMiddleware.length,
                    });
                    return wrapLanguageModel({
                        model: selectedModel,
                        middleware: allMiddleware,
                    }) as LanguageModelV1;
                }
                return selectedModel as LanguageModelV1;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : undefined;
                log.error('Error creating Gemini model with special options:', {
                    data: errorMessage,
                });
                if (errorStack) {
                    log.error('Error stack:', { data: errorStack });
                }
                throw error;
            }
        }

        log.info('Creating standard model...');
        const modelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;

        const originalModelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;
        log.info('Using model ID:', {
            data: modelId,
            originalModelId,
            provider: model?.provider,
            wasMapped: modelId !== originalModelId,
        });
        log.info('Model details:', {
            modelId: model?.id,
            modelName: model?.name,
            modelProvider: model?.provider,
            isGpt5: model?.id === 'gpt-5-2025-08-07',
        });

        try {
            const createModel = instance as (id: string) => LanguageModelV1;
            const selectedModel = createModel(modelId);
            log.info('Standard model created:', {
                hasModel: !!selectedModel,
                modelType: typeof selectedModel,
                modelId: model?.id,
                modelName: model?.name,
            });

            // Combine provided middleware with our configured middleware
            const allMiddleware = [
                ...(middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : []),
                ...getMiddlewareForContext(m, middlewareConfig),
            ];

            if (allMiddleware.length > 0) {
                log.info('Wrapping model with middleware...', {
                    middlewareCount: allMiddleware.length,
                });
                return wrapLanguageModel({
                    model: selectedModel,
                    middleware: allMiddleware,
                }) as LanguageModelV1;
            }
            log.info('=== getLanguageModel END ===');
            return selectedModel as LanguageModelV1;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            log.error('Error creating standard model:', { data: errorMessage });
            if (errorStack) {
                log.error('Error stack:', { data: errorStack });
            }
            throw error;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        log.error('Error in getLanguageModel:', { data: errorMessage });
        if (errorStack) {
            log.error('Error stack:', { data: errorStack });
        }

        // Re-throw the original error without modification to preserve
        // the clear, actionable error messages from getProviderInstance
        throw error;
    }
};
