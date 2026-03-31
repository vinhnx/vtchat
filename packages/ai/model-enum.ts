export const ModelEnum = {
    // Claude models (latest)
    CLAUDE_4_6_OPUS: 'claude-opus-4-6',
    CLAUDE_4_6_SONNET: 'claude-sonnet-4-6',
    CLAUDE_4_5_HAIKU: 'claude-haiku-4-5',
    // Gemini models (latest)
    GEMINI_3_1_PRO: 'gemini-3.1-pro-preview',
    GEMINI_3_FLASH: 'gemini-3-flash-preview',
    GEMINI_3_1_FLASH_LITE: 'gemini-3.1-flash-lite-preview',
    // OpenAI models (latest)
    GPT_5_4: 'gpt-5.4',
    GPT_5_4_PRO: 'gpt-5.4-pro',
    GPT_5_4_MINI: 'gpt-5.4-mini',
    GPT_5_4_NANO: 'gpt-5.4-nano',
} as const;

export type ModelEnum = (typeof ModelEnum)[keyof typeof ModelEnum];
