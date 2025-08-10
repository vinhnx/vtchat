/**
 * Constants for AI reasoning functionality
 */
/**
 * Types of reasoning implementations supported by different providers
 */
export declare const ReasoningType: {
    readonly DEEPSEEK_REASONING: "deepseek-reasoning";
    readonly ANTHROPIC_REASONING: "anthropic-reasoning";
    readonly GEMINI_THINKING: "gemini-thinking";
    readonly NONE: "none";
};
export type ReasoningType = (typeof ReasoningType)[keyof typeof ReasoningType];
/**
 * Reasoning tag names used by different providers
 */
export declare const ReasoningTagName: {
    readonly THINK: "think";
    readonly THINKING: "thinking";
};
export type ReasoningTagName = (typeof ReasoningTagName)[keyof typeof ReasoningTagName];
/**
 * Store and configuration keys
 */
export declare const StoreKeys: {
    readonly THINKING_MODE: "thinkingMode";
    readonly API_KEYS: "[REDACTED:api-key]";
};
export type StoreKeys = (typeof StoreKeys)[keyof typeof StoreKeys];
/**
 * Reasoning middleware configuration
 */
export declare const REASONING_CONFIG: {
    readonly DEEPSEEK_TAG: "think";
    readonly ANTHROPIC_TAG: "thinking";
    readonly SEPARATOR: "\n";
};
/**
 * Default reasoning budgets for different levels
 */
export declare const REASONING_BUDGETS: {
    readonly QUICK: 1000;
    readonly BALANCED: 15000;
    readonly DEEP: 50000;
};
/**
 * Claude 4 specific configuration
 */
export declare const CLAUDE_4_CONFIG: {
    readonly DEFAULT_THINKING_BUDGET: 15000;
    readonly BETA_HEADER: "interleaved-thinking-2025-05-14";
    readonly BETA_HEADER_KEY: "anthropic-beta";
    readonly SUPPORTS_TOOL_THINKING: true;
};
//# sourceMappingURL=reasoning.d.ts.map