/**
 * Global rate-limit numbers used in UI copy and backend logic.
 * Single source of truth for all Gemini model rate limiting.
 *
 * NOTE: Only VT+ users get server-funded access. FREE limits are unused
 * for server-funded access (free users must use BYOK).
 *
 * Updated limits based on current VT+ offering and usage patterns.
 */
export const GEMINI_LIMITS = {
    FLASH_LITE: { FREE_DAY: 20, PLUS_DAY: 100, FREE_MINUTE: 5, PLUS_MINUTE: 10 },
    FLASH: { FREE_DAY: 10, PLUS_DAY: 50, FREE_MINUTE: 3, PLUS_MINUTE: 8 },
    PRO: { FREE_DAY: 5, PLUS_DAY: 25, FREE_MINUTE: 2, PLUS_MINUTE: 5 },
    // Gemini 2.0 models use same limits as their 2.5 counterparts
    FLASH_2_0: { FREE_DAY: 10, PLUS_DAY: 50, FREE_MINUTE: 3, PLUS_MINUTE: 8 },
    FLASH_LITE_2_0: { FREE_DAY: 20, PLUS_DAY: 100, FREE_MINUTE: 5, PLUS_MINUTE: 10 },
} as const;

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
export const GEMINI_PRICES = {
    FLASH_LITE: 0.005, // 0.5 cents per request - minimum to ensure non-zero cost tracking
    FLASH: 0.01, // 1 cent per request
    PRO: 0.015, // 1.5 cents per request
    'gemini-2.5-flash-lite': 0.005, // Same as FLASH_LITE
} as const;

/**
 * Budget constraints for Gemini API usage
 */
export const BUDGET_LIMITS = {
    MONTHLY_CAP_USD: 80, // $80/month = 80% of $300/3-month budget
    WARNING_THRESHOLD: 0.8, // 80% of monthly cap
} as const;

/**
 * @deprecated Use GEMINI_LIMITS.FLASH_LITE instead
 */
export const GEMINI_FLASH_LIMITS = GEMINI_LIMITS.FLASH_LITE;

/**
 * Helper functions for consistent UI copy formatting.
 * Keeps UI components DRY and ensures consistent messaging.
 */
export const limitText = {
    free: (model: keyof typeof GEMINI_LIMITS = 'FLASH_LITE') =>
        `${GEMINI_LIMITS[model].FREE_DAY} requests/day, ${GEMINI_LIMITS[model].FREE_MINUTE}/min`,
    plus: (model: keyof typeof GEMINI_LIMITS = 'FLASH_LITE') =>
        `${GEMINI_LIMITS[model].PLUS_DAY} requests/day, ${GEMINI_LIMITS[model].PLUS_MINUTE}/min`,
    compare: (model: keyof typeof GEMINI_LIMITS = 'FLASH_LITE') =>
        `${limitText.plus(model)} vs ${GEMINI_LIMITS[model].FREE_DAY}/day, ${
            GEMINI_LIMITS[model].FREE_MINUTE
        }/min`,
} as const;
