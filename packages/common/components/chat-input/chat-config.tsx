import { Anthropic, Fireworks, Gemini, OpenAI, OpenRouter, XAI } from '@lobehub/icons';
import { type Model, models } from '@repo/ai/models';
import type { ApiKeys } from '@repo/common/store/api-keys.store';
import { ChatMode, ChatModeConfig, DEFAULT_CHAT_MODE } from '@repo/shared/config';
import type { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { checkSubscriptionAccess, type SubscriptionContext } from '@repo/shared/utils/subscription';
import { Brain, Gift } from 'lucide-react';

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
    // Map model names to ChatMode values - using exact names from models.ts
    const modelToChatModeMap: Record<string, ChatMode> = {
        // Google models
        'Gemini 2.5 Pro': ChatMode.GEMINI_2_5_PRO,
        'Gemini 2.5 Flash': ChatMode.GEMINI_2_5_FLASH,
        'Gemini 2.5 Flash Lite': ChatMode.GEMINI_2_5_FLASH_LITE,
        // Anthropic models
        'Claude 4.1 Opus': ChatMode.CLAUDE_4_1_OPUS,
        'Claude 4 Sonnet': ChatMode.CLAUDE_4_SONNET,
        'Claude Sonnet 4.5': ChatMode.CLAUDE_SONNET_4_5,
        'Claude 4 Opus': ChatMode.CLAUDE_4_OPUS,
        // OpenAI models
        'GPT-4o': ChatMode.GPT_4o,
        'GPT-4o Mini': ChatMode.GPT_4o_Mini,
        'GPT-4.1': ChatMode.GPT_4_1,
        'GPT-4.1 Mini': ChatMode.GPT_4_1_Mini,
        'GPT-4.1 Nano': ChatMode.GPT_4_1_Nano,
        'GPT-5': ChatMode.GPT_5,
        o3: ChatMode.O3,
        'o3 mini': ChatMode.O3_Mini,
        'o4 mini': ChatMode.O4_Mini,
        // xAI models
        'Grok 4': ChatMode.GROK_4,
        'Grok 3': ChatMode.GROK_3,
        'Grok 3 Mini': ChatMode.GROK_3_MINI,
        // Fireworks models
        'DeepSeek R1': ChatMode.DEEPSEEK_R1,
    };

    // For OpenRouter models with duplicate names, use model ID mapping
    const modelIdToChatModeMap: Record<string, ChatMode> = {
        'deepseek/deepseek-chat-v3-0324': ChatMode.DEEPSEEK_V3_0324,
        'deepseek/deepseek-r1': ChatMode.DEEPSEEK_R1,
        'claude-sonnet-4-5': ChatMode.CLAUDE_SONNET_4_5,
        'qwen/qwen3-235b-a22b': ChatMode.QWEN3_235B_A22B,
        'qwen/qwen3-32b': ChatMode.QWEN3_32B,
        'mistralai/mistral-nemo': ChatMode.MISTRAL_NEMO,
        'qwen/qwen3-14b': ChatMode.QWEN3_14B,
        'moonshot/kimi-k2': ChatMode.KIMI_K2,
        'openai/gpt-oss-120b': ChatMode.GPT_OSS_120B,
        'openai/gpt-oss-20b': ChatMode.GPT_OSS_20B,
    };

    // First try model name mapping
    const nameMapping = modelToChatModeMap[model.name];
    if (nameMapping) return nameMapping;

    // Then try model ID mapping for OpenRouter models
    const idMapping = modelIdToChatModeMap[model.id];
    if (idMapping) return idMapping;

    return null;
};

