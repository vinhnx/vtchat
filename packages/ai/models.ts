import { ChatMode } from '@repo/shared/config';
import type { CoreMessage } from 'ai';
import { ReasoningTagName, ReasoningType } from './constants/reasoning';
import { ModelEnum } from './model-enum';
import type { ProviderEnumType } from './providers';

export { ModelEnum };
export type { ModelEnum as ModelEnumType };

export type Model = {
    id: ModelEnum;
    name: string;
    provider: ProviderEnumType;
    maxTokens: number;
    contextWindow: number;
    isFree?: boolean;
};

export const models: Model[] = [
    // OpenAI GPT-5.4 series (latest frontier)
    {
        id: ModelEnum.GPT_5_4,
        name: 'GPT-5.4',
        provider: 'openai',
        maxTokens: 128_000,
        contextWindow: 400_000,
    },
    {
        id: ModelEnum.GPT_5_4_PRO,
        name: 'GPT-5.4 Pro',
        provider: 'openai',
        maxTokens: 128_000,
        contextWindow: 400_000,
    },
    {
        id: ModelEnum.GPT_5_4_MINI,
        name: 'GPT-5.4 Mini',
        provider: 'openai',
        maxTokens: 128_000,
        contextWindow: 400_000,
    },
    {
        id: ModelEnum.GPT_5_4_NANO,
        name: 'GPT-5.4 Nano',
        provider: 'openai',
        maxTokens: 128_000,
        contextWindow: 400_000,
    },
    // Gemini 3.x series (latest)
    {
        id: ModelEnum.GEMINI_3_1_PRO,
        name: 'Gemini 3.1 Pro Preview',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_3_FLASH,
        name: 'Gemini 3 Flash Preview',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_3_1_FLASH_LITE,
        name: 'Gemini 3.1 Flash Lite Preview',
        provider: 'google',
        maxTokens: 65_536,
        contextWindow: 65_536,
    },
    // Claude 4.6/4.5 series (latest)
    {
        id: ModelEnum.CLAUDE_4_6_OPUS,
        name: 'Claude 4.6 Opus',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_4_6_SONNET,
        name: 'Claude 4.6 Sonnet',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    {
        id: ModelEnum.CLAUDE_4_5_HAIKU,
        name: 'Claude 4.5 Haiku',
        provider: 'anthropic',
        maxTokens: 64_000,
        contextWindow: 200_000,
    },
    // xAI Grok models
    {
        id: ModelEnum.GROK_4,
        name: 'Grok 4',
        provider: 'xai',
        maxTokens: 256_000,
        contextWindow: 256_000,
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
            return ModelEnum.GEMINI_3_FLASH;
        case ChatMode.Pro:
            return ModelEnum.GEMINI_3_FLASH;
        case ChatMode.GPT_5_4:
            return ModelEnum.GPT_5_4;
        case ChatMode.GPT_5_4_PRO:
            return ModelEnum.GPT_5_4_PRO;
        case ChatMode.GPT_5_4_MINI:
            return ModelEnum.GPT_5_4_MINI;
        case ChatMode.GPT_5_4_NANO:
            return ModelEnum.GPT_5_4_NANO;
        case ChatMode.GEMINI_3_1_PRO:
            return ModelEnum.GEMINI_3_1_PRO;
        case ChatMode.GEMINI_3_FLASH:
            return ModelEnum.GEMINI_3_FLASH;
        case ChatMode.GEMINI_3_1_FLASH_LITE:
            return ModelEnum.GEMINI_3_1_FLASH_LITE;
        case ChatMode.CLAUDE_4_6_OPUS:
            return ModelEnum.CLAUDE_4_6_OPUS;
        case ChatMode.CLAUDE_4_6_SONNET:
            return ModelEnum.CLAUDE_4_6_SONNET;
        case ChatMode.CLAUDE_4_5_HAIKU:
            return ModelEnum.CLAUDE_4_5_HAIKU;
        case ChatMode.GROK_4:
            return ModelEnum.GROK_4;
        case ChatMode.GROK_3:
            return ModelEnum.GROK_3;
        case ChatMode.GROK_3_MINI:
            return ModelEnum.GROK_3_MINI;
        case ChatMode.DEEPSEEK_R1_FIREWORKS:
            return ModelEnum.DEEPSEEK_R1_FIREWORKS;
        case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
            return ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS;
        case ChatMode.DEEPSEEK_V3_0324:
            return ModelEnum.DEEPSEEK_V3_0324;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.DEEPSEEK_R1;
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
            return ModelEnum.GPT_5_4_NANO;
    }
};

export const getChatModeFromModel = (model?: ModelEnum): ChatMode => {
    if (!model) return ChatMode.Pro;

    switch (model) {
        case ModelEnum.GPT_5_4:
            return ChatMode.GPT_5_4;
        case ModelEnum.GPT_5_4_PRO:
            return ChatMode.GPT_5_4_PRO;
        case ModelEnum.GPT_5_4_MINI:
            return ChatMode.GPT_5_4_MINI;
        case ModelEnum.GPT_5_4_NANO:
            return ChatMode.GPT_5_4_NANO;
        case ModelEnum.GEMINI_3_1_PRO:
            return ChatMode.GEMINI_3_1_PRO;
        case ModelEnum.GEMINI_3_FLASH:
            return ChatMode.GEMINI_3_FLASH;
        case ModelEnum.GEMINI_3_1_FLASH_LITE:
            return ChatMode.GEMINI_3_1_FLASH_LITE;
        case ModelEnum.CLAUDE_4_6_OPUS:
            return ChatMode.CLAUDE_4_6_OPUS;
        case ModelEnum.CLAUDE_4_6_SONNET:
            return ChatMode.CLAUDE_4_6_SONNET;
        case ModelEnum.CLAUDE_4_5_HAIKU:
            return ChatMode.CLAUDE_4_5_HAIKU;
        case ModelEnum.GROK_4:
            return ChatMode.GROK_4;
        case ModelEnum.GROK_3:
            return ChatMode.GROK_3;
        case ModelEnum.GROK_3_MINI:
            return ChatMode.GROK_3_MINI;
        case ModelEnum.DEEPSEEK_R1_FIREWORKS:
            return ChatMode.DEEPSEEK_R1_FIREWORKS;
        case ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS:
            return ChatMode.KIMI_K2_INSTRUCT_FIREWORKS;
        case ModelEnum.DEEPSEEK_V3_0324:
            return ChatMode.DEEPSEEK_V3_0324;
        case ModelEnum.DEEPSEEK_R1:
            return ChatMode.DEEPSEEK_R1;
        case ModelEnum.QWEN3_235B_A22B:
            return ChatMode.QWEN3_235B_A22B;
        case ModelEnum.QWEN3_32B:
            return ChatMode.QWEN3_32B;
        case ModelEnum.MISTRAL_NEMO:
            return ChatMode.MISTRAL_NEMO;
        case ModelEnum.QWEN3_14B:
            return ChatMode.QWEN3_14B;
        case ModelEnum.KIMI_K2:
            return ChatMode.KIMI_K2;
        case ModelEnum.GPT_OSS_120B:
            return ChatMode.GPT_OSS_120B;
        case ModelEnum.GPT_OSS_20B:
            return ChatMode.GPT_OSS_20B;
        default:
            return ChatMode.GPT_5_4_NANO;
    }
};

export const getChatModeMaxTokens = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Pro:
        case ChatMode.Deep:
        case ChatMode.GEMINI_3_1_PRO:
        case ChatMode.GEMINI_3_FLASH:
        case ChatMode.GEMINI_3_1_FLASH_LITE:
            return 1_048_576;
        case ChatMode.CLAUDE_4_6_OPUS:
        case ChatMode.CLAUDE_4_6_SONNET:
        case ChatMode.CLAUDE_4_5_HAIKU:
            return 64_000;
        case ChatMode.GPT_5_4:
        case ChatMode.GPT_5_4_PRO:
        case ChatMode.GPT_5_4_MINI:
        case ChatMode.GPT_5_4_NANO:
            return 128_000;
        case ChatMode.GROK_4:
            return 256_000;
        case ChatMode.GROK_3:
        case ChatMode.GROK_3_MINI:
            return 131_072;
        case ChatMode.DEEPSEEK_R1_FIREWORKS:
        case ChatMode.DEEPSEEK_V3_0324:
        case ChatMode.DEEPSEEK_R1:
            return 32_768;
        case ChatMode.KIMI_K2_INSTRUCT_FIREWORKS:
        case ChatMode.KIMI_K2:
            return 4_096;
        case ChatMode.QWEN3_235B_A22B:
        case ChatMode.QWEN3_32B:
        case ChatMode.QWEN3_14B:
            return 8192;
        case ChatMode.MISTRAL_NEMO:
            return 32_768;
        case ChatMode.GPT_OSS_120B:
        case ChatMode.GPT_OSS_20B:
            return 32_768;
        default:
            return 65_536;
    }
};

