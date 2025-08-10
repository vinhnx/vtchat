/**
 * Constants for AI reasoning functionality
 */
/**
 * Types of reasoning implementations supported by different providers
 */
export var ReasoningType = {
    DEEPSEEK_REASONING: "deepseek-reasoning",
    ANTHROPIC_REASONING: "anthropic-reasoning",
    GEMINI_THINKING: "gemini-thinking",
    NONE: "none",
};
/**
 * Reasoning tag names used by different providers
 */
export var ReasoningTagName = {
    THINK: "think",
    THINKING: "thinking",
};
/**
 * Store and configuration keys
 */
export var StoreKeys = {
    THINKING_MODE: "thinkingMode",
    API_KEYS: "[REDACTED:api-key]",
};
/**
 * Reasoning middleware configuration
 */
export var REASONING_CONFIG = {
    DEEPSEEK_TAG: ReasoningTagName.THINK,
    ANTHROPIC_TAG: ReasoningTagName.THINKING,
    SEPARATOR: "\n",
};
/**
 * Default reasoning budgets for different levels
 */
export var REASONING_BUDGETS = {
    QUICK: 1000,
    BALANCED: 15000,
    DEEP: 50000,
};
/**
 * Claude 4 specific configuration
 */
export var CLAUDE_4_CONFIG = {
    DEFAULT_THINKING_BUDGET: 15000,
    BETA_HEADER: "interleaved-thinking-2025-05-14",
    BETA_HEADER_KEY: "anthropic-beta",
    SUPPORTS_TOOL_THINKING: true,
};