// Helper function to check if a model has reasoning capability
export const hasReasoningCapability = (chatMode: ChatMode): boolean => {
    const reasoningModels = [
        // OpenAI o-series models
        ChatMode.O3,
        ChatMode.O1,

        // DeepSeek reasoning models
        ChatMode.DEEPSEEK_R1,
        ChatMode.DEEPSEEK_R1,

        // Anthropic reasoning models
        ChatMode.CLAUDE_4_1_OPUS,
        ChatMode.CLAUDE_4_SONNET,
        ChatMode.CLAUDE_SONNET_4_5,
        ChatMode.CLAUDE_4_OPUS,

        // Gemini models with thinking support
        ChatMode.GEMINI_2_5_PRO,
        ChatMode.GEMINI_2_5_FLASH,
        ChatMode.GEMINI_2_5_FLASH_LITE,

        // xAI reasoning models
        ChatMode.GROK_4,
        ChatMode.GROK_3_MINI,
    ];
    return reasoningModels.includes(chatMode);
};

// Helper function to get API key required for each provider
export const getApiKeyForProvider = (provider: string): keyof ApiKeys => {
    const providerApiKeyMap: Record<string, keyof ApiKeys> = {
        google: 'GEMINI_API_KEY',
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
        fireworks: 'FIREWORKS_API_KEY',
        xai: 'XAI_API_KEY',
        openrouter: 'OPENROUTER_API_KEY',
    };

    return providerApiKeyMap[provider] || 'BYOK_API_KEY';
};

// Helper function to get provider icon
export const getProviderIcon = (provider: string, size = 16) => {
    const iconProps = { size, className: 'flex-shrink-0' };

    switch (provider.toLowerCase()) {
        case 'anthropic':
            return <Anthropic {...iconProps} />;
        case 'google':
            return <Gemini {...iconProps} />;
        case 'openai':
            return <OpenAI {...iconProps} />;
        case 'openrouter':
            return <OpenRouter {...iconProps} />;
        case 'fireworks':
            return <Fireworks {...iconProps} />;
        case 'xai':
            return <XAI {...iconProps} />;
        default:
            return null;
    }
};

// Helper function to generate model options from models array
export const generateModelOptionsForProvider = (provider: string, excludePreview = false) => {
    return models
        .filter((model) => model.provider === provider)
        .filter(
            (model) =>
                !(excludePreview && model.name && model.name.toLowerCase().includes('preview')),
        )
        .map((model) => {
            const chatMode = getChatModeFromModel(model);
            if (!chatMode) return null;

            // Special label handling for OpenRouter models to match current dropdown
            let label = model.name;
            if (provider === 'openrouter') {
                // Custom labels for OpenRouter models
                const customLabels: Record<string, string> = {
                    'deepseek/deepseek-chat-v3-0324': 'DeepSeek V3 0324',
                    'deepseek/deepseek-r1': 'DeepSeek R1',
                    'qwen/qwen3-235b-a22b': 'Qwen3 235B A22B',
                    'qwen/qwen3-32b': 'Qwen3 32B',
                    'mistralai/mistral-nemo': 'Mistral Nemo',
                    'qwen/qwen3-14b': 'Qwen3 14B',
                    'moonshot/kimi-k2': 'Kimi K2',
                    'openai/gpt-oss-120b': 'OpenAI gpt-oss-120b (via OpenRouter)',
                    'openai/gpt-oss-20b': 'OpenAI gpt-oss-20b (via OpenRouter)',
                };
                label = customLabels[model.id] || model.name;
            }

            return {
                label,
                value: chatMode,
                webSearch: true,
                icon: model.isFree
                    ? <Gift className='text-green-500' size={16} />
                    : hasReasoningCapability(chatMode)
                    ? <Brain className='text-purple-500' size={16} />
                    : undefined,
                ...(model.isFree ? {} : { requiredApiKey: getApiKeyForProvider(model.provider) }),
            };
        })
        .filter((option): option is NonNullable<typeof option> => option !== null); // Type-safe filter
};

