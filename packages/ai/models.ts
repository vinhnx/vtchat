import { ChatMode } from '@repo/shared/config';
import type { CoreMessage } from 'ai';
import { ReasoningTagName, ReasoningType } from './constants/reasoning';
import type { ProviderEnumType } from './providers';

export const ModelEnum = {
    CLAUDE_4_1_OPUS: 'claude-opus-4-1-20250805',
    CLAUDE_4_SONNET: 'claude-sonnet-4-20250514',
    CLAUDE_SONNET_4_5: 'claude-sonnet-4-5',
    CLAUDE_4_OPUS: 'claude-opus-4-20250514',
    GEMINI_2_5_FLASH_LITE: 'gemini-flash-lite-latest',
    GEMINI_2_5_FLASH: 'gemini-flash-latest',
    GEMINI_2_5_PRO: 'gemini-2.5-pro',
    GEMINI_2_5_FLASH_IMAGE_PREVIEW: 'gemini-2.5-flash-image-preview',
    GPT_4o_Mini: 'gpt-4o-mini',
    GPT_4o: 'gpt-4o',
    GPT_4_1_Mini: 'gpt-4.1-mini',
    GPT_4_1_Nano: 'gpt-4.1-nano',
    GPT_4_1: 'gpt-4.1',
    GPT_5: 'gpt-5-2025-08-07',
    O3: 'o3',
    O3_Mini: 'o3-mini',
    O4_Mini: 'o4-mini',
    O1_MINI: 'o1-mini',
    O1: 'o1',
    GROK_3: 'grok-3',
    GROK_3_MINI: 'grok-3-mini',
    GROK_4: 'grok-4',
    // Fireworks models
    DEEPSEEK_R1_FIREWORKS: 'accounts/fireworks/models/deepseek-r1-0528',
    KIMI_K2_INSTRUCT_FIREWORKS: 'accounts/fireworks/models/kimi-k2-instruct',
    // OpenRouter models
    DEEPSEEK_V3_0324: 'deepseek/deepseek-chat-v3-0324',
    DEEPSEEK_R1: 'deepseek/deepseek-r1',
    QWEN3_235B_A22B: 'qwen/qwen3-235b-a22b',
    QWEN3_32B: 'qwen/qwen3-32b',
    MISTRAL_NEMO: 'mistralai/mistral-nemo',
    QWEN3_14B: 'qwen/qwen3-14b',
    KIMI_K2: 'moonshot/kimi-k2',
    GPT_OSS_120B: 'openai/gpt-oss-120b',
    GPT_OSS_20B: 'openai/gpt-oss-20b',
} as const;

export type ModelEnum = (typeof ModelEnum)[keyof typeof ModelEnum];

export type Model = {
    id: ModelEnum;
    name: string;
    provider: ProviderEnumType;
    maxTokens: number;
    contextWindow: number;
    isFree?: boolean; // Add flag for free models
};

