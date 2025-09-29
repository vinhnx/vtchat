import { log } from '@repo/shared/logger';
import { FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, type SubscriptionContext } from '../utils/subscription';

export const ChatMode = {
    Pro: 'pro',
    Deep: 'deep',
    O3: 'o3',
    O3_Mini: 'o3-mini',
    O4_Mini: 'o4-mini',
    O1_MINI: 'o1-mini',
    O1: 'o1',
    GPT_4_1: 'gpt-4.1',
    GPT_4_1_Mini: 'gpt-4.1-mini',
    GPT_4_1_Nano: 'gpt-4.1-nano',
    GPT_5: 'gpt-5-2025-08-07',
    GPT_4o: 'gpt-4o',
    GPT_4o_Mini: 'gpt-4o-mini',
    GEMINI_2_5_PRO: 'gemini-2.5-pro',
    GEMINI_2_5_FLASH: 'gemini-flash-latest',
    GEMINI_2_5_FLASH_LITE: 'gemini-flash-lite-latest',

    CLAUDE_4_1_OPUS: 'claude-opus-4-1-20250805',
    CLAUDE_4_SONNET: 'claude-sonnet-4-20250514',
    CLAUDE_SONNET_4_5: 'claude-sonnet-4-5',
    CLAUDE_4_OPUS: 'claude-opus-4-20250514',
    DEEPSEEK_R1_FIREWORKS: 'deepseek-r1-fireworks',
    KIMI_K2_INSTRUCT_FIREWORKS: 'kimi-k2-instruct-fireworks',
    GROK_3: 'grok-3',
    GROK_3_MINI: 'grok-3-mini',
    GROK_4: 'grok-4',
    // OpenRouter models
    DEEPSEEK_V3_0324: 'deepseek-v3-0324',
    DEEPSEEK_R1: 'deepseek-r1',
    QWEN3_235B_A22B: 'qwen3-235b-a22b',
    QWEN3_32B: 'qwen3-32b',
    MISTRAL_NEMO: 'mistral-nemo',
    QWEN3_14B: 'qwen3-14b',
    KIMI_K2: 'kimi-k2',
    GPT_OSS_120B: 'gpt-oss-120b',
    GPT_OSS_20B: 'gpt-oss-20b',
} as const;

export type ChatMode = (typeof ChatMode)[keyof typeof ChatMode];

export const ChatModeConfig: Record<
    ChatMode,
    {
        webSearch: boolean;
        imageUpload: boolean;
        multiModal: boolean;
        retry: boolean;
        isNew?: boolean;
        isAuthRequired?: boolean;
        // Subscription requirements
        requiredFeature?: FeatureSlug;
        requiredPlan?: PlanSlug;
    }
> = {
    [ChatMode.Deep]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: false,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.DEEP_RESEARCH,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.Pro]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: false,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.PRO_SEARCH,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GPT_4_1]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1_Mini]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1_Nano]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_5]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.O3]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.O3_Mini]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.O4_Mini]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4o_Mini]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4o]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_1_OPUS]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_SONNET]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_SONNET_4_5]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_OPUS]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_2_5_PRO]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_2_5_FLASH]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_2_5_FLASH_LITE]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.DEEPSEEK_R1]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.GROK_3]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.GROK_3_MINI]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.GROK_4]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    // OpenRouter models

    [ChatMode.DEEPSEEK_V3_0324]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },

    [ChatMode.QWEN3_235B_A22B]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.QWEN3_32B]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.MISTRAL_NEMO]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.QWEN3_14B]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    }, // Fireworks models
    [ChatMode.DEEPSEEK_R1_FIREWORKS]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.KIMI_K2_INSTRUCT_FIREWORKS]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.O1_MINI]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.O1]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.KIMI_K2]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.GPT_OSS_120B]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.GPT_OSS_20B]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
};

// Previously deprecated hasChatModeAccess function removed

/**
 * Get available chat modes for a user based on their subscription
 * Uses the new SubscriptionContext pattern for access control
 */
export function getAvailableChatModes(context: SubscriptionContext): ChatMode[] {
    if (!context) {
        log.warn('getAvailableChatModes called without a valid context.');
        return Object.values(ChatMode).filter((mode) => {
            const config = ChatModeConfig[mode];
            return !(config.requiredFeature || config.requiredPlan || config.isAuthRequired);
        });
    }

    return Object.values(ChatMode).filter((mode) => {
        const config = ChatModeConfig[mode];

        if (!(config.requiredFeature || config.requiredPlan)) {
            return true;
        }

        if (config.requiredFeature) {
            return checkSubscriptionAccess(context, {
                feature: config.requiredFeature,
            });
        }

        if (config.requiredPlan) {
            return checkSubscriptionAccess(context, { plan: config.requiredPlan });
        }

        return false;
    });
}

/**
 * Get restricted chat modes that require upgrade
 * Uses the new SubscriptionContext pattern for access control
 */
export function getRestrictedChatModes(context: SubscriptionContext): ChatMode[] {
    if (!context) {
        log.warn('getRestrictedChatModes called without a valid context.');
        return Object.values(ChatMode).filter((mode) => {
            const config = ChatModeConfig[mode];
            return !!(config.requiredFeature || config.requiredPlan || config.isAuthRequired);
        });
    }
    return Object.values(ChatMode).filter((mode) => {
        const config = ChatModeConfig[mode];

        if (!(config.requiredFeature || config.requiredPlan)) {
            return false;
        }

        if (config.requiredFeature) {
            return !checkSubscriptionAccess(context, {
                feature: config.requiredFeature,
            });
        }

        if (config.requiredPlan) {
            return !checkSubscriptionAccess(context, { plan: config.requiredPlan });
        }

        return false;
    });
}

/**
 * Get upgrade requirements for a specific chat mode
 */
export function getChatModeUpgradeRequirements(mode: ChatMode): {
    requiredFeature?: FeatureSlug;
    requiredPlan?: PlanSlug;
} {
    const config = ChatModeConfig[mode];
    return {
        requiredFeature: config.requiredFeature,
        requiredPlan: config.requiredPlan,
    };
}

/**
 * Check if a chat mode supports multi-modal features (images/PDFs)
 */
export function supportsMultiModal(mode: ChatMode): boolean {
    return ChatModeConfig[mode]?.multiModal;
}

/**
 * Get unified display name for AI model
 * Uses the centralized getChatModeName function for consistency
 *
 * @param mode - ChatMode string
 * @returns Display name for the model
 */
export function getModelDisplayName(mode: string): string {
    // Use the centralized getChatModeName function
    const displayName = getChatModeName(mode as ChatMode);

    // Fallback for unknown modes
    return displayName || 'VT Assistant';
}

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Deep Research - Gemini 2.5 Flash';
        case ChatMode.Pro:
            return 'Pro Search - Gemini 2.5 Flash';
        case ChatMode.GPT_4_1:
            return 'OpenAI GPT 4.1';
        case ChatMode.GPT_4_1_Mini:
            return 'OpenAI GPT 4.1 Mini';
        case ChatMode.GPT_4_1_Nano:
            return 'OpenAI GPT 4.1 Nano';
        case ChatMode.GPT_5:
            return 'OpenAI GPT-5';
        case ChatMode.GPT_4o_Mini:
            return 'OpenAI GPT 4o Mini';
        case ChatMode.GPT_4o:
            return 'OpenAI GPT 4o';
        case ChatMode.CLAUDE_4_1_OPUS:
            return 'Anthropic Claude 4.1 Opus';
        case ChatMode.CLAUDE_4_SONNET:
            return 'Anthropic Claude 4 Sonnet';
        case ChatMode.CLAUDE_SONNET_4_5:
            return 'Anthropic Claude Sonnet 4.5';
        case ChatMode.CLAUDE_4_OPUS:
            return 'Anthropic Claude 4 Opus';
        case ChatMode.O3:
            return 'OpenAI o3';
        case ChatMode.O3_Mini:
            return 'OpenAI o3 mini';
        case ChatMode.O4_Mini:
            return 'OpenAI o4 mini';
        case ChatMode.GEMINI_2_5_PRO:
            return 'Google Gemini 2.5 Pro';
        case ChatMode.GEMINI_2_5_FLASH:
            return 'Google Gemini 2.5 Flash';
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return 'Google Gemini 2.5 Flash Lite';
        case ChatMode.GROK_3:
            return 'xAI Grok 3';
        case ChatMode.GROK_3_MINI:
            return 'xAI Grok 3 Mini';
        case ChatMode.GROK_4:
            return 'xAI Grok 4';
        // OpenRouter models
        case ChatMode.GPT_OSS_120B:
            return 'OpenAI gpt-oss-120b (via OpenRouter)';
        case ChatMode.GPT_OSS_20B:
            return 'OpenAI gpt-oss-20b (via OpenRouter)';
        case ChatMode.DEEPSEEK_V3_0324:
            return 'OpenRouter DeepSeek V3 0324';
        case ChatMode.DEEPSEEK_R1:
            return 'OpenRouter DeepSeek R1';
        case ChatMode.QWEN3_235B_A22B:
            return 'OpenRouter Qwen3 235B A22B';
        case ChatMode.QWEN3_32B:
            return 'OpenRouter Qwen3 32B';
        case ChatMode.MISTRAL_NEMO:
            return 'OpenRouter Mistral Nemo';
        case ChatMode.QWEN3_14B:
            return 'OpenRouter Qwen3 14B';
        // Fireworks models
        case ChatMode.DEEPSEEK_R1_FIREWORKS:
            return 'Fireworks DeepSeek R1';
        case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
            return 'Fireworks Kimi K2 Instruct';
        case ChatMode.O1_MINI:
            return 'OpenAI o1-mini';
        case ChatMode.O1:
            return 'OpenAI o1';
        case ChatMode.KIMI_K2:
            return 'OpenRouter Kimi K2';
    }
};