// BYOK-only models - all models require API keys, grouped by provider
export const modelOptionsByProvider = {
    Anthropic: [
        {
            label: 'Anthropic Claude Sonnet 4.5',
            value: ChatMode.CLAUDE_SONNET_4_5,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4.1 Opus',
            value: ChatMode.CLAUDE_4_1_OPUS,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4 Sonnet',
            value: ChatMode.CLAUDE_4_SONNET,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4 Opus',
            value: ChatMode.CLAUDE_4_OPUS,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('anthropic', 14),
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
    ],

    Google: [
        {
            label: 'Gemini 2.5 Flash Lite',
            value: ChatMode.GEMINI_2_5_FLASH_LITE,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            description: 'Bring your own Gemini API key',
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 2.5 Flash',
            value: ChatMode.GEMINI_2_5_FLASH,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 2.5 Pro',
            value: ChatMode.GEMINI_2_5_PRO,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('google', 14),
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
    ],
    OpenAI: [
        {
            label: 'GPT 5',
            value: ChatMode.GPT_5,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4o Mini',
            value: ChatMode.GPT_4o_Mini,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1 Nano',
            value: ChatMode.GPT_4_1_Nano,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1 Mini',
            value: ChatMode.GPT_4_1_Mini,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1',
            value: ChatMode.GPT_4_1,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4o',
            value: ChatMode.GPT_4o,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o3',
            value: ChatMode.O3,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o3 mini',
            value: ChatMode.O3_Mini,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o4 mini',
            value: ChatMode.O4_Mini,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('openai', 14),
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
    ],

    OpenRouter: [
        {
            label: 'OpenAI gpt-oss-120b (via OpenRouter)',
            value: ChatMode.GPT_OSS_120B,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'OpenAI gpt-oss-20b (via OpenRouter)',
            value: ChatMode.GPT_OSS_20B,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Kimi K2',
            value: ChatMode.KIMI_K2,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'DeepSeek V3 0324',
            value: ChatMode.DEEPSEEK_V3_0324,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'DeepSeek R1',
            value: ChatMode.DEEPSEEK_R1,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 235B A22B',
            value: ChatMode.QWEN3_235B_A22B,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 32B',
            value: ChatMode.QWEN3_32B,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Mistral Nemo',
            value: ChatMode.MISTRAL_NEMO,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 14B',
            value: ChatMode.QWEN3_14B,
            webSearch: true,
            icon: <Gift className='text-green-500' size={16} />,
            providerIcon: getProviderIcon('openrouter', 14),
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
    ],
    Fireworks: [
        {
            label: 'DeepSeek R1 (Fireworks)',
            value: ChatMode.DEEPSEEK_R1_FIREWORKS,
            webSearch: true,
            icon: <Brain className='text-purple-500' size={16} />,
            providerIcon: getProviderIcon('fireworks', 14),
            requiredApiKey: 'FIREWORKS_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Kimi K2 Instruct (Fireworks)',
            value: ChatMode.KIMI_K2_INSTRUCT_FIREWORKS,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('fireworks', 14),
            requiredApiKey: 'FIREWORKS_API_KEY' as keyof ApiKeys,
        },
    ],
    xAI: [
        {
            label: 'Grok 4',
            value: ChatMode.GROK_4,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('xai', 14),
            requiredApiKey: 'XAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Grok 3',
            value: ChatMode.GROK_3,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('xai', 14),
            requiredApiKey: 'XAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Grok 3 Mini',
            value: ChatMode.GROK_3_MINI,
            webSearch: true,
            icon: undefined,
            providerIcon: getProviderIcon('xai', 14),
            requiredApiKey: 'XAI_API_KEY' as keyof ApiKeys,
        },
    ],
};

// Create modelOptions with the default chat mode first (Anthropic Claude Sonnet 4.5)
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
 * Returns an object describing which requirements are met and which are not.
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
    // Step 1: Check if auth is required and present
    const isAuthRequired = !!config.isAuthRequired;
    const hasAuth = !!context && !!context.user;

    // Step 2: Check plan requirement
    const requiredPlan = config.requiredPlan;
    const hasRequiredPlan = requiredPlan
        ? checkSubscriptionAccess(context || {}, { plan: requiredPlan })
        : true;

    // Step 3: Check feature requirement
    const requiredFeature = config.requiredFeature;
    const hasRequiredFeature = requiredFeature
        ? checkSubscriptionAccess(context || {}, { feature: requiredFeature })
        : true;

    // Step 4: Final access
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
