import { FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, SubscriptionContext } from '../utils/subscription';
import { logger } from '@repo/shared/logger';

export enum ChatMode {
    Pro = 'pro',
    Deep = 'deep',
    O3 = 'o3',
    O3_Mini = 'o3-mini',
    O4_Mini = 'o4-mini',
    O1_MINI = 'o1-mini',
    O1_PREVIEW = 'o1-preview',
    GPT_4_1 = 'gpt-4.1',
    GPT_4_1_Mini = 'gpt-4.1-mini',
    GPT_4_1_Nano = 'gpt-4.1-nano',
    GPT_4o = 'gpt-4o',
    GPT_4o_Mini = 'gpt-4o-mini',
    GEMINI_2_5_PRO = 'gemini-2.5-pro',
    GEMINI_2_5_FLASH = 'gemini-2.5-flash',
    GEMINI_2_5_FLASH_LITE = 'gemini-2.5-flash-lite-preview-06-17',
    GEMINI_2_5_FLASH_PREVIEW_05_20 = 'gemini-2.5-flash-preview-05-20',
    GEMINI_2_5_PRO_PREVIEW_05_06 = 'gemini-2.5-pro-preview-05-06',
    GEMINI_2_5_PRO_PREVIEW_06_05 = 'gemini-2.5-pro-preview-06-05',
    GEMINI_2_0_FLASH = 'gemini-2.0-flash',
    GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',
    CLAUDE_4_SONNET = 'claude-sonnet-4-20250514',
    CLAUDE_4_OPUS = 'claude-opus-4-20250514',
    CLAUDE_3_7_SONNET = 'claude-3-7-sonnet-20250219',
    DEEPSEEK_R1 = 'deepseek-r1-0528',
    DEEPSEEK_R1_MAIN = 'deepseek-r1',
    GROK_3 = 'grok-3',
    GROK_3_MINI = 'grok-3-mini',
    // OpenRouter models
    DEEPSEEK_V3_0324_FREE = 'deepseek-v3-0324-free',
    DEEPSEEK_V3_0324 = 'deepseek-v3-0324',
    DEEPSEEK_R1_FREE = 'deepseek-r1-free',
    DEEPSEEK_R1_0528_FREE = 'deepseek-r1-0528-free',
    QWEN3_235B_A22B = 'qwen3-235b-a22b',
    QWEN3_32B = 'qwen3-32b',
    MISTRAL_NEMO = 'mistral-nemo',
    QWEN3_14B_FREE = 'qwen3-14b-free',
}

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
        requiredPlan: PlanSlug.VT_PLUS,
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
    [ChatMode.O3]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.O3_Mini]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
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
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_4_SONNET]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_4_OPUS]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
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
    [ChatMode.GEMINI_2_0_FLASH]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_2_0_FLASH_LITE]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
    },
    [ChatMode.DEEPSEEK_R1]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GROK_3]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GROK_3_MINI]: {
        webSearch: true,
        imageUpload: true,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    // OpenRouter models
    [ChatMode.DEEPSEEK_V3_0324_FREE]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.DEEPSEEK_V3_0324]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.DEEPSEEK_R1_FREE]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    [ChatMode.DEEPSEEK_R1_0528_FREE]: {
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
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.QWEN3_32B]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.MISTRAL_NEMO]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.QWEN3_14B_FREE]: {
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
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.O1_PREVIEW]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_3_7_SONNET]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.DEEPSEEK_R1_MAIN]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
};

// Previously deprecated hasChatModeAccess function removed

/**
 * Get available chat modes for a user based on their subscription
 * Uses the new SubscriptionContext pattern for access control
 */
