/**
 * Global rate-limit numbers used in UI copy and backend logic.
 * Single source of truth for all Gemini model rate limiting.
 *
 * NOTE: Only VT+ users get server-funded access. FREE limits are unused
 * for server-funded access (free users must use BYOK).
 *
 * Updated limits based on current VT+ offering and usage patterns.
 */
export declare const GEMINI_LIMITS: {
    readonly FLASH_LITE: {
        readonly FREE_DAY: 20;
        readonly PLUS_DAY: 100;
        readonly FREE_MINUTE: 5;
        readonly PLUS_MINUTE: 10;
    };
    readonly FLASH: {
        readonly FREE_DAY: 10;
        readonly PLUS_DAY: 50;
        readonly FREE_MINUTE: 3;
        readonly PLUS_MINUTE: 8;
    };
    readonly PRO: {
        readonly FREE_DAY: 5;
        readonly PLUS_DAY: 25;
        readonly FREE_MINUTE: 2;
        readonly PLUS_MINUTE: 5;
    };
    readonly FLASH_2_0: {
        readonly FREE_DAY: 10;
        readonly PLUS_DAY: 50;
        readonly FREE_MINUTE: 3;
        readonly PLUS_MINUTE: 8;
    };
    readonly FLASH_LITE_2_0: {
        readonly FREE_DAY: 20;
        readonly PLUS_DAY: 100;
        readonly FREE_MINUTE: 5;
        readonly PLUS_MINUTE: 10;
    };
};
/**
 * Estimated cost per request in USD (rough flat estimate)
 * Used for budget tracking and cost projections
 *
 * Based on official Gemini API pricing as of July 2025:
 * - Gemini 2.0 Flash-Lite: $0.075/1M input + $0.30/1M output tokens
 * - Gemini 2.0 Flash: $0.10/1M input + $0.40/1M output tokens
 * - Gemini 2.5 Flash-Lite: $0.10/1M input + $0.40/1M output tokens
 * - Gemini 2.5 Flash: $0.30/1M input + $2.50/1M output tokens
 * - Gemini 2.5 Pro: $1.25/1M input + $10.00/1M output tokens (≤200k prompts)
 *
 * Estimates assume ~1000 input + 500 output tokens per typical request:
 * - Flash-Lite: ($0.10 * 1k + $0.40 * 0.5k) / 1M = $0.0003 → rounded up to $0.005 (0.5 cents)
 * - Flash: ($0.30 * 1k + $2.50 * 0.5k) / 1M = $0.00155 → rounded up to $0.01 (1 cent)
 * - Pro: ($1.25 * 1k + $10.00 * 0.5k) / 1M = $0.00625 → rounded up to $0.015 (1.5 cents)
 *
 * Note: Prices rounded up to ensure non-zero cost tracking when converted to cents
 */
export declare const GEMINI_PRICES: {
    readonly FLASH_LITE: 0.005;
    readonly FLASH: 0.01;
    readonly PRO: 0.015;
    readonly "gemini-2.5-flash-lite-preview-06-17": 0.005;
};
/**
 * Budget constraints for Gemini API usage
 */
export declare const BUDGET_LIMITS: {
    readonly MONTHLY_CAP_USD: 80;
    readonly WARNING_THRESHOLD: 0.8;
};
/**
 * @deprecated Use GEMINI_LIMITS.FLASH_LITE instead
 */
export declare const GEMINI_FLASH_LIMITS: {
    readonly FREE_DAY: 20;
    readonly PLUS_DAY: 100;
    readonly FREE_MINUTE: 5;
    readonly PLUS_MINUTE: 10;
};
/**
 * Helper functions for consistent UI copy formatting.
 * Keeps UI components DRY and ensures consistent messaging.
 */
export declare const limitText: {
    readonly free: (model?: keyof typeof GEMINI_LIMITS) => string;
    readonly plus: (model?: keyof typeof GEMINI_LIMITS) => string;
    readonly compare: (model?: keyof typeof GEMINI_LIMITS) => string;
};
//# sourceMappingURL=rate-limits.d.ts.map