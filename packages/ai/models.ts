import { ChatMode } from '@repo/shared/config';
import type { CoreMessage } from 'ai';
import { ReasoningTagName, ReasoningType } from './constants/reasoning';
import type { ProviderEnumType } from './providers';

export const ModelEnum = {
    CLAUDE_4_SONNET: 'claude-4-sonnet-20250514',
    Deepseek_R1: 'accounts/fireworks/models/deepseek-r1',
    GEMINI_2_5_FLASH_LITE: 'gemini-2.5-flash-lite-preview-06-17',
    GEMINI_2_5_FLASH: 'gemini-2.5-flash',
    GEMINI_2_5_PRO: 'gemini-2.5-pro',
    CLAUDE_4_OPUS: 'claude-4-opus-20250514',
    GPT_4o_Mini: 'gpt-4o-mini',
    GPT_4o: 'gpt-4o',
    GPT_4_1_Mini: 'gpt-4.1-mini',
    GPT_4_1_Nano: 'gpt-4.1-nano',
    GPT_4_1: 'gpt-4.1',
    O3: 'o3',
    O3_Mini: 'o3-mini',
    O4_Mini: 'o4-mini',
    GROK_3: 'grok-3',
    GROK_3_MINI: 'grok-3-mini',
    // OpenRouter models
    DEEPSEEK_V3_0324_FREE: 'deepseek/deepseek-chat-v3-0324:free',
    DEEPSEEK_V3_0324: 'deepseek/deepseek-chat-v3-0324',
    DEEPSEEK_R1_FREE: 'deepseek/deepseek-r1:free',
    DEEPSEEK_R1_0528_FREE: 'deepseek/deepseek-r1-0528:free',
    QWEN3_235B_A22B: 'qwen/qwen3-235b-a22b',
    QWEN3_32B: 'qwen/qwen3-32b',
    MISTRAL_NEMO: 'mistralai/mistral-nemo',
    QWEN3_14B_FREE: 'qwen/qwen3-14b:free',
    // LM Studio models (using generic model names)
    LMSTUDIO_LLAMA_3_8B: 'llama-3-8b-instruct',
    LMSTUDIO_QWEN_7B: 'qwen2.5-7b-instruct',
    LMSTUDIO_GEMMA_7B: 'gemma-7b-instruct',
    LMSTUDIO_GEMMA_3_1B: 'google/gemma-3-1b',
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
        id: ModelEnum.GPT_4o_Mini,
        name: 'GPT-4o Mini',
        provider: 'openai',
        maxTokens: 100_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.Deepseek_R1,
        name: 'DeepSeek R1',
        provider: 'fireworks',
        maxTokens: 32_768,
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
        name: 'Gemini 2.5 Flash Lite Preview 06-17',
        provider: 'google',
        maxTokens: 65_536,
        contextWindow: 65_536,
        isFree: true,
    },
    {
        id: ModelEnum.GEMINI_2_5_PRO,
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
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
    // OpenRouter models
    {
        id: ModelEnum.DEEPSEEK_V3_0324,
        name: 'DeepSeek V3 0324',
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
        id: ModelEnum.QWEN3_14B_FREE,
        name: 'Qwen3 14B',
        provider: 'openrouter',
        maxTokens: 8192,
        contextWindow: 40_960,
        isFree: true,
    },
    // LM Studio models
    {
        id: ModelEnum.LMSTUDIO_LLAMA_3_8B,
        name: 'Llama 3 8B (Local)',
        provider: 'lmstudio',
        maxTokens: 8192,
        contextWindow: 8192,
        isFree: true,
    },
    {
        id: ModelEnum.LMSTUDIO_QWEN_7B,
        name: 'Qwen 2.5 7B (Local)',
        provider: 'lmstudio',
        maxTokens: 8192,
        contextWindow: 32768,
        isFree: true,
    },
    {
        id: ModelEnum.LMSTUDIO_GEMMA_7B,
        name: 'Gemma 7B (Local)',
        provider: 'lmstudio',
        maxTokens: 8192,
        contextWindow: 8192,
        isFree: true,
    },
    {
        id: ModelEnum.LMSTUDIO_GEMMA_3_1B,
        name: 'Gemma 3 1B (Local)',
        provider: 'lmstudio',
        maxTokens: 8192,
        contextWindow: 8192,
        isFree: true,
    },
];