export function getAvailableChatModes(context: SubscriptionContext): ChatMode[] {
    if (!context) {
        logger.warn('getAvailableChatModes called without a valid context.');
        return Object.values(ChatMode).filter(mode => {
            const config = ChatModeConfig[mode];
            return !config.requiredFeature && !config.requiredPlan && !config.isAuthRequired;
        });
    }

    return Object.values(ChatMode).filter(mode => {
        const config = ChatModeConfig[mode];

        if (!config.requiredFeature && !config.requiredPlan) {
            return true;
        }

        if (config.requiredFeature) {
            return checkSubscriptionAccess(context, { feature: config.requiredFeature });
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
        logger.warn('getRestrictedChatModes called without a valid context.');
        return Object.values(ChatMode).filter(mode => {
            const config = ChatModeConfig[mode];
            return !!(config.requiredFeature || config.requiredPlan || config.isAuthRequired);
        });
    }
    return Object.values(ChatMode).filter(mode => {
        const config = ChatModeConfig[mode];

        if (!config.requiredFeature && !config.requiredPlan) {
            return false;
        }

        if (config.requiredFeature) {
            return !checkSubscriptionAccess(context, { feature: config.requiredFeature });
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
    return ChatModeConfig[mode]?.multiModal || false;
}

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Deep Research - Gemini 2.5 Pro';
        case ChatMode.Pro:
            return 'Pro Search - Gemini 2.5 Flash';
        case ChatMode.GPT_4_1:
            return 'OpenAI GPT 4.1';
        case ChatMode.GPT_4_1_Mini:
            return 'OpenAI GPT 4.1 Mini';
        case ChatMode.GPT_4_1_Nano:
            return 'OpenAI GPT 4.1 Nano';
        case ChatMode.GPT_4o_Mini:
            return 'OpenAI GPT 4o Mini';
        case ChatMode.GPT_4o:
            return 'OpenAI GPT 4o';
        case ChatMode.CLAUDE_4_SONNET:
            return 'Anthropic Claude 4 Sonnet';
        case ChatMode.CLAUDE_4_OPUS:
            return 'Anthropic Claude 4 Opus';
        case ChatMode.O3:
            return 'OpenAI o3';
        case ChatMode.O3_Mini:
            return 'OpenAI o3 mini';
        case ChatMode.O4_Mini:
            return 'OpenAI o4 mini';
        case ChatMode.DEEPSEEK_R1:
            return 'Fireworks DeepSeek R1';
        case ChatMode.GEMINI_2_0_FLASH:
            return 'Google Gemini 2.0 Flash';
        case ChatMode.GEMINI_2_0_FLASH_LITE:
            return 'Google Gemini 2.0 Flash Lite';
        case ChatMode.GEMINI_2_5_FLASH:
            return 'Google Gemini 2.5 Flash';
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return 'Google Gemini 2.5 Flash Lite Preview';
        case ChatMode.GEMINI_2_5_PRO:
            return 'Google Gemini 2.5 Pro';
        case ChatMode.GROK_3:
            return 'xAI Grok 3';
        case ChatMode.GROK_3_MINI:
            return 'xAI Grok 3 Mini';
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324_FREE:
            return 'OpenRouter DeepSeek V3 0324';
        case ChatMode.DEEPSEEK_V3_0324:
            return 'OpenRouter DeepSeek V3 0324 Pro';
        case ChatMode.DEEPSEEK_R1_FREE:
            return 'OpenRouter DeepSeek R1';
        case ChatMode.DEEPSEEK_R1_0528_FREE:
            return 'OpenRouter DeepSeek R1 0528';
        case ChatMode.QWEN3_235B_A22B:
            return 'OpenRouter Qwen3 235B A22B';
        case ChatMode.QWEN3_32B:
            return 'OpenRouter Qwen3 32B';
        case ChatMode.MISTRAL_NEMO:
            return 'OpenRouter Mistral Nemo';
        case ChatMode.QWEN3_14B_FREE:
            return 'OpenRouter Qwen3 14B';
        case ChatMode.O1_MINI:
            return 'OpenAI o1-mini';
        case ChatMode.O1_PREVIEW:
            return 'OpenAI o1-preview';
        case ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20:
            return 'Gemini 2.5 Flash Preview (05-20)';
        case ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06:
            return 'Gemini 2.5 Pro Preview (05-06)';
        case ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05:
            return 'Gemini 2.5 Pro Preview (06-05)';
        case ChatMode.CLAUDE_3_7_SONNET:
            return 'Claude 3.7 Sonnet';
        case ChatMode.DEEPSEEK_R1_MAIN:
            return 'DeepSeek R1';
    }
};
