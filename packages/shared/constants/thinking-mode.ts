/**
 * Thinking mode constants for Gemini models
 * Used for configuring AI thinking capabilities
 */

// Thinking budget configuration for Gemini models
export const THINKING_MODE = {
    /** Default thinking budget for Gemini models */
    DEFAULT_BUDGET: 2048,
    /** Minimum thinking budget (0 = disabled) */
    MIN_BUDGET: 0,
    /** Maximum thinking budget for Gemini 2.5 Flash */
    MAX_BUDGET: 24576,
    /** Default setting for enabling thinking mode */
    DEFAULT_ENABLED: true,
    /** Default setting for including thoughts in response */
    DEFAULT_INCLUDE_THOUGHTS: true,
} as const;
