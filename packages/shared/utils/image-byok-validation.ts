import { ChatMode } from "@repo/shared/config";
import type { Attachment, ThreadItem } from "@repo/shared/types";

// Local copy of API key shape to avoid cross-package dependency from shared -> common
export type ApiKeys = {
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;
    JINA_API_KEY?: string;
    FIREWORKS_API_KEY?: string;
    XAI_API_KEY?: string;
    OPENROUTER_API_KEY?: string;
    TOGETHER_API_KEY?: string;
};

/**
 * Detects if a request contains image attachments that require AI analysis
 */
export const hasImageAttachments = ({
    imageAttachment,
    attachments,
    messages,
}: {
    imageAttachment?: { base64?: string; file?: File };
    attachments?: Attachment[];
    messages?: ThreadItem[];
}): boolean => {
    // Check current image attachment
    if (imageAttachment && (imageAttachment.base64 || imageAttachment.file)) {
        return true;
    }

    // Check multi-modal attachments for images
    if (attachments && attachments.length > 0) {
        const hasImages = attachments.some((attachment) =>
            attachment.contentType.startsWith("image/"),
        );
        if (hasImages) {
            return true;
        }
    }

    // Check previous messages for image attachments
    if (messages && messages.length > 0) {
        const hasImagesInHistory = messages.some(
            (message) =>
                message.imageAttachment &&
                typeof message.imageAttachment === "string" &&
                message.imageAttachment.trim() !== "",
        );
        if (hasImagesInHistory) {
            return true;
        }
    }

    return false;
};

/**
 * Maps chat modes to their required API key names
 */
export const getRequiredApiKeyForChatMode = (chatMode: ChatMode): keyof ApiKeys | null => {
    // Map chat modes to their required API keys
    const chatModeToApiKeyMap: Partial<Record<ChatMode, keyof ApiKeys>> = {
        // OpenAI models
        [ChatMode.O3]: "OPENAI_API_KEY",
        [ChatMode.O3_Mini]: "OPENAI_API_KEY",
        [ChatMode.O4_Mini]: "OPENAI_API_KEY",
        [ChatMode.GPT_4o_Mini]: "OPENAI_API_KEY",
        [ChatMode.GPT_4o]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1_Mini]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1_Nano]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1]: "OPENAI_API_KEY",

        // Anthropic models
        [ChatMode.CLAUDE_4_SONNET]: "ANTHROPIC_API_KEY",
        [ChatMode.CLAUDE_4_OPUS]: "ANTHROPIC_API_KEY",

        // Google models
        [ChatMode.GEMINI_2_5_PRO]: "GEMINI_API_KEY",
        [ChatMode.GEMINI_2_5_FLASH]: "GEMINI_API_KEY",
        [ChatMode.GEMINI_2_5_FLASH_LITE]: "GEMINI_API_KEY", // Even free model requires BYOK for images

        // Research modes (use Gemini)
        [ChatMode.Deep]: "GEMINI_API_KEY",
        [ChatMode.Pro]: "GEMINI_API_KEY",

        // xAI models
        [ChatMode.GROK_3]: "XAI_API_KEY",
        [ChatMode.GROK_3_MINI]: "XAI_API_KEY",
        [ChatMode.GROK_4]: "XAI_API_KEY",

        // Fireworks models
        [ChatMode.DEEPSEEK_R1_FIREWORKS]: "FIREWORKS_API_KEY",
        [ChatMode.KIMI_K2_INSTRUCT_FIREWORKS]: "FIREWORKS_API_KEY",

        // OpenRouter models
        [ChatMode.DEEPSEEK_V3_0324]: "OPENROUTER_API_KEY",
        [ChatMode.DEEPSEEK_R1]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_235B_A22B]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_32B]: "OPENROUTER_API_KEY",
        [ChatMode.MISTRAL_NEMO]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_14B]: "OPENROUTER_API_KEY",
        [ChatMode.KIMI_K2]: "OPENROUTER_API_KEY",
    };

    return chatModeToApiKeyMap[chatMode] || null;
};

/**
 * Gets the human-readable provider name for an API key
 */
export const getProviderNameForApiKey = (apiKeyName: keyof ApiKeys): string => {
    const apiKeyToProviderMap: Record<keyof ApiKeys, string> = {
        OPENAI_API_KEY: "OpenAI",
        ANTHROPIC_API_KEY: "Anthropic",
        GEMINI_API_KEY: "Google Gemini",
        JINA_API_KEY: "Jina",
        FIREWORKS_API_KEY: "Fireworks",
        XAI_API_KEY: "xAI",
        OPENROUTER_API_KEY: "OpenRouter",
        TOGETHER_API_KEY: "Together",
    };

    return apiKeyToProviderMap[apiKeyName] || apiKeyName.replace("_API_KEY", "");
};

/**
 * Validates if user has the required BYOK API key for image analysis
 */
export const validateByokForImageAnalysis = ({
    chatMode,
    apiKeys,
    hasImageAttachments: hasImages,
}: {
    chatMode: ChatMode;
    apiKeys: ApiKeys;
    hasImageAttachments: boolean;
}): {
    isValid: boolean;
    requiredApiKey?: keyof ApiKeys;
    providerName?: string;
    errorMessage?: string;
} => {
    // If no images, no BYOK requirement
    if (!hasImages) {
        return { isValid: true };
    }

    // Get required API key for this chat mode
    const requiredApiKey = getRequiredApiKeyForChatMode(chatMode);

    if (!requiredApiKey) {
        // Model doesn't support image analysis or no API key mapping found
        return {
            isValid: false,
            errorMessage: "This model does not support image analysis",
        };
    }

    // Check if user has the required API key
    const userApiKey = apiKeys[requiredApiKey];
    const hasValidApiKey = !!(userApiKey && userApiKey.trim().length > 0);

    if (!hasValidApiKey) {
        const providerName = getProviderNameForApiKey(requiredApiKey);
        return {
            isValid: false,
            requiredApiKey,
            providerName,
            errorMessage: `Image analysis requires your own API key. Please add your ${providerName} API key in Settings > API Keys to analyze images.`,
        };
    }

    return { isValid: true };
};
