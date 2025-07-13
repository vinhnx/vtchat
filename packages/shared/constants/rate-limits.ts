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
 */
export const GEMINI_PRICES = {
    FLASH_LITE: 0.00025,
    FLASH: 0.002,
    PRO: 0.01,
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
    free: (model: keyof typeof GEMINI_LIMITS = "FLASH_LITE") =>
        `${GEMINI_LIMITS[model].FREE_DAY} requests/day, ${GEMINI_LIMITS[model].FREE_MINUTE}/min`,
    plus: (model: keyof typeof GEMINI_LIMITS = "FLASH_LITE") =>
        `${GEMINI_LIMITS[model].PLUS_DAY} requests/day, ${GEMINI_LIMITS[model].PLUS_MINUTE}/min`,
    compare: (model: keyof typeof GEMINI_LIMITS = "FLASH_LITE") =>
        `${limitText.plus(model)} vs ${GEMINI_LIMITS[model].FREE_DAY}/day, ${GEMINI_LIMITS[model].FREE_MINUTE}/min`,
} as const;