export const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.Deep:
            return ModelEnum.GEMINI_2_5_PRO;
        case ChatMode.Pro:
            return ModelEnum.GEMINI_2_5_FLASH;
        case ChatMode.GEMINI_2_5_FLASH_LITE:
            return ModelEnum.GEMINI_2_5_FLASH_LITE;
        case ChatMode.GEMINI_2_5_PRO:
            return ModelEnum.GEMINI_2_5_PRO;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.Deepseek_R1;
        case ChatMode.CLAUDE_4_SONNET:
            return ModelEnum.CLAUDE_4_SONNET;
        case ChatMode.CLAUDE_4_OPUS:
            return ModelEnum.CLAUDE_4_OPUS;
        case ChatMode.GPT_4o_Mini:
            return ModelEnum.GPT_4o_Mini;
        case ChatMode.GPT_4o:
            return ModelEnum.GPT_4o;
        case ChatMode.GPT_4_1:
            return ModelEnum.GPT_4_1;
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
        case ChatMode.GROK_3:
            return ModelEnum.GROK_3;
        case ChatMode.GROK_3_MINI:
            return ModelEnum.GROK_3_MINI;
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324_FREE:
            return ModelEnum.DEEPSEEK_V3_0324_FREE;
        case ChatMode.DEEPSEEK_V3_0324:
            return ModelEnum.DEEPSEEK_V3_0324;
        case ChatMode.DEEPSEEK_R1_FREE:
            return ModelEnum.DEEPSEEK_R1_FREE;
        case ChatMode.DEEPSEEK_R1_0528_FREE:
            return ModelEnum.DEEPSEEK_R1_0528_FREE;
        case ChatMode.QWEN3_235B_A22B:
            return ModelEnum.QWEN3_235B_A22B;
        case ChatMode.QWEN3_32B:
            return ModelEnum.QWEN3_32B;
        case ChatMode.MISTRAL_NEMO:
            return ModelEnum.MISTRAL_NEMO;
        case ChatMode.QWEN3_14B_FREE:
            return ModelEnum.QWEN3_14B_FREE;
        // LM Studio local models
        case ChatMode.LMSTUDIO_LLAMA_3_8B:
            return ModelEnum.LMSTUDIO_LLAMA_3_8B;
        case ChatMode.LMSTUDIO_QWEN_7B:
            return ModelEnum.LMSTUDIO_QWEN_7B;
        case ChatMode.LMSTUDIO_GEMMA_7B:
            return ModelEnum.LMSTUDIO_GEMMA_7B;
        case ChatMode.LMSTUDIO_GEMMA_3_1B:
            return ModelEnum.LMSTUDIO_GEMMA_3_1B;
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
        case ChatMode.DEEPSEEK_R1:
            return 128_000;
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
            return 200_000;
        case ChatMode.O3:
        case ChatMode.O3_Mini:
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
            return 200_000;
        case ChatMode.GPT_4o:
            return 128_000;
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1:
            return 1_047_576;
        case ChatMode.GROK_3:
        case ChatMode.GROK_3_MINI:
            return 131_072;
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324_FREE:
        case ChatMode.DEEPSEEK_V3_0324:
        case ChatMode.DEEPSEEK_R1_FREE:
        case ChatMode.DEEPSEEK_R1_0528_FREE:
            return 163_840;
        case ChatMode.QWEN3_235B_A22B:
        case ChatMode.QWEN3_32B:
        case ChatMode.QWEN3_14B_FREE:
            return 40_960;
        case ChatMode.MISTRAL_NEMO:
            return 131_072;
        // LM Studio local models
        case ChatMode.LMSTUDIO_LLAMA_3_8B:
        case ChatMode.LMSTUDIO_GEMMA_7B:
        case ChatMode.LMSTUDIO_GEMMA_3_1B:
            return 8192;
        case ChatMode.LMSTUDIO_QWEN_7B:
            return 32768;
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
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4o,
        ModelEnum.O3,
        ModelEnum.O3_Mini,
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
        const tokens =
            typeof msg.content === 'string'
                ? estimateTokensByWordCount(msg.content)
                : Array.isArray(msg.content)
                  ? msg.content.reduce(
                        (sum, part) =>
                            part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
                        0
                    )
                  : 0;
        return { message: msg, tokens };
    });

    let totalTokens = messageSizes.reduce((sum, item) => sum + item.tokens, 0);

    // Count tokens for the latest message
    const latestMessageTokens =
        typeof latestMessage.content === 'string'
            ? estimateTokensByWordCount(latestMessage.content)
            : Array.isArray(latestMessage.content)
              ? latestMessage.content.reduce(
                    (sum, part) =>
                        part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
                    0
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
        ModelEnum.Deepseek_R1, // Fireworks
        ModelEnum.DEEPSEEK_R1_FREE, // OpenRouter
        ModelEnum.DEEPSEEK_R1_0528_FREE, // OpenRouter
    ];

    // Anthropic reasoning models
    const anthropicReasoningModels = [
        ModelEnum.CLAUDE_4_SONNET, // claude-4-sonnet-20250514
        ModelEnum.CLAUDE_4_OPUS, // claude-4-opus-20250514
    ];

    // Gemini thinking models (existing functionality)
    const geminiThinkingModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
    ];

    // OpenAI reasoning models
    const openaiReasoningModels = [ModelEnum.O3, ModelEnum.O3_Mini, ModelEnum.O4_Mini];

    return [
        ...deepseekReasoningModels,
        ...anthropicReasoningModels,
        ...geminiThinkingModels,
        ...openaiReasoningModels,
    ].includes(model);
};

