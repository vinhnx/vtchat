import { createAnthropic } from '@ai-sdk/anthropic';
import { createFireworks } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from '@ai-sdk/provider';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import { type LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { CLAUDE_4_CONFIG } from './constants/reasoning';
import { type ModelEnum, models } from './models';

export const Providers = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    TOGETHER: 'together',
    GOOGLE: 'google',
    FIREWORKS: 'fireworks',
    XAI: 'xai',
    OPENROUTER: 'openrouter',
    LMSTUDIO: 'lmstudio',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

// Define a global type for API keys
declare global {
    interface Window {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
        JINA_API_KEY?: string;
        NEXT_PUBLIC_APP_URL?: string;
    }
}

// Helper function to get API key from env, global, or BYOK keys
// Note: For LM Studio, this returns the base URL instead of an API key
const getApiKey = (provider: ProviderEnumType, byokKeys?: Record<string, string>): string => {
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
            [Providers.LMSTUDIO]: 'LMSTUDIO_BASE_URL',
        };

        const byokKey = byokKeys[keyMapping[provider]];
        if (byokKey) return byokKey;
    }

    // Check server-side environment variables if available
    if (typeof process !== 'undefined' && process.env) {
        const envKeyMapping: Record<ProviderEnumType, string> = {
            [Providers.OPENAI]: process.env.OPENAI_API_KEY || '',
            [Providers.ANTHROPIC]: process.env.ANTHROPIC_API_KEY || '',
            [Providers.TOGETHER]: process.env.TOGETHER_API_KEY || '',
            [Providers.GOOGLE]: process.env.GEMINI_API_KEY || '',
            [Providers.FIREWORKS]: process.env.FIREWORKS_API_KEY || '',
            [Providers.XAI]: process.env.XAI_API_KEY || '',
            [Providers.OPENROUTER]: process.env.OPENROUTER_API_KEY || '',
            [Providers.LMSTUDIO]: process.env.LMSTUDIO_BASE_URL || '',
        };

        const envKey = envKeyMapping[provider];
        if (envKey) return envKey;
    }

    // For worker environments (use self)
    if (typeof self !== 'undefined') {
        // Check if AI_API_KEYS exists on self
        if ((self as any).AI_API_KEYS && (self as any).AI_API_KEYS[provider]) {
            return (self as any).AI_API_KEYS[provider];
        }

        // For browser environments (self is also defined in browser)
        try {
            if (typeof window !== 'undefined' && (window as any).AI_API_KEYS) {
                return (window as any).AI_API_KEYS[provider] || '';
            }
        } catch {
            // window is not available in this environment
        }
    }

    return '';
};

