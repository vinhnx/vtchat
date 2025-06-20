import { createAnthropic } from '@ai-sdk/anthropic';
import { createFireworks } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModelV1 } from '@ai-sdk/provider';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ChatMode } from '@repo/shared/config';
import { LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { ModelEnum, models } from './models';

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
        };

        const byokKey = byokKeys[keyMapping[provider]];
        if (byokKey) return byokKey;
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
    byokKeys?: Record<string, string>
): any => {
    const apiKey = getApiKey(provider, byokKeys);

    switch (provider) {
        case Providers.OPENAI:
            if (!apiKey) {
                throw new Error(
                    'OpenAI API key required. Please add your API key in Settings → API Keys → OpenAI. Get a key at https://platform.openai.com/api-keys'
                );
            }
            return createOpenAI({
                apiKey: apiKey,
            });
        case 'anthropic':
            if (!apiKey) {
                throw new Error(
                    'Anthropic API key required. Please add your API key in Settings → API Keys → Anthropic. Get a key at https://console.anthropic.com/'
                );
            }
            return createAnthropic({
                apiKey: apiKey,
                headers: {
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
            });
        case 'together':
            if (!apiKey) {
                throw new Error(
                    'Together AI API key required. Please add your API key in Settings → API Keys → Together AI. Get a key at https://api.together.xyz/'
                );
            }
            return createTogetherAI({
                apiKey: apiKey,
            });
        case 'google':
            if (!apiKey) {
                throw new Error(
                    'Gemini API key required. Please add your API key in Settings → API Keys → Google Gemini. Get a free key at https://ai.google.dev/api'
                );
            }
            return createGoogleGenerativeAI({
                apiKey: apiKey,
            });
        case 'fireworks':
            if (!apiKey) {
                throw new Error(
                    'Fireworks AI API key required. Please add your API key in Settings → API Keys → Fireworks AI. Get a key at https://app.fireworks.ai/'
                );
            }
            return createFireworks({
                apiKey: apiKey,
            });
        case 'xai':
            if (!apiKey) {
                throw new Error(
                    'xAI Grok API key required. Please add your API key in Settings → API Keys → xAI. Get a key at https://x.ai/api'
                );
            }
            return createXai({
                apiKey: apiKey,
            });
        case 'openrouter':
            if (!apiKey) {
                throw new Error(
                    'OpenRouter API key required. Please add your API key in Settings → API Keys → OpenRouter. Get a key at https://openrouter.ai/keys'
                );
            }
            return createOpenRouter({
                apiKey: apiKey,
            });
        default:
            if (!apiKey) {
                throw new Error(
                    'API key required for this model. Please add your API key in Settings → API Keys. Check the model provider documentation for instructions.'
                );
            }
            // Default to OpenAI-compatible for unknown providers
            return createOpenAI({
                apiKey: apiKey,
            });
    }
};

export const getLanguageModel = (
    m: ModelEnum,
    middleware?: LanguageModelV1Middleware,
    byokKeys?: Record<string, string>,
    useSearchGrounding?: boolean
) => {
    console.log('=== getLanguageModel START ===');
    console.log('Parameters:', {
        modelEnum: m,
        hasMiddleware: !!middleware,
        hasByokKeys: !!byokKeys,
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        useSearchGrounding,
    });

    const model = models.find(model => model.id === m);
    console.log('Found model:', {
        found: !!model,
        modelId: model?.id,
        modelName: model?.name,
        modelProvider: model?.provider,
    });

    if (!model) {
        console.error('Model not found:', m);
        throw new Error(`Model ${m} not found`);
    }

    try {
        console.log('Getting provider instance for:', model.provider);
        const instance = getProviderInstance(model?.provider as ProviderEnumType, byokKeys);
        console.log('Provider instance created:', {
            hasInstance: !!instance,
            instanceType: typeof instance,
        });

        // Handle Gemini models with search grounding
        if (model?.provider === 'google' && useSearchGrounding) {
            console.log('Creating Gemini model with search grounding...');
            const modelId = model?.id || ChatMode.GEMINI_2_0_FLASH;
            console.log('Using model ID:', modelId);

            try {
                const selectedModel = instance(modelId, {
                    useSearchGrounding: true,
                });
                console.log('Gemini model with grounding created:', {
                    hasModel: !!selectedModel,
                    modelType: typeof selectedModel,
                });

                if (middleware) {
                    console.log('Wrapping model with middleware...');
                    return wrapLanguageModel({
                        model: selectedModel,
                        middleware,
                    }) as LanguageModelV1;
                }
                return selectedModel as LanguageModelV1;
            } catch (error: any) {
                console.error('Error creating Gemini model with enhanced search:', error);
                console.error('Error stack:', error.stack);
                throw error;
            }
        }

        console.log('Creating standard model...');
        const modelId = model?.id || ChatMode.GEMINI_2_0_FLASH;
        console.log('Using model ID:', modelId);

        try {
            const selectedModel = instance(modelId);
            console.log('Standard model created:', {
                hasModel: !!selectedModel,
                modelType: typeof selectedModel,
            });

            if (middleware) {
                console.log('Wrapping model with middleware...');
                return wrapLanguageModel({ model: selectedModel, middleware }) as LanguageModelV1;
            }
            console.log('=== getLanguageModel END ===');
            return selectedModel as LanguageModelV1;
        } catch (error: any) {
            console.error('Error creating standard model:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    } catch (error: any) {
        console.error('Error in getLanguageModel:', error);
        console.error('Error stack:', error.stack);

        // Re-throw the original error without modification to preserve
        // the clear, actionable error messages from getProviderInstance
        throw error;
    }
};
