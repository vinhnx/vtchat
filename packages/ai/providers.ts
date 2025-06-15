import { createAnthropic } from '@ai-sdk/anthropic';
import { createFireworks } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModelV1 } from '@ai-sdk/provider';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { ChatMode } from '@repo/shared/config';
import { LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { ModelEnum, models } from './models';

export const Providers = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    TOGETHER: 'together',
    GOOGLE: 'google',
    FIREWORKS: 'fireworks',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

// Define a global type for API keys
declare global {
    interface Window {
        AI_API_KEYS?: {
            [key in ProviderEnumType]?: string;
        };
        SERPER_API_KEY?: string;
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
        };
        
        const byokKey = byokKeys[keyMapping[provider]];
        if (byokKey) return byokKey;
    }

    // For server environments
    if (typeof process !== 'undefined' && process.env) {
        switch (provider) {
            case Providers.OPENAI:
                if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
                break;
            case Providers.ANTHROPIC:
                if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
                break;
            case Providers.TOGETHER:
                if (process.env.TOGETHER_API_KEY) return process.env.TOGETHER_API_KEY;
                break;
            case Providers.GOOGLE:
                if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
                break;
            case Providers.FIREWORKS:
                if (process.env.FIREWORKS_API_KEY) return process.env.FIREWORKS_API_KEY;
                break;
        }
    }

    // For worker environments (use self)
    if (typeof self !== 'undefined') {
        // Check if AI_API_KEYS exists on self
        if ((self as any).AI_API_KEYS && (self as any).AI_API_KEYS[provider]) {
            return (self as any).AI_API_KEYS[provider];
        }

        // For browser environments (self is also defined in browser)
        if (typeof window !== 'undefined' && window.AI_API_KEYS) {
            return window.AI_API_KEYS[provider] || '';
        }
    }

    return '';
};

export const getProviderInstance = (provider: ProviderEnumType, byokKeys?: Record<string, string>) => {
    switch (provider) {
        case Providers.OPENAI:
            return createOpenAI({
                apiKey: getApiKey(Providers.OPENAI, byokKeys),
            });
        case 'anthropic':
            return createAnthropic({
                apiKey: getApiKey(Providers.ANTHROPIC, byokKeys),
                headers: {
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
            });
        case 'together':
            return createTogetherAI({
                apiKey: getApiKey(Providers.TOGETHER, byokKeys),
            });
        case 'google':
            return createGoogleGenerativeAI({
                apiKey: getApiKey(Providers.GOOGLE, byokKeys),
            });
        case 'fireworks':
            return createFireworks({
                apiKey: getApiKey(Providers.FIREWORKS, byokKeys),
            });
        default:
            return createOpenAI({
                apiKey: getApiKey(Providers.OPENAI, byokKeys),
            });
    }
};

export const getLanguageModel = (m: ModelEnum, middleware?: LanguageModelV1Middleware, byokKeys?: Record<string, string>) => {
    const model = models.find(model => model.id === m);
    const instance = getProviderInstance(model?.provider as ProviderEnumType, byokKeys);
    const selectedModel = instance(model?.id || ChatMode.GEMINI_2_0_FLASH);
    if (middleware) {
        return wrapLanguageModel({ model: selectedModel, middleware }) as LanguageModelV1;
    }
    return selectedModel as LanguageModelV1;
};
