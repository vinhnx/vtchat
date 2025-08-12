/**
 * API key constants for different providers
 */
export const API_KEY_NAMES = {
    OPENAI: 'OPENAI_API_KEY',
    ANTHROPIC: 'ANTHROPIC_API_KEY',
    GOOGLE: 'GEMINI_API_KEY',
} as const;

export type ApiKeyName = (typeof API_KEY_NAMES)[keyof typeof API_KEY_NAMES];