export const getProviderInstance = (
    provider: ProviderEnumType,
    byokKeys?: Record<string, string>,
    isFreeModel?: boolean,
    claude4InterleavedThinking?: boolean
): any => {
    const apiKey = getApiKey(provider, byokKeys);

    log.info('Provider instance debug:', {
        provider,
        isFreeModel,
        hasApiKey: !!apiKey,
        hasByokKeys: !!byokKeys,
        byokKeysKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        apiKeyLength: apiKey ? apiKey.length : 0,
    });

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
            if (!apiKey) {
                throw new Error(
                    'OpenAI API key required. Please add your API key in Settings → API Keys → OpenAI. Get a key at https://platform.openai.com/api-keys'
                );
            }
            return createOpenAI({
                apiKey,
            });
        case 'anthropic': {
            if (!apiKey) {
                throw new Error(
                    'Anthropic API key required. Please add your API key in Settings → API Keys → Anthropic. Get a key at https://console.anthropic.com/'
                );
            }
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
            if (!apiKey) {
                throw new Error(
                    'Together AI API key required. Please add your API key in Settings → API Keys → Together AI. Get a key at https://api.together.xyz/'
                );
            }
            return createTogetherAI({
                apiKey,
            });
        case 'google':
            if (!apiKey) {
                throw new Error(
                    'Gemini API key required. Please add your API key in Settings → API Keys → Google Gemini. Get a free key at https://ai.google.dev/api'
                );
            }
            return createGoogleGenerativeAI({
                apiKey,
            });
        case 'fireworks':
            if (!apiKey) {
                throw new Error(
                    'Fireworks AI API key required. Please add your API key in Settings → API Keys → Fireworks AI. Get a key at https://app.fireworks.ai/'
                );
            }
            return createFireworks({
                apiKey,
            });
        case 'xai':
            if (!apiKey) {
                throw new Error(
                    'xAI Grok API key required. Please add your API key in Settings → API Keys → xAI. Get a key at https://x.ai/api'
                );
            }
            return createXai({
                apiKey,
            });
        case 'openrouter':
            if (!apiKey) {
                throw new Error(
                    'OpenRouter API key required. Please add your API key in Settings → API Keys → OpenRouter. Get a key at https://openrouter.ai/keys'
                );
            }
            return createOpenRouter({
                apiKey,
            });
        case 'lmstudio': {
            // LM Studio uses baseURL instead of API key
            let rawURL = apiKey || 'http://localhost:1234';

            // Add protocol if missing
            if (!/^https?:\/\//i.test(rawURL)) {
                rawURL = `http://${rawURL}`;
            }

            // For browser environments, use proxy to avoid CORS/mixed content issues
            if (typeof window !== 'undefined' && window.location) {
                // In production, use the proxy endpoint
                const isProduction = window.location.protocol === 'https:';
                if (isProduction) {
                    return createOpenAI({
                        baseURL: '/api/lmstudio-proxy',
                        apiKey: 'not-required',
                        defaultHeaders: {
                            'x-lmstudio-url': rawURL,
                        },
                    });
                }
            }

            // Security: Validate that base URL is localhost only (prevent SSRF)
            const url = new URL(rawURL);
            const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

            if (!LOCAL_HOSTS.has(url.hostname) && !process.env.ALLOW_REMOTE_LMSTUDIO) {
                throw new Error(
                    'LM Studio base URL must resolve to localhost. Set ALLOW_REMOTE_LMSTUDIO=true to override.'
                );
            }

            // Clean up URL and add /v1 endpoint
            const baseURL = url.origin.replace(/\/+$/, '') + '/v1';

            return createOpenAI({
                baseURL,
                apiKey: 'not-required', // LM Studio doesn't require API key
            });
        }
        default:
            if (!apiKey) {
                throw new Error(
                    'API key required for this model. Please add your API key in Settings → API Keys. Check the model provider documentation for instructions.'
                );
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
    claude4InterleavedThinking?: boolean
) => {
    log.info('=== getLanguageModel START ===');
    log.info('Parameters:', {
        modelEnum: m,
        hasMiddleware: !!middleware,
        hasByokKeys: !!byokKeys,
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        useSearchGrounding,
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
            claude4InterleavedThinking
        );
        log.info('Provider instance created:', {
            hasInstance: !!instance,
            instanceType: typeof instance,
        });

        // Handle Gemini models with search grounding or caching
        if (model?.provider === 'google' && (useSearchGrounding || cachedContent)) {
            log.info('Creating Gemini model with special options...');
            const modelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;
            log.info('Using model ID:', { data: modelId });

            try {
                const modelOptions: any = {};

                if (useSearchGrounding) {
                    modelOptions.useSearchGrounding = true;
                }

                if (cachedContent) {
                    modelOptions.cachedContent = cachedContent;
                }

                const selectedModel = instance(modelId, modelOptions);
                log.info('Gemini model created with options:', {
                    hasModel: !!selectedModel,
                    modelType: typeof selectedModel,
                    useSearchGrounding,
                    hasCachedContent: !!cachedContent,
                });

                if (middleware) {
                    log.info('Wrapping model with middleware...');
                    return wrapLanguageModel({
                        model: selectedModel,
                        middleware,
                    }) as LanguageModelV1;
                }
                return selectedModel as LanguageModelV1;
            } catch (error: any) {
                log.error('Error creating Gemini model with special options:', {
                    data: error,
                });
                log.error('Error stack:', { data: error.stack });
                throw error;
            }
        }

        log.info('Creating standard model...');
        const modelId = model?.id || ChatMode.GEMINI_2_5_FLASH_LITE;
        log.info('Using model ID:', { data: modelId });

        try {
            const selectedModel = instance(modelId);
            log.info('Standard model created:', {
                hasModel: !!selectedModel,
                modelType: typeof selectedModel,
            });

            if (middleware) {
                log.info('Wrapping model with middleware...');
                return wrapLanguageModel({
                    model: selectedModel,
                    middleware,
                }) as LanguageModelV1;
            }
            log.info('=== getLanguageModel END ===');
            return selectedModel as LanguageModelV1;
        } catch (error: any) {
            log.error('Error creating standard model:', { data: error });
            log.error('Error stack:', { data: error.stack });
            throw error;
        }
    } catch (error: any) {
        log.error('Error in getLanguageModel:', { data: error });
        log.error('Error stack:', { data: error.stack });

        // Re-throw the original error without modification to preserve
        // the clear, actionable error messages from getProviderInstance
        throw error;
    }
};
