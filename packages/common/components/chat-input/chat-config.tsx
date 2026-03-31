import { type Model } from '@repo/ai/models';
import type { ApiKeys } from '@repo/common/store/api-keys.store';
import { ChatMode, ChatModeConfig, DEFAULT_CHAT_MODE } from '@repo/shared/config';
import type { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { checkSubscriptionAccess, type SubscriptionContext } from '@repo/shared/utils/subscription';
import { Brain } from 'lucide-react';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic • 10/day with VT+',
        value: ChatMode.Deep,
        iconName: 'Atom',
    },
    {
        label: 'Pro Search',
        description: 'Enhanced web search with advanced AI • 20/day with VT+',
        value: ChatMode.Pro,
        iconName: 'Star',
    },
];

// Helper function to get ChatMode from Model
export const getChatModeFromModel = (model: Model): ChatMode | null => {
    const modelToChatModeMap: Record<string, ChatMode> = {
        // Google models
        'Gemini 3.1 Pro Preview': ChatMode.GEMINI_3_1_PRO,
        'Gemini 3 Flash Preview': ChatMode.GEMINI_3_FLASH,
        'Gemini 3.1 Flash Lite Preview': ChatMode.GEMINI_3_1_FLASH_LITE,
        // Anthropic models
        'Claude 4.6 Opus': ChatMode.CLAUDE_4_6_OPUS,
        'Claude 4.6 Sonnet': ChatMode.CLAUDE_4_6_SONNET,
        'Claude 4.5 Haiku': ChatMode.CLAUDE_4_5_HAIKU,
        // OpenAI models
        'GPT-5.4': ChatMode.GPT_5_4,
        'GPT-5.4 Pro': ChatMode.GPT_5_4_PRO,
        'GPT-5.4 Mini': ChatMode.GPT_5_4_MINI,
        'GPT-5.4 Nano': ChatMode.GPT_5_4_NANO,
    };

    const nameMapping = modelToChatModeMap[model.name];
    if (nameMapping) return nameMapping;

    return null;
};

// Helper function to check if a model has reasoning capability
export const hasReasoningCapability = (chatMode: ChatMode): boolean => {
    const reasoningModels = [
        ChatMode.GPT_5_4,
        ChatMode.GPT_5_4_PRO,
        ChatMode.GPT_5_4_MINI,
        ChatMode.GPT_5_4_NANO,
        ChatMode.CLAUDE_4_6_OPUS,
        ChatMode.CLAUDE_4_6_SONNET,
        ChatMode.CLAUDE_4_5_HAIKU,
        ChatMode.GEMINI_3_1_PRO,
        ChatMode.GEMINI_3_FLASH,
        ChatMode.GEMINI_3_1_FLASH_LITE,
    ];
    return reasoningModels.includes(chatMode);
};

// Helper function to get API key required for each provider
export const getApiKeyForProvider = (provider: string): keyof ApiKeys => {
    const providerApiKeyMap: Record<string, keyof ApiKeys> = {
        google: 'GEMINI_API_KEY',
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
    };

    return providerApiKeyMap[provider] || 'BYOK_API_KEY';
};

// Helper function to get provider icon
export const getProviderIcon = (provider: string, size = 16) => {
    const className = 'flex-shrink-0';
    const cacheBuster = '?v=1';

    switch (provider.toLowerCase()) {
        case 'anthropic':
            return (
                <img
                    src={`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude-color.svg${cacheBuster}`}
                    width={size}
                    height={size}
                    alt='Claude'
                    className={className}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />
            );
        case 'google':
            return (
                <img
                    src={`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/gemini-color.svg${cacheBuster}`}
                    width={size}
                    height={size}
                    alt='Google Gemini'
                    className={className}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />
            );
        case 'openai':
            return (
                <img
                    src={`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg${cacheBuster}`}
                    width={size}
                    height={size}
                    alt='OpenAI'
                    className={className}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                    }}
                />
            );
        default:
            return null;
    }
};

// BYOK-only models - grouped by provider (only OpenAI, Google, Anthropic)
export const modelOptionsByProvider = {
    OpenAI: [
        {
            label: 'GPT-5.4',
            value: ChatMode.GPT_5_4,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT-5.4 Pro',
            value: ChatMode.GPT_5_4_PRO,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT-5.4 Mini',
            value: ChatMode.GPT_5_4_MINI,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT-5.4 Nano',
            value: ChatMode.GPT_5_4_NANO,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
    ],

    Google: [
        {
            label: 'Gemini 3.1 Pro Preview',
            value: ChatMode.GEMINI_3_1_PRO,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 3 Flash Preview',
            value: ChatMode.GEMINI_3_FLASH,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 3.1 Flash Lite Preview',
            value: ChatMode.GEMINI_3_1_FLASH_LITE,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            description: 'Bring your own Gemini API key',
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
    ],

    Anthropic: [
        {
            label: 'Claude 4.6 Opus',
            value: ChatMode.CLAUDE_4_6_OPUS,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4.6 Sonnet',
            value: ChatMode.CLAUDE_4_6_SONNET,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4.5 Haiku',
            value: ChatMode.CLAUDE_4_5_HAIKU,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
    ],
};

// Create modelOptions with the default chat mode first
const allModelOptions = Object.values(modelOptionsByProvider).flat();
const defaultChatModelValue = DEFAULT_CHAT_MODE;
const defaultChatModelOption = allModelOptions.find(
    (option) => option.value === defaultChatModelValue,
);
const otherOptions = allModelOptions.filter(
    (option) => option.value !== defaultChatModelValue,
);

export const modelOptions = defaultChatModelOption
    ? [defaultChatModelOption, ...otherOptions]
    : allModelOptions;

/**
 * Step-by-step access check for a chat mode.
 */
export function checkChatModeAccess(
    context: SubscriptionContext | null,
    mode: ChatMode,
): {
    isAuthRequired: boolean;
    hasAuth: boolean;
    requiredPlan?: PlanSlug;
    hasRequiredPlan: boolean;
    requiredFeature?: FeatureSlug;
    hasRequiredFeature: boolean;
    canAccess: boolean;
} {
    const config = ChatModeConfig[mode];
    const isAuthRequired = !!config.isAuthRequired;
    const hasAuth = !!context && !!context.user;

    const requiredPlan = config.requiredPlan;
    const hasRequiredPlan = requiredPlan
        ? checkSubscriptionAccess(context || {}, { plan: requiredPlan })
        : true;

    const requiredFeature = config.requiredFeature;
    const hasRequiredFeature = requiredFeature
        ? checkSubscriptionAccess(context || {}, { feature: requiredFeature })
        : true;

    const canAccess = (!isAuthRequired || hasAuth) && hasRequiredPlan && hasRequiredFeature;

    return {
        isAuthRequired,
        hasAuth,
        requiredPlan,
        hasRequiredPlan,
        requiredFeature,
        hasRequiredFeature,
        canAccess,
    };
}
