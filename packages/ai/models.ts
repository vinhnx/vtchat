import { ChatMode } from '@repo/shared/config';
import { CoreMessage } from 'ai';
import { ProviderEnumType } from './providers';

export enum ModelEnum {
    CLAUDE_4_SONNET = 'claude-sonnet-4-20250514',
    Deepseek_R1 = 'accounts/fireworks/models/deepseek-r1-0528',
    GEMINI_2_0_FLASH = 'gemini-2.0-flash',
    GEMINI_2_0_FLASH_LITE = 'gemini-2.0-flash-lite',
    GEMINI_2_5_FLASH_PREVIEW = 'gemini-2.5-flash-preview-05-20',
    GEMINI_2_5_PRO = 'gemini-2.5-pro-preview-05-06',
    GEMINI_2_5_PRO_PREVIEW = 'gemini-2.5-pro-preview-06-05',
    CLAUDE_4_OPUS = 'claude-opus-4-20250514',
    GPT_4o_Mini = 'gpt-4o-mini',
    GPT_4o = 'gpt-4o',
    GPT_4_1_Mini = 'gpt-4.1-mini',
    GPT_4_1_Nano = 'gpt-4.1-nano',
    GPT_4_1 = 'gpt-4.1',
    O4_Mini = 'o4-mini',
}

export type Model = {
    id: ModelEnum;
    name: string;
    provider: ProviderEnumType;
    maxTokens: number;
    contextWindow: number;
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
        id: ModelEnum.GPT_4o,
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 16_384,
        contextWindow: 128_000,
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
        id: ModelEnum.GEMINI_2_0_FLASH,
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_0_FLASH_LITE,
        name: 'Gemini 2.0 Flash Lite',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_5_FLASH_PREVIEW,
        name: 'Gemini 2.5 Flash Preview',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_5_PRO,
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
    {
        id: ModelEnum.GEMINI_2_5_PRO_PREVIEW,
        name: 'Gemini 2.5 Pro Preview',
        provider: 'google',
        maxTokens: 1_048_576,
        contextWindow: 1_048_576,
    },
];

export const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.Deep:
            return ModelEnum.GEMINI_2_5_FLASH_PREVIEW;
        case ChatMode.Pro:
            return ModelEnum.GEMINI_2_0_FLASH;
        case ChatMode.GEMINI_2_0_FLASH:
            return ModelEnum.GEMINI_2_0_FLASH;
        case ChatMode.GEMINI_2_0_FLASH_LITE:
            return ModelEnum.GEMINI_2_0_FLASH_LITE;
        case ChatMode.GEMINI_2_5_FLASH_PREVIEW:
            return ModelEnum.GEMINI_2_5_FLASH_PREVIEW;
        case ChatMode.GEMINI_2_5_PRO:
            return ModelEnum.GEMINI_2_5_PRO;
        case ChatMode.GEMINI_2_5_PRO_PREVIEW:
            return ModelEnum.GEMINI_2_5_PRO_PREVIEW;
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
        case ChatMode.O4_Mini:
            return ModelEnum.O4_Mini;
        default:
            return ModelEnum.GEMINI_2_0_FLASH;
    }
};

export const getChatModeMaxTokens = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Pro:
        case ChatMode.Deep:
        case ChatMode.GEMINI_2_0_FLASH:
        case ChatMode.GEMINI_2_0_FLASH_LITE:
        case ChatMode.GEMINI_2_5_FLASH_PREVIEW:
        case ChatMode.GEMINI_2_5_PRO:
        case ChatMode.GEMINI_2_5_PRO_PREVIEW:
            return 1_048_576;
        case ChatMode.DEEPSEEK_R1:
            return 128_000;
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
            return 200_000;
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
            return 200_000;
        case ChatMode.GPT_4o:
            return 128_000;
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1:
            return 1_047_576;
        case ChatMode.Deep:
            return 100_000;
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
        ModelEnum.GEMINI_2_0_FLASH,
        ModelEnum.GEMINI_2_0_FLASH_LITE,
        ModelEnum.GEMINI_2_5_FLASH_PREVIEW,
        ModelEnum.GEMINI_2_5_PRO,
        ModelEnum.GEMINI_2_5_PRO_PREVIEW,
    ];

    return googleModels.includes(model);
};

export const trimMessageHistoryEstimated = (messages: CoreMessage[], chatMode: ChatMode) => {
    const maxTokens = getChatModeMaxTokens(chatMode);
    let trimmedMessages = [...messages];

    if (trimmedMessages.length <= 1) {
        const tokenCount = estimateTokensForMessages(trimmedMessages);
        return { trimmedMessages, tokenCount };
    }

    const latestMessage = trimmedMessages.pop()!;

    const messageSizes = trimmedMessages.map(msg => {
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

    trimmedMessages = messageSizes.map(item => item.message);
    trimmedMessages.push(latestMessage);

    return { trimmedMessages, tokenCount: totalTokens };
};
