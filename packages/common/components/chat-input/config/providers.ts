import type { ApiKeys } from '@repo/common/store';

export const PROVIDERS: Record<
    keyof ApiKeys,
    {
        name: string;
        url: string;
        placeholder: string;
    }
> = {
    OPENAI_API_KEY: {
        name: 'OpenAI',
        url: 'https://platform.openai.com/api-keys',
        placeholder: 'sk-...',
    },
    ANTHROPIC_API_KEY: {
        name: 'Anthropic',
        url: 'https://console.anthropic.com/settings/keys',
        placeholder: 'sk-ant-...',
    },
    GEMINI_API_KEY: {
        name: 'Google Gemini',
        url: 'https://ai.google.dev/api',
        placeholder: 'AIza...',
    },
    FIREWORKS_API_KEY: {
        name: 'Fireworks AI',
        url: 'https://app.fireworks.ai/settings/users/api-keys',
        placeholder: 'fw-...',
    },
    XAI_API_KEY: {
        name: 'xAI Grok',
        url: 'https://x.ai/api',
        placeholder: 'xai-...',
    },
    OPENROUTER_API_KEY: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/keys',
        placeholder: 'sk-or-...',
    },
};

export const getProviderInfo = (key: keyof ApiKeys) => {
    return (
        PROVIDERS[key] || {
            name: 'API Provider',
            url: '#',
            placeholder: 'Enter API key...',
        }
    );
};