export const models: Model[] = [
    {
        id: ModelEnum.GPT_5,
        name: 'GPT-5',
        provider: 'openai',
        maxTokens: 128_000,
        contextWindow: 400_000,
    },
    {
        id: ModelEnum.GPT_4o,
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 16_384,
        contextWindow: 128_000,
    },
    {
        id: ModelEnum.GPT_4_1_Mini,
        name: 'GPT-4.1 Mini',
        provider: 'openai',
        maxTokens: 32_768,
        contextWindow: 1_047_576,
    },
    {
        id: ModelEnum.GPT_4_1,
        name: 'GPT-4.1',
        provider: 'openai',
        maxTokens: 32_768,
        contextWindow: 1_047_576,
    },
    {
        id: ModelEnum.O3,
        name: 'o3',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.O3_Mini,
        name: 'o3-mini',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.O4_Mini,
        name: 'o4 mini',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.GPT_4_1_Nano,
        name: 'GPT-4.1 Nano',
        provider: 'openai',
        maxTokens: 16_384,
        contextWindow: 1_047_576,
    },
    {
        id: ModelEnum.O1_MINI,
        name: 'o1-mini',
        provider: 'openai',
        maxTokens: 65_536,
        contextWindow: 128_000,
    },
    {
        id: ModelEnum.O1,
        name: 'o1',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.GPT_4o_Mini,
        name: 'GPT-4o Mini',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_4_1_OPUS,
        name: 'Claude 4.1 Opus',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_4_SONNET,
        name: 'Claude 4 Sonnet',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_SONNET_4_5,
        name: 'Claude Sonnet 4.5',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_4_OPUS,
        name: 'Claude 4 Opus',
        provider: 'anthropic',
        maxTokens: 32_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.GEMINI_2_5_FLASH,
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_5_FLASH_LITE,
        name: 'Gemini 2.5 Flash Lite',
        provider: 'google',
        maxTokens: 65_536,
        contextWindow: 65_536,
    },
    {
        id: ModelEnum.GEMINI_2_5_PRO,
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
        name: 'Gemini 2.5 Flash Image Preview',
        provider: 'google',
        maxTokens: 65_536,
        contextWindow: 65_536,
    },
    {
        id: ModelEnum.GROK_3,
        name: 'Grok 3',
        provider: 'xai',
        maxTokens: 131_072,
        contextWindow: 131_072,
    },
    {
        id: ModelEnum.GROK_3_MINI,
        name: 'Grok 3 Mini',
        provider: 'xai',
        maxTokens: 131_072,
        contextWindow: 131_072,
    },
    {
        id: ModelEnum.GROK_4,
        name: 'Grok 4',
        provider: 'xai',
        maxTokens: 256_000,
        contextWindow: 256_000,
    },
    // Fireworks models
    {
        id: ModelEnum.DEEPSEEK_R1_FIREWORKS,
        name: 'DeepSeek R1 (Fireworks)',
        provider: 'fireworks',
        maxTokens: 32_768,
        contextWindow: 163_840,
    },
    {
        id: ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS,
        name: 'Kimi K2 Instruct (Fireworks)',
        provider: 'fireworks',
        maxTokens: 4_096,
        contextWindow: 131_072,
    },
    // OpenRouter models
    {
        id: ModelEnum.DEEPSEEK_V3_0324,
        name: 'DeepSeek V3 0324',
        provider: 'openrouter',
        maxTokens: 32_768,
        contextWindow: 163_840,
    },
    {
        id: ModelEnum.DEEPSEEK_R1,
        name: 'DeepSeek R1',
        provider: 'openrouter',
        maxTokens: 32_768,
        contextWindow: 163_840,
    },
    {
        id: ModelEnum.QWEN3_235B_A22B,
        name: 'Qwen3 235B A22B',
        provider: 'openrouter',
        maxTokens: 8192,
        contextWindow: 40_960,
    },
    {
        id: ModelEnum.QWEN3_32B,
        name: 'Qwen3 32B',
        provider: 'openrouter',
        maxTokens: 8192,
        contextWindow: 40_960,
    },
    {
        id: ModelEnum.MISTRAL_NEMO,
        name: 'Mistral Nemo',
        provider: 'openrouter',
        maxTokens: 32_768,
        contextWindow: 131_072,
    },
    {
        id: ModelEnum.QWEN3_14B,
        name: 'Qwen3 14B',
        provider: 'openrouter',
        maxTokens: 8192,
        contextWindow: 40_960,
        isFree: true,
    },
    {
        id: ModelEnum.KIMI_K2,
        name: 'Kimi K2 (OpenRouter)',
        provider: 'openrouter',
        maxTokens: 4096,
        contextWindow: 131_072,
    },
    {
        id: ModelEnum.GPT_OSS_120B,
        name: 'OpenAI gpt-oss-120b (via OpenRouter)',
        provider: 'openrouter',
        maxTokens: 32_768,
        contextWindow: 131_072,
    },
    {
        id: ModelEnum.GPT_OSS_20B,
        name: 'OpenAI gpt-oss-20b (via OpenRouter)',
        provider: 'openrouter',
        maxTokens: 32_768,
        contextWindow: 131_072,
    },
];

