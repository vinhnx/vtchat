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
    // xAI Grok models
    GROK_4: 'grok-4',
    GROK_3: 'grok-3',
    GROK_3_MINI: 'grok-3-mini',
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
