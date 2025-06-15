import { FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, SubscriptionContext } from '../utils/subscription';

export enum ChatMode {
    Pro = 'pro',
    Deep = 'deep',
    O4_Mini = 'o4-mini',
    GPT_4_1 = 'gpt-4.1',
    GPT_4_1_Mini = 'gpt-4.1-mini',
    GPT_4_1_Nano = 'gpt-4.1-nano',
    GPT_4o = 'gpt-4o',
    GPT_4o_Mini = 'gpt-4o-mini',
    GEMINI_2_0_FLASH = 'gemini-2.0-flash',
    GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',
    GEMINI_2_5_FLASH_PREVIEW = 'gemini-2.5-flash-preview-05-20',
    GEMINI_2_5_PRO = 'gemini-flash-2.5-pro-preview-05-06',
    GEMINI_2_5_PRO_PREVIEW = 'gemini-2.5-pro-preview-06-05',
    CLAUDE_4_SONNET = 'claude-sonnet-4-20250514',
    CLAUDE_4_OPUS = 'claude-opus-4-20250514',
    DEEPSEEK_R1 = 'deepseek-r1-0528',
}

export const ChatModeConfig: Record<
    ChatMode,
    {
        webSearch: boolean;
        imageUpload: boolean;
        retry: boolean;
        isNew?: boolean;
        isAuthRequired?: boolean;
        // Subscription requirements
        requiredFeature?: FeatureSlug;
        requiredPlan?: PlanSlug;
    }
> = {
    [ChatMode.Deep]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.DEEP_RESEARCH,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.Pro]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.PRO_SEARCH,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GPT_4_1]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GPT_4_1_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1_Nano]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: false,
    },
    [ChatMode.O4_Mini]: {
        webSearch: true,
        imageUpload: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4o_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
    },
    [ChatMode.GPT_4o]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_4_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_4_OPUS]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_0_FLASH]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
    },
    [ChatMode.GEMINI_2_0_FLASH_LITE]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
    },
    [ChatMode.GEMINI_2_5_FLASH_PREVIEW]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_5_PRO]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_5_PRO_PREVIEW]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.DEEPSEEK_R1]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.ADVANCED_CHAT_MODES,
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
        console.warn('getAvailableChatModes called without a valid context.');
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
        console.warn('getRestrictedChatModes called without a valid context.');
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

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Grounding Web Search';
        case ChatMode.Pro:
            return 'Grounding Web Search';
        case ChatMode.GPT_4_1:
            return 'GPT 4.1';
        case ChatMode.GPT_4_1_Mini:
            return 'GPT 4.1 Mini';
        case ChatMode.GPT_4_1_Nano:
            return 'GPT 4.1 Nano';
        case ChatMode.GPT_4o_Mini:
            return 'GPT 4o Mini';
        case ChatMode.GPT_4o:
            return 'GPT 4o';
        case ChatMode.CLAUDE_4_SONNET:
            return 'Claude 4 Sonnet';
        case ChatMode.CLAUDE_4_OPUS:
            return 'Claude 4 Opus';
        case ChatMode.O4_Mini:
            return 'o4 mini';
        case ChatMode.DEEPSEEK_R1:
            return 'DeepSeek R1';
        case ChatMode.GEMINI_2_0_FLASH:
            return 'Gemini 2.0 Flash';
        case ChatMode.GEMINI_2_0_FLASH_LITE:
            return 'Gemini 2.0 Flash Lite';
        case ChatMode.GEMINI_2_5_FLASH_PREVIEW:
            return 'Gemini 2.5 Flash Preview';
        case ChatMode.GEMINI_2_5_PRO:
            return 'Gemini 2.5 Pro';
        case ChatMode.GEMINI_2_5_PRO_PREVIEW:
            return 'Gemini 2.5 Pro Preview';
    }
};