export const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.Deep:
            return ModelEnum.GEMINI_2_5_FLASH;
        case ChatMode.Pro:
            return ModelEnum.GEMINI_2_5_FLASH;
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return ModelEnum.GEMINI_2_5_FLASH_LITE;
        case ChatMode.GEMINI_2_5_PRO:
            return ModelEnum.GEMINI_2_5_PRO;
        case ChatMode.GEMINI_2_5_FLASH:
            return ModelEnum.GEMINI_2_5_FLASH;
        case ChatMode.DEEPSEEK_R1_FIREWORKS:
            return ModelEnum.DEEPSEEK_R1_FIREWORKS;
        case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
            return ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.DEEPSEEK_R1;
        case ChatMode.CLAUDE_4_1_OPUS:
            return ModelEnum.CLAUDE_4_1_OPUS;
        case ChatMode.CLAUDE_4_SONNET:
            return ModelEnum.CLAUDE_4_SONNET;
        case ChatMode.CLAUDE_SONNET_4_5:
            return ModelEnum.CLAUDE_SONNET_4_5;
        case ChatMode.CLAUDE_4_OPUS:
            return ModelEnum.CLAUDE_4_OPUS;
        case ChatMode.GPT_4o_Mini:
            return ModelEnum.GPT_4o_Mini;
        case ChatMode.GPT_4o:
            return ModelEnum.GPT_4o;
        case ChatMode.GPT_4_1:
            return ModelEnum.GPT_4_1;
        case ChatMode.GPT_5:
            return ModelEnum.GPT_5;
        case ChatMode.GPT_4_1_Mini:
            return ModelEnum.GPT_4_1_Mini;
        case ChatMode.GPT_4_1_Nano:
            return ModelEnum.GPT_4_1_Nano;
        case ChatMode.O3:
            return ModelEnum.O3;
        case ChatMode.O3_Mini:
            return ModelEnum.O3_Mini;
        case ChatMode.O4_Mini:
            return ModelEnum.O4_Mini;
        case ChatMode.O1_MINI:
            return ModelEnum.O1_MINI;
        case ChatMode.O1:
            return ModelEnum.O1;
        case ChatMode.GROK_3:
            return ModelEnum.GROK_3;
        case ChatMode.GROK_3_MINI:
            return ModelEnum.GROK_3_MINI;
        case ChatMode.GROK_4:
            return ModelEnum.GROK_4;
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324:
            return ModelEnum.DEEPSEEK_V3_0324;
        case ChatMode.QWEN3_235B_A22B:
            return ModelEnum.QWEN3_235B_A22B;
        case ChatMode.QWEN3_32B:
            return ModelEnum.QWEN3_32B;
        case ChatMode.MISTRAL_NEMO:
            return ModelEnum.MISTRAL_NEMO;
        case ChatMode.QWEN3_14B:
            return ModelEnum.QWEN3_14B;
        case ChatMode.KIMI_K2:
            return ModelEnum.KIMI_K2;
        case ChatMode.GPT_OSS_120B:
            return ModelEnum.GPT_OSS_120B;
        case ChatMode.GPT_OSS_20B:
            return ModelEnum.GPT_OSS_20B;
        default:
            return ModelEnum.GEMINI_2_5_FLASH_LITE;
    }
};

export const getChatModeMaxTokens = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Pro:
        case ChatMode.Deep:
        case ChatMode.GEMINI_2_5_PRO:
        case ChatMode.GEMINI_2_5_FLASH:
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return 1_048_576;
        case ChatMode.CLAUDE_4_1_OPUS:
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
        case ChatMode.CLAUDE_SONNET_4_5:
            return 200_000;
        case ChatMode.O3:
        case ChatMode.O3_Mini:
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
        case ChatMode.O1:
            return 200_000;
        case ChatMode.O1_MINI:
            return 128_000;
        case ChatMode.GPT_4o:
            return 128_000;
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1:
        case ChatMode.GPT_4_1_Nano:
            return 1_047_576;
        case ChatMode.GROK_3:
        case ChatMode.GROK_3_MINI:
            return 131_072;
        case ChatMode.GROK_4:
            return 256_000;
        // Fireworks models
        case ChatMode.DEEPSEEK_R1_FIREWORKS:
            return 163_840;
        case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
            return 131_072;
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324:
        case ChatMode.DEEPSEEK_R1:
            return 163_840;
        case ChatMode.QWEN3_235B_A22B:
        case ChatMode.QWEN3_32B:
        case ChatMode.QWEN3_14B:
            return 40_960;
        case ChatMode.MISTRAL_NEMO:
        case ChatMode.KIMI_K2:
            return 131_072;
        case ChatMode.GPT_OSS_120B:
        case ChatMode.GPT_OSS_20B:
            return 200_000;
        default:
            return 100_000;
    }
};

