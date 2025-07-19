/**
 * Constants for AI reasoning functionality
 */

/**
 * Types of reasoning implementations supported by different providers
 */
export const ReasoningType = {
    DEEPSEEK_REASONING: "deepseek-reasoning",
    ANTHROPIC_REASONING: "anthropic-reasoning",
    GEMINI_THINKING: "gemini-thinking",
    NONE: "none",
} as const;

export type ReasoningType = (typeof ReasoningType)[keyof typeof ReasoningType];

/**
 * Reasoning tag names used by different providers
 */
export const ReasoningTagName = {
    THINK: "think",
    THINKING: "thinking",
} as const;

export type ReasoningTagName = (typeof ReasoningTagName)[keyof typeof ReasoningTagName];

/**
 * Store and configuration keys
 */
export const StoreKeys = {
    THINKING_MODE: "thinkingMode",
    API_KEYS: "[REDACTED:api-key]",
} as const;

export type StoreKeys = (typeof StoreKeys)[keyof typeof StoreKeys];

/**
 * Reasoning middleware configuration
 */
export const REASONING_CONFIG = {
    DEEPSEEK_TAG: ReasoningTagName.THINK,
    ANTHROPIC_TAG: ReasoningTagName.THINKING,
    SEPARATOR: "\n",
} as const;

/**
 * Default reasoning budgets for different levels
 */
export const REASONING_BUDGETS = {
    QUICK: 1000,
    BALANCED: 15_000,
    DEEP: 50_000,
} as const;

/**
 * Claude 4 specific configuration
 */
export const CLAUDE_4_CONFIG = {
    DEFAULT_THINKING_BUDGET: 15_000,
    BETA_HEADER: "interleaved-thinking-2025-05-14",
    BETA_HEADER_KEY: "anthropic-beta",
    SUPPORTS_TOOL_THINKING: true,
} as const;
