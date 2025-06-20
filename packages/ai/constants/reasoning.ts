/**
 * Constants for AI reasoning functionality
 */

/**
 * Types of reasoning implementations supported by different providers
 */
export enum ReasoningType {
    DEEPSEEK_REASONING = 'deepseek-reasoning',
    ANTHROPIC_REASONING = 'anthropic-reasoning', 
    GEMINI_THINKING = 'gemini-thinking',
    NONE = 'none'
}

/**
 * Reasoning tag names used by different providers
 */
export enum ReasoningTagName {
    THINK = 'think',
    THINKING = 'thinking'
}

/**
 * Store and configuration keys
 */
export enum StoreKeys {
    THINKING_MODE = 'thinkingMode',
    API_KEYS = 'apiKeys'
}

/**
 * Reasoning middleware configuration
 */
export const REASONING_CONFIG = {
    DEEPSEEK_TAG: ReasoningTagName.THINK,
    ANTHROPIC_TAG: ReasoningTagName.THINKING,
    SEPARATOR: '\n'
} as const;

/**
 * Default reasoning budgets for different levels
 */
export const REASONING_BUDGETS = {
    QUICK: 1000,
    BALANCED: 25000,
    DEEP: 50000
} as const;
