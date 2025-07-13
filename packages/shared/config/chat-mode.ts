import { log } from "@repo/shared/logger";
import { FeatureSlug, PlanSlug } from "../types/subscription";
import { checkSubscriptionAccess, type SubscriptionContext } from "../utils/subscription";

export const ChatMode = {
    Pro: "pro",
    Deep: "deep",
    O3: "o3",
    O3_Mini: "o3-mini",
    O4_Mini: "o4-mini",
    O1_MINI: "o1-mini",
    O1: "o1",
    GPT_4_1: "gpt-4.1",
    GPT_4_1_Mini: "gpt-4.1-mini",
    GPT_4_1_Nano: "gpt-4.1-nano",
    GPT_4o: "gpt-4o",
    GPT_4o_Mini: "gpt-4o-mini",
    GEMINI_2_5_PRO: "gemini-2.5-pro",
    GEMINI_2_5_FLASH: "gemini-2.5-flash",
    GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite-preview-06-17",

    CLAUDE_4_SONNET: "claude-sonnet-4-20250514",
    CLAUDE_4_OPUS: "claude-opus-4-20250514",
    DEEPSEEK_R1_FIREWORKS: "deepseek-r1-fireworks",
    GROK_3: "grok-3",
    GROK_3_MINI: "grok-3-mini",
    GROK_4: "grok-4",
    // OpenRouter models
    DEEPSEEK_V3_0324: "deepseek-v3-0324",
    DEEPSEEK_R1: "deepseek-r1",
    QWEN3_235B_A22B: "qwen3-235b-a22b",
    QWEN3_32B: "qwen3-32b",
    MISTRAL_NEMO: "mistral-nemo",
    QWEN3_14B: "qwen3-14b",
    KIMI_K2: "kimi-k2",
    // LM Studio local models
    LMSTUDIO_LLAMA_3_8B: "lmstudio-llama-3-8b",
    LMSTUDIO_QWEN_7B: "lmstudio-qwen-7b",
    LMSTUDIO_GEMMA_7B: "lmstudio-gemma-7b",
    LMSTUDIO_GEMMA_3_1B: "lmstudio-gemma-3-1b",
    // Ollama local models
    OLLAMA_LLAMA_3_3: "ollama-llama-3.3",
    OLLAMA_LLAMA_3_2: "ollama-llama-3.2",
    OLLAMA_LLAMA_3_1: "ollama-llama-3.1",
    OLLAMA_QWEN_3: "ollama-qwen-3",
    OLLAMA_QWEN_2_5: "ollama-qwen-2.5",
    OLLAMA_GEMMA_3: "ollama-gemma-3",
    OLLAMA_GEMMA_3N: "ollama-gemma-3n",
    OLLAMA_GEMMA_2: "ollama-gemma-2",
    OLLAMA_DEEPSEEK_R1: "ollama-deepseek-r1",
    OLLAMA_MISTRAL: "ollama-mistral",
    OLLAMA_CODELLAMA: "ollama-codellama",
    OLLAMA_LLAVA: "ollama-llava",
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
    [ChatMode.CLAUDE_4_SONNET]: {
        webSearch: true,
        imageUpload: true,
        multiModal: true,
        retry: true,
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
    [ChatMode.DEEPSEEK_R1]: {
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
    },
    [ChatMode.KIMI_K2]: {
        webSearch: true,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: true,
        isNew: true,
    },
    // LM Studio local models - no auth required, free local models
    [ChatMode.LMSTUDIO_LLAMA_3_8B]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.LMSTUDIO_QWEN_7B]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.LMSTUDIO_GEMMA_7B]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.LMSTUDIO_GEMMA_3_1B]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    // Ollama local models - no auth required, free local models
    [ChatMode.OLLAMA_LLAMA_3_3]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_LLAMA_3_2]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_LLAMA_3_1]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_QWEN_3]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_QWEN_2_5]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_GEMMA_3]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_GEMMA_3N]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_GEMMA_2]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_DEEPSEEK_R1]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_MISTRAL]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_CODELLAMA]: {
        webSearch: false,
        imageUpload: false,
        multiModal: false,
        retry: true,
        isAuthRequired: false,
        isNew: true,
    },
    [ChatMode.OLLAMA_LLAVA]: {
        webSearch: false,
        imageUpload: true,
        multiModal: true,
        retry: true,
        isAuthRequired: false,
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
};