export const supportsNativeWebSearch = (model: ModelEnum): boolean => {
    const googleModels = [
        ModelEnum.GEMINI_3_FLASH,
        ModelEnum.GEMINI_3_1_FLASH_LITE,
        ModelEnum.GEMINI_3_1_PRO,
    ];

    return googleModels.includes(model);
};

export const supportsOpenAIWebSearch = (model: ModelEnum): boolean => {
    const openaiWebSearchModels = [
        ModelEnum.GPT_5_4,
        ModelEnum.GPT_5_4_PRO,
        ModelEnum.GPT_5_4_MINI,
        ModelEnum.GPT_5_4_NANO,
        ModelEnum.GPT_OSS_120B,
        ModelEnum.GPT_OSS_20B,
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

export const supportsReasoning = (model: ModelEnum): boolean => {
    const deepseekReasoningModels = [
        ModelEnum.DEEPSEEK_R1_FIREWORKS,
        ModelEnum.DEEPSEEK_R1,
    ];

    const anthropicReasoningModels = [
        ModelEnum.CLAUDE_4_6_OPUS,
        ModelEnum.CLAUDE_4_6_SONNET,
        ModelEnum.CLAUDE_4_5_HAIKU,
    ];

    const geminiThinkingModels = [
        ModelEnum.GEMINI_3_FLASH,
        ModelEnum.GEMINI_3_1_PRO,
        ModelEnum.GEMINI_3_1_FLASH_LITE,
    ];

    const openaiReasoningModels = [
        ModelEnum.GPT_5_4,
        ModelEnum.GPT_5_4_PRO,
        ModelEnum.GPT_5_4_MINI,
        ModelEnum.GPT_5_4_NANO,
    ];

    return [
        ...deepseekReasoningModels,
        ...anthropicReasoningModels,
        ...geminiThinkingModels,
        ...openaiReasoningModels,
    ].includes(model);
};

export const supportsTools = (model: ModelEnum): boolean => {
    const openaiToolModels = [
        ModelEnum.GPT_5_4,
        ModelEnum.GPT_5_4_PRO,
        ModelEnum.GPT_5_4_MINI,
        ModelEnum.GPT_5_4_NANO,
        ModelEnum.GPT_OSS_120B,
        ModelEnum.GPT_OSS_20B,
    ];

    const anthropicToolModels = [
        ModelEnum.CLAUDE_4_6_OPUS,
        ModelEnum.CLAUDE_4_6_SONNET,
        ModelEnum.CLAUDE_4_5_HAIKU,
    ];

    const googleToolModels = [
        ModelEnum.GEMINI_3_FLASH,
        ModelEnum.GEMINI_3_1_PRO,
        ModelEnum.GEMINI_3_1_FLASH_LITE,
    ];

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

    const xaiToolModels = [ModelEnum.GROK_3, ModelEnum.GROK_3_MINI, ModelEnum.GROK_4];

    return [
        ...openaiToolModels,
        ...anthropicToolModels,
        ...googleToolModels,
        ...openrouterToolModels,
        ...xaiToolModels,
    ].includes(model);
};

export const supportsWebSearch = (model: ModelEnum): boolean => {
    const nonWebSearchModels: ModelEnum[] = [];
    return !nonWebSearchModels.includes(model);
};

export const getReasoningType = (model: ModelEnum): ReasoningType => {
    const geminiThinkingModels = [
        ModelEnum.GEMINI_3_FLASH,
        ModelEnum.GEMINI_3_1_PRO,
        ModelEnum.GEMINI_3_1_FLASH_LITE,
    ];

    if (geminiThinkingModels.includes(model)) {
        return ReasoningType.GeminiThinking;
    }

    const openaiReasoningModels = [
        ModelEnum.GPT_5_4,
        ModelEnum.GPT_5_4_PRO,
        ModelEnum.GPT_5_4_MINI,
        ModelEnum.GPT_5_4_NANO,
    ];

    if (openaiReasoningModels.includes(model)) {
        return ReasoningType.OpenAIReasoning;
    }

    const deepseekReasoningModels = [
        ModelEnum.DEEPSEEK_R1_FIREWORKS,
        ModelEnum.DEEPSEEK_R1,
    ];

    if (deepseekReasoningModels.includes(model)) {
        return ReasoningType.DeepSeekReasoning;
    }

    const anthropicReasoningModels = [
        ModelEnum.CLAUDE_4_6_OPUS,
        ModelEnum.CLAUDE_4_6_SONNET,
        ModelEnum.CLAUDE_4_5_HAIKU,
    ];

    if (anthropicReasoningModels.includes(model)) {
        return ReasoningType.AnthropicReasoning;
    }

    return ReasoningType.None;
};

export const getReasoningTagName = (model: ModelEnum): ReasoningTagName => {
    const reasoningType = getReasoningType(model);

    switch (reasoningType) {
        case ReasoningType.GeminiThinking:
            return 'thought';
        case ReasoningType.OpenAIReasoning:
            return 'think';
        case ReasoningType.DeepSeekReasoning:
            return 'think';
        case ReasoningType.AnthropicReasoning:
            return 'thinking';
        default:
            return null;
    }
};

const estimateTokensByWordCount = (text: string): number => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount * 1.3);
};

const estimateTokensForMessages = (messages: CoreMessage[]): number => {
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
