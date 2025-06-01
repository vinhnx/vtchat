import { FeatureSlug, PlanSlug } from '../types/subscription';
import { checkSubscriptionAccess, type ClerkHasMethod } from '../utils/subscription';
// Removed import of deprecated hasAccess
// For client-side, you'd pass useAuth() or a similar object.
// For server-side, you'd pass the auth() object.
type HasMethod = ClerkHasMethod;
interface AuthLike {
    has: HasMethod;
}

export enum ChatMode {
    Pro = 'pro',
    Deep = 'deep',
    GEMINI_2_0_FLASH = 'gemini-flash-2.0',
    GEMINI_2_5_PRO = 'gemini-flash-2.5-pro-preview-05-06',
    CLAUDE_4_SONNET = 'claude-sonnet-4-20250514',
    CLAUDE_4_OPUS = 'claude-opus-4-20250514',
    DEEPSEEK_R1 = 'deepseek-r1-0528',
    O4_Mini = 'o4-mini',
    GPT_4_1 = 'gpt-4.1',
    GPT_4_1_Mini = 'gpt-4.1-mini',
    GPT_4_1_Nano = 'gpt-4.1-nano',
    GPT_4o = 'gpt-4o',
    GPT_4o_Mini = 'gpt-4o-mini',
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
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.GPT_4_1_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.GPT_4_1_Nano]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: false,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.O4_Mini]: {
        webSearch: true,
        imageUpload: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.GPT_4o_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.GPT_4o]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.CLAUDE_4_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.BASE_MODELS,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.CLAUDE_4_OPUS]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.BASE_MODELS,
        requiredPlan: PlanSlug.VT_PLUS,
    },
    [ChatMode.GEMINI_2_0_FLASH]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: false,
        requiredFeature: FeatureSlug.BASE_MODELS,
    },
    [ChatMode.GEMINI_2_5_PRO]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isAuthRequired: true,
        requiredFeature: FeatureSlug.BASE_MODELS,
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

export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    [ChatMode.Pro]: 5,
    [ChatMode.DEEPSEEK_R1]: 5,
    [ChatMode.CLAUDE_4_SONNET]: 5,
    [ChatMode.CLAUDE_4_OPUS]: 8,
    [ChatMode.GPT_4o]: 3,
    [ChatMode.GPT_4o_Mini]: 1,
    [ChatMode.GPT_4_1]: 5,
    [ChatMode.GPT_4_1_Mini]: 2,
    [ChatMode.GPT_4_1_Nano]: 1,
    [ChatMode.O4_Mini]: 5,
    [ChatMode.GEMINI_2_0_FLASH]: 1,
    [ChatMode.GEMINI_2_5_PRO]: 8,
};

// Previously deprecated hasChatModeAccess function removed

/**
 * Get available chat modes for a user based on their subscription
 * Uses the new Clerk has() pattern for access control
 */
export function getAvailableChatModes(authObject: AuthLike): ChatMode[] {
    if (!authObject || typeof authObject.has !== 'function') {
        console.warn('getAvailableChatModes called without a valid authObject.has method.');
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
            return checkSubscriptionAccess(authObject.has, { feature: config.requiredFeature });
        }

        if (config.requiredPlan) {
            return checkSubscriptionAccess(authObject.has, { plan: config.requiredPlan });
        }

        return false;
    });
}

/**
 * Get restricted chat modes that require upgrade
 * Uses the new Clerk has() pattern for access control
 */
export function getRestrictedChatModes(authObject: AuthLike): ChatMode[] {
    if (!authObject || typeof authObject.has !== 'function') {
        console.warn('getRestrictedChatModes called without a valid authObject.has method.');
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
            return !checkSubscriptionAccess(authObject.has, { feature: config.requiredFeature });
        }

        if (config.requiredPlan) {
            return !checkSubscriptionAccess(authObject.has, { plan: config.requiredPlan });
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
            return 'Deep Research';
        case ChatMode.Pro:
            return 'Pro Search';
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
        case ChatMode.GEMINI_2_5_PRO:
            return 'Gemini 2.5 Pro';
    }
};