/**
 * Checks if a model supports tool calls/function calling
 * Based on capabilities defined in models-data.json
 */
export const supportsTools = (model: ModelEnum): boolean => {
    // OpenAI models that support tools
    const openaiToolModels = [
        ModelEnum.GPT_4o,
        ModelEnum.GPT_4o_Mini,
        ModelEnum.GPT_4_1,
        ModelEnum.GPT_4_1_Mini,
        ModelEnum.GPT_4_1_Nano,
        // Note: O1/O3 models do NOT support tools
    ];

    // Anthropic models that support tools
    const anthropicToolModels = [ModelEnum.CLAUDE_4_SONNET, ModelEnum.CLAUDE_4_OPUS];

    // Google models that support tools
    const googleToolModels = [
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_FLASH_LITE,
    ];

    // OpenRouter models that support tools
    const openrouterToolModels = [
        ModelEnum.DEEPSEEK_V3_0324,
        ModelEnum.DEEPSEEK_V3_0324_FREE,
        ModelEnum.QWEN3_235B_A22B,
        ModelEnum.QWEN3_32B,
        ModelEnum.QWEN3_14B_FREE,
        ModelEnum.MISTRAL_NEMO,
    ];

    // xAI models that support tools
    const xaiToolModels = [ModelEnum.GROK_3, ModelEnum.GROK_3_MINI];

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
    const deepseekReasoningModels = [
        ModelEnum.Deepseek_R1,
        ModelEnum.DEEPSEEK_R1_FREE,
        ModelEnum.DEEPSEEK_R1_0528_FREE,
    ];

    if (deepseekReasoningModels.includes(model)) {
        return ReasoningType.DEEPSEEK_REASONING;
    }

    // Anthropic models support reasoning with providerOptions
    const anthropicReasoningModels = [ModelEnum.CLAUDE_4_SONNET, ModelEnum.CLAUDE_4_OPUS];

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