// Previously deprecated hasChatModeAccess function removed

/**
 * Get available chat modes for a user based on their subscription
 * Uses the new SubscriptionContext pattern for access control
 */
export function getAvailableChatModes(context: SubscriptionContext): ChatMode[] {
    if (!context) {
        log.warn("getAvailableChatModes called without a valid context.");
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
        log.warn("getRestrictedChatModes called without a valid context.");
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

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return "Deep Research - Gemini 2.5 Pro";
        case ChatMode.Pro:
            return "Pro Search - Gemini 2.5 Flash";
        case ChatMode.GPT_4_1:
            return "OpenAI GPT 4.1";
        case ChatMode.GPT_4_1_Mini:
            return "OpenAI GPT 4.1 Mini";
        case ChatMode.GPT_4_1_Nano:
            return "OpenAI GPT 4.1 Nano";
        case ChatMode.GPT_4o_Mini:
            return "OpenAI GPT 4o Mini";
        case ChatMode.GPT_4o:
            return "OpenAI GPT 4o";
        case ChatMode.CLAUDE_4_SONNET:
            return "Anthropic Claude 4 Sonnet";
        case ChatMode.CLAUDE_4_OPUS:
            return "Anthropic Claude 4 Opus";
        case ChatMode.O3:
            return "OpenAI o3";
        case ChatMode.O3_Mini:
            return "OpenAI o3 mini";
        case ChatMode.O4_Mini:
            return "OpenAI o4 mini";
        case ChatMode.GEMINI_2_5_PRO:
            return "Google Gemini 2.5 Pro";
        case ChatMode.GEMINI_2_5_FLASH:
            return "Google Gemini 2.5 Flash";
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return "Google Gemini 2.5 Flash Lite Preview";
        case ChatMode.GROK_3:
            return "xAI Grok 3";
        case ChatMode.GROK_3_MINI:
            return "xAI Grok 3 Mini";
        case ChatMode.GROK_4:
            return "xAI Grok 4";
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324:
            return "OpenRouter DeepSeek V3 0324 Pro";
        case ChatMode.DEEPSEEK_R1:
            return "OpenRouter DeepSeek R1";
        case ChatMode.QWEN3_235B_A22B:
            return "OpenRouter Qwen3 235B A22B";
        case ChatMode.QWEN3_32B:
            return "OpenRouter Qwen3 32B";
        case ChatMode.MISTRAL_NEMO:
            return "OpenRouter Mistral Nemo";
        case ChatMode.QWEN3_14B:
            return "OpenRouter Qwen3 14B";
        case ChatMode.KIMI_K2:
            return "OpenRouter Kimi K2";
        // LM Studio local models
        case ChatMode.LMSTUDIO_LLAMA_3_8B:
            return "LM Studio Llama 3 8B (Local)";
        case ChatMode.LMSTUDIO_QWEN_7B:
            return "LM Studio Qwen 2.5 7B (Local)";
        case ChatMode.LMSTUDIO_GEMMA_7B:
            return "LM Studio Gemma 7B (Local)";
        case ChatMode.LMSTUDIO_GEMMA_3_1B:
            return "LM Studio Gemma 3 1B (Local)";
        // Ollama local models
        case ChatMode.OLLAMA_LLAMA_3_3:
            return "Ollama Llama 3.3 70B (Local)";
        case ChatMode.OLLAMA_LLAMA_3_2:
            return "Ollama Llama 3.2 (Local)";
        case ChatMode.OLLAMA_LLAMA_3_1:
            return "Ollama Llama 3.1 (Local)";
        case ChatMode.OLLAMA_QWEN_2_5:
            return "Ollama Qwen 2.5 (Local)";
        case ChatMode.OLLAMA_GEMMA_2:
            return "Ollama Gemma 2 (Local)";
        case ChatMode.OLLAMA_MISTRAL:
            return "Ollama Mistral (Local)";
        case ChatMode.OLLAMA_CODELLAMA:
            return "Ollama CodeLlama (Local)";
        case ChatMode.OLLAMA_LLAVA:
            return "Ollama LLaVA (Local)";
        case ChatMode.O1_MINI:
            return "OpenAI o1-mini";
        case ChatMode.O1:
            return "OpenAI o1";
    }
};