export const estimateTokensByWordCount = (text: string): number => {
    // Simple word splitting by whitespace
    const words = text?.trim().split(/\s+/);

    // Using a multiplier of 1.35 tokens per word for English text
    const estimatedTokens = Math.ceil(words.length * 1.35);

    return estimatedTokens;
};

export const estimateTokensForMessages = (messages: CoreMessage[]): number => {
    let totalTokens = 0;

    for (const message of messages) {
        if (typeof message.content === 'string') {
            totalTokens += estimateTokensByWordCount(message.content);
        } else if (Array.isArray(message.content)) {
            for (const part of message.content) {
                if (part.type === 'text') {
                    totalTokens += estimateTokensByWordCount(part.text);
                }
            }
        }
    }

    return totalTokens;
};

export const supportsNativeWebSearch = (model: ModelEnum): boolean => {
    const googleModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
        ModelEnum.GEMINI_2_5_PRO,
    ];

    return googleModels.includes(model);
};

export const supportsOpenAIWebSearch = (model: ModelEnum): boolean => {
    const openaiWebSearchModels = [
        ModelEnum.GPT_5,
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4o,
        ModelEnum.O3,
        ModelEnum.O3_Mini,
        // OpenAI models via OpenRouter also support OpenAI web search tools
        ModelEnum.GPT_OSS_120B,
        ModelEnum.GPT_OSS_20B,
        // Add other models as they become available for Responses API
    ];

    return openaiWebSearchModels.includes(model);
};

export const trimMessageHistoryEstimated = (messages: CoreMessage[], chatMode: ChatMode) => {
    const maxTokens = getChatModeMaxTokens(chatMode);
    let trimmedMessages = [...messages];

    if (trimmedMessages.length <= 1) {
        const tokenCount = estimateTokensForMessages(trimmedMessages);
        return { trimmedMessages, tokenCount };
    }

    const latestMessage = trimmedMessages.pop()!;

    const messageSizes = trimmedMessages.map((msg) => {
        const tokens = typeof msg.content === 'string'
            ? estimateTokensByWordCount(msg.content)
            : Array.isArray(msg.content)
            ? msg.content.reduce(
                (sum, part) =>
                    part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
                0,
            )
            : 0;
        return { message: msg, tokens };
    });

    let totalTokens = messageSizes.reduce((sum, item) => sum + item.tokens, 0);

    // Count tokens for the latest message
    const latestMessageTokens = typeof latestMessage.content === 'string'
        ? estimateTokensByWordCount(latestMessage.content)
        : Array.isArray(latestMessage.content)
        ? latestMessage.content.reduce(
            (sum, part) => part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
            0,
        )
        : 0;

    totalTokens += latestMessageTokens;

    while (totalTokens > maxTokens && messageSizes.length > 0) {
        const removed = messageSizes.shift();
        if (removed) {
            totalTokens -= removed.tokens;
        }
    }

    trimmedMessages = messageSizes.map((item) => item.message);
    trimmedMessages.push(latestMessage);

    return { trimmedMessages, tokenCount: totalTokens };
};

/**
 * Detects if a model supports reasoning tokens/thinking capabilities
 */
export const supportsReasoning = (model: ModelEnum): boolean => {
    // DeepSeek reasoning models (via Fireworks, OpenRouter)
    const deepseekReasoningModels = [
        ModelEnum.DEEPSEEK_R1_FIREWORKS, // Fireworks
        ModelEnum.DEEPSEEK_R1, // OpenRouter
    ];

    // Anthropic reasoning models
    const anthropicReasoningModels = [
        ModelEnum.CLAUDE_4_1_OPUS, // claude-4.1-opus-20250805
        ModelEnum.CLAUDE_4_SONNET, // claude-4-sonnet-20250514
        ModelEnum.CLAUDE_SONNET_4_5, // claude-sonnet-4-5
        ModelEnum.CLAUDE_4_OPUS, // claude-4-opus-20250514
    ];

    // Gemini thinking models (existing functionality)
    const geminiThinkingModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
    ];

    // OpenAI reasoning models
    const openaiReasoningModels = [
        ModelEnum.GPT_5,
        ModelEnum.O3,
        ModelEnum.O3_Mini,
        ModelEnum.O4_Mini,
        ModelEnum.O1_MINI,
        ModelEnum.O1,
    ];

    return [
        ...deepseekReasoningModels,
        ...anthropicReasoningModels,
        ...geminiThinkingModels,
        ...openaiReasoningModels,
    ].includes(model);
};

