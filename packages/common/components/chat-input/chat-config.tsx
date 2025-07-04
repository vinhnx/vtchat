import { type Model, models } from '@repo/ai/models';
import type { ApiKeys } from '@repo/common/store/api-keys.store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import type { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { checkSubscriptionAccess, type SubscriptionContext } from '@repo/shared/utils/subscription';
import { Brain, Gift } from 'lucide-react';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        iconName: 'Atom',
    },
    {
        label: 'Pro Search',
        description: 'Enhanced web search with Gemini grounding',
        value: ChatMode.Pro,
        iconName: 'Star',
    },
];

// Helper function to get ChatMode from Model
export const getChatModeFromModel = (model: Model): ChatMode | null => {
    // Map model names to ChatMode values - using exact names from models.ts
    const modelToChatModeMap: Record<string, ChatMode> = {
        // Google models
        'Gemini 2.0 Flash Lite': ChatMode.GEMINI_2_0_FLASH_LITE,
        'Gemini 2.5 Flash': ChatMode.GEMINI_2_5_FLASH,
        'Gemini 2.5 Flash Lite': ChatMode.GEMINI_2_5_FLASH_LITE,
        'Gemini 2.5 Pro': ChatMode.GEMINI_2_5_PRO,
        'Gemini 2.0 Flash': ChatMode.GEMINI_2_0_FLASH,
        // Anthropic models
        'Claude 4 Sonnet': ChatMode.CLAUDE_4_SONNET,
        'Claude 4 Opus': ChatMode.CLAUDE_4_OPUS,
        // OpenAI models
        'GPT-4o': ChatMode.GPT_4o,
        'GPT-4o Mini': ChatMode.GPT_4o_Mini,
        'GPT-4.1': ChatMode.GPT_4_1,
        'GPT-4.1 Mini': ChatMode.GPT_4_1_Mini,
        'GPT-4.1 Nano': ChatMode.GPT_4_1_Nano,
        o3: ChatMode.O3,
        'o3 mini': ChatMode.O3_Mini,
        'o4 mini': ChatMode.O4_Mini,
        // xAI models
        'Grok 3': ChatMode.GROK_3,
        'Grok 3 Mini': ChatMode.GROK_3_MINI,
        // Fireworks models
        'DeepSeek R1': ChatMode.DEEPSEEK_R1,
    };

    // For OpenRouter models with duplicate names, use model ID mapping
    const modelIdToChatModeMap: Record<string, ChatMode> = {
        'deepseek/deepseek-chat-v3-0324:free': ChatMode.DEEPSEEK_V3_0324_FREE,
        'deepseek/deepseek-chat-v3-0324': ChatMode.DEEPSEEK_V3_0324,
        'deepseek/deepseek-r1:free': ChatMode.DEEPSEEK_R1_FREE,
        'deepseek/deepseek-r1-0528:free': ChatMode.DEEPSEEK_R1_0528_FREE,
        'qwen/qwen3-235b-a22b': ChatMode.QWEN3_235B_A22B,
        'qwen/qwen3-32b': ChatMode.QWEN3_32B,
        'mistralai/mistral-nemo': ChatMode.MISTRAL_NEMO,
        'qwen/qwen3-14b:free': ChatMode.QWEN3_14B_FREE,
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
        ChatMode.O3_Mini,
        ChatMode.O4_Mini,
        ChatMode.O1_MINI,
        ChatMode.O1_PREVIEW,
        // DeepSeek reasoning models
        ChatMode.DEEPSEEK_R1,
        ChatMode.DEEPSEEK_R1_MAIN,
        ChatMode.DEEPSEEK_R1_FREE,
        ChatMode.DEEPSEEK_R1_0528_FREE,
        // Anthropic reasoning models
        ChatMode.CLAUDE_4_SONNET,
        ChatMode.CLAUDE_4_OPUS,
        ChatMode.CLAUDE_3_7_SONNET,
        // Gemini models with thinking support
        ChatMode.GEMINI_2_5_PRO,
        ChatMode.GEMINI_2_5_FLASH,
        ChatMode.GEMINI_2_5_FLASH_LITE,
        ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20,
        ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06,
        ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05,
        // xAI reasoning models
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

// Helper function to generate model options from models array
export const generateModelOptionsForProvider = (provider: string, excludePreview = false) => {
    return models
        .filter((model) => model.provider === provider)
        .filter((model) => !(excludePreview && model.name.toLowerCase().includes('preview')))
        .map((model) => {
            const chatMode = getChatModeFromModel(model);
            if (!chatMode) return null;

            // Special label handling for OpenRouter models to match current dropdown
            let label = model.name;
            if (provider === 'openrouter') {
                // Custom labels for OpenRouter models
                const customLabels: Record<string, string> = {
                    'deepseek/deepseek-chat-v3-0324:free': 'DeepSeek V3 0324',
                    'deepseek/deepseek-chat-v3-0324': 'DeepSeek V3 0324 Pro',
                    'deepseek/deepseek-r1:free': 'DeepSeek R1',
                    'deepseek/deepseek-r1-0528:free': 'DeepSeek R1 0528',
                    'qwen/qwen3-235b-a22b': 'Qwen3 235B A22B',
                    'qwen/qwen3-32b': 'Qwen3 32B',
                    'mistralai/mistral-nemo': 'Mistral Nemo',
                    'qwen/qwen3-14b:free': 'Qwen3 14B',
                };
                label = customLabels[model.id] || model.name;
            }

            return {
                label,
                value: chatMode,
                webSearch: true,
                icon: model.isFree ? (
                    <Gift className="text-green-500" size={16} />
                ) : hasReasoningCapability(chatMode) ? (
                    <Brain className="text-purple-500" size={16} />
                ) : undefined,
                ...(model.isFree ? {} : { requiredApiKey: getApiKeyForProvider(model.provider) }),
            };
        })
        .filter((option): option is NonNullable<typeof option> => option !== null); // Type-safe filter
};

// BYOK-only models - all models require API keys, grouped by provider
export const modelOptionsByProvider = {
    OpenAI: [
        {
            label: 'GPT 4o Mini',
            value: ChatMode.GPT_4o_Mini,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1 Nano',
            value: ChatMode.GPT_4_1_Nano,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1 Mini',
            value: ChatMode.GPT_4_1_Mini,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4.1',
            value: ChatMode.GPT_4_1,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'GPT 4o',
            value: ChatMode.GPT_4o,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o3',
            value: ChatMode.O3,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o3 mini',
            value: ChatMode.O3_Mini,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'o4 mini',
            value: ChatMode.O4_Mini,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'OPENAI_API_KEY' as keyof ApiKeys,
        },
    ],
    Google: [
        {
            label: 'Gemini 2.5 Flash Lite Preview',
            value: ChatMode.GEMINI_2_5_FLASH_LITE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            description: 'Free model • 10 requests/day per account • 1 request/minute',
            isFreeModel: true,
        },
        {
            label: 'Gemini 2.0 Flash',
            value: ChatMode.GEMINI_2_0_FLASH,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 2.0 Flash Lite',
            value: ChatMode.GEMINI_2_0_FLASH_LITE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 2.5 Flash',
            value: ChatMode.GEMINI_2_5_FLASH,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Gemini 2.5 Pro',
            value: ChatMode.GEMINI_2_5_PRO,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'GEMINI_API_KEY' as keyof ApiKeys,
        },
    ],
    Anthropic: [
        {
            label: 'Claude 4 Sonnet',
            value: ChatMode.CLAUDE_4_SONNET,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Claude 4 Opus',
            value: ChatMode.CLAUDE_4_OPUS,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
        },
    ],
    Fireworks: [
        {
            label: 'DeepSeek R1',
            value: ChatMode.DEEPSEEK_R1,
            webSearch: true,
            icon: <Brain className="text-purple-500" size={16} />,
            requiredApiKey: 'FIREWORKS_API_KEY' as keyof ApiKeys,
        },
    ],
    xAI: [
        {
            label: 'Grok 3',
            value: ChatMode.GROK_3,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'XAI_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Grok 3 Mini',
            value: ChatMode.GROK_3_MINI,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'XAI_API_KEY' as keyof ApiKeys,
        },
    ],
    OpenRouter: [
        {
            label: 'DeepSeek V3 0324',
            value: ChatMode.DEEPSEEK_V3_0324_FREE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'DeepSeek V3 0324 Pro',
            value: ChatMode.DEEPSEEK_V3_0324,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'DeepSeek R1',
            value: ChatMode.DEEPSEEK_R1_FREE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'DeepSeek R1 0528',
            value: ChatMode.DEEPSEEK_R1_0528_FREE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 235B A22B',
            value: ChatMode.QWEN3_235B_A22B,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 32B',
            value: ChatMode.QWEN3_32B,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Mistral Nemo',
            value: ChatMode.MISTRAL_NEMO,
            webSearch: true,
            icon: undefined,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
        {
            label: 'Qwen3 14B',
            value: ChatMode.QWEN3_14B_FREE,
            webSearch: true,
            icon: <Gift className="text-green-500" size={16} />,
            requiredApiKey: 'OPENROUTER_API_KEY' as keyof ApiKeys,
        },
    ],
};

// Create modelOptions with Gemini 2.5 Flash Lite as the first option
const allModelOptions = Object.values(modelOptionsByProvider).flat();
const geminiFlashLiteOption = allModelOptions.find(
    (option) => option.value === ChatMode.GEMINI_2_5_FLASH_LITE
);
const otherOptions = allModelOptions.filter(
    (option) => option.value !== ChatMode.GEMINI_2_5_FLASH_LITE
);

export const modelOptions = geminiFlashLiteOption
    ? [geminiFlashLiteOption, ...otherOptions]
    : allModelOptions;

/**
 * Step-by-step access check for a chat mode.
 * Returns an object describing which requirements are met and which are not.
 */
export function checkChatModeAccess(
    context: SubscriptionContext | null,
    mode: ChatMode
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
