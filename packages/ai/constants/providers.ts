/**
 * AI Provider constants and types
 * Separated to avoid circular dependencies
 */

export const Providers = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    TOGETHER: 'together',
    GOOGLE: 'google',
    FIREWORKS: 'fireworks',
    XAI: 'xai',
    OPENROUTER: 'openrouter',
    LMSTUDIO: 'lmstudio',
    OLLAMA: 'ollama',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];