/**
 * Checks if a model supports tool calls/function calling
 * Based on capabilities from the models.dev API
 */
export const supportsTools = (model: ModelEnum): boolean => {
    // OpenAI models that support tools
    const openaiToolModels = [
        ModelEnum.GPT_5,
        ModelEnum.GPT_4o,
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4_1,
        ModelEnum.GPT_4_1_Mini,
        ModelEnum.GPT_4_1_Nano,
        // Note: O1/O3 models do NOT support tools
    ];

    // Anthropic models that support tools
    const anthropicToolModels = [
        ModelEnum.CLAUDE_4_1_OPUS,
        ModelEnum.CLAUDE_4_SONNET,
        ModelEnum.CLAUDE_SONNET_4_5,
        ModelEnum.CLAUDE_4_OPUS,
    ];

    // Google models that support tools
    const googleToolModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
    ];

    // OpenRouter models that support tools
    const openrouterToolModels = [
        ModelEnum.DEEPSEEK_V3_0324,
        ModelEnum.QWEN3_235B_A22B,
        ModelEnum.QWEN3_32B,
        ModelEnum.QWEN3_14B,
        ModelEnum.MISTRAL_NEMO,
        ModelEnum.KIMI_K2,
        ModelEnum.GPT_OSS_120B,
        ModelEnum.GPT_OSS_20B,
    ];

    // xAI models that support tools
    const xaiToolModels = [ModelEnum.GROK_3, ModelEnum.GROK_3_MINI, ModelEnum.GROK_4];

    return [
        ...openaiToolModels,
        ...anthropicToolModels,
        ...googleToolModels,
        ...openrouterToolModels,
        ...xaiToolModels,
    ].includes(model);
};

/**
 * Checks if a model supports web search
 * Most models support web search through our implementation
 */
export const supportsWebSearch = (model: ModelEnum): boolean => {
    // Almost all models support web search through our unified implementation
    // Only some very specialized or limited models might not support it
    const nonWebSearchModels: ModelEnum[] = [
        // Add any models that don't support web search here if needed
    ];

    return !nonWebSearchModels.includes(model);
};

/**
 * Determines the reasoning implementation type for a model
 */
export const getReasoningType = (model: ModelEnum): ReasoningType => {
    // Gemini models use thinking config
    const geminiThinkingModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
    ];

    if (geminiThinkingModels.includes(model)) {
        return ReasoningType.GEMINI_THINKING;
    }

    // DeepSeek models use reasoning middleware with <think> tags
    const deepseekReasoningModels = [ModelEnum.DEEPSEEK_R1_FIREWORKS, ModelEnum.DEEPSEEK_R1];

    if (deepseekReasoningModels.includes(model)) {
        return ReasoningType.DEEPSEEK_REASONING;
    }

    // Anthropic models support reasoning with providerOptions
    const anthropicReasoningModels = [
        ModelEnum.CLAUDE_4_1_OPUS,
        ModelEnum.CLAUDE_4_SONNET,
        ModelEnum.CLAUDE_SONNET_4_5,
        ModelEnum.CLAUDE_4_OPUS,
    ];

    if (anthropicReasoningModels.includes(model)) {
        return ReasoningType.ANTHROPIC_REASONING;
    }

    return ReasoningType.NONE;
};

/**
 * Gets the appropriate middleware tag for reasoning extraction
 */
export const getReasoningTagName = (model: ModelEnum): string | null => {
    const reasoningType = getReasoningType(model);

    switch (reasoningType) {
        case ReasoningType.DEEPSEEK_REASONING:
            return ReasoningTagName.THINK; // DeepSeek uses <think> tags
        case ReasoningType.ANTHROPIC_REASONING:
            return ReasoningTagName.THINKING; // Anthropic models may use different tags
        default:
            return null; // Gemini uses built-in thinking config, no middleware needed
    }
};
