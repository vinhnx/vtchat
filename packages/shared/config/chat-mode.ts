import { FeatureSlug, PlanSlug } from '../types/subscription';

export const ChatMode = {
    // AI Agent modes
    Pro: 'pro',
    Deep: 'deep',
    // OpenAI GPT models (latest)
    GPT_5_4: 'gpt-5.4',
    GPT_5_4_PRO: 'gpt-5.4-pro',
    GPT_5_4_MINI: 'gpt-5.4-mini',
    GPT_5_4_NANO: 'gpt-5.4-nano',
    // Gemini models (latest)
    GEMINI_3_1_PRO: 'gemini-3.1-pro-preview',
    GEMINI_3_FLASH: 'gemini-3-flash-preview',
    GEMINI_3_1_FLASH_LITE: 'gemini-3.1-flash-lite-preview',
    // Claude models (latest)
    CLAUDE_4_6_OPUS: 'claude-opus-4-6',
    CLAUDE_4_6_SONNET: 'claude-sonnet-4-6',
    CLAUDE_4_5_HAIKU: 'claude-haiku-4-5',
} as const;

export type ChatMode = (typeof ChatMode)[keyof typeof ChatMode];

export const DEFAULT_CHAT_MODE: ChatMode = ChatMode.CLAUDE_4_6_SONNET;

export const ChatModeConfig: Record<
    ChatMode,
    {
        webSearch: boolean;
        imageUpload: boolean;
        multiModal: boolean;
        retry: boolean;
        isNew?: boolean;
        isAuthRequired?: boolean;
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
    [ChatMode.GPT_5_4]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_5_4_PRO]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_5_4_MINI]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_5_4_NANO]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_3_1_PRO]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_3_FLASH]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GEMINI_3_1_FLASH_LITE]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_6_OPUS]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_6_SONNET]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_4_5_HAIKU]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
};
