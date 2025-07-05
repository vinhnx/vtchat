/**
 * Global rate-limit numbers used in UI copy and backend logic.
 * Single source of truth for all Gemini Flash Lite rate limiting.
 */
export const GEMINI_FLASH_LIMITS = {
    FREE_DAY: 20,
    FREE_MINUTE: 5,
    PLUS_DAY: 100,
    PLUS_MINUTE: 10,
} as const;

/**
 * Helper functions for consistent UI copy formatting.
 * Keeps UI components DRY and ensures consistent messaging.
 */
export const limitText = {
    free: () =>
        `${GEMINI_FLASH_LIMITS.FREE_DAY} requests/day, ${GEMINI_FLASH_LIMITS.FREE_MINUTE}/min`,
    plus: () =>
        `${GEMINI_FLASH_LIMITS.PLUS_DAY} requests/day, ${GEMINI_FLASH_LIMITS.PLUS_MINUTE}/min`,
    compare: () =>
        `${limitText.plus()} vs ${GEMINI_FLASH_LIMITS.FREE_DAY}/day, ${GEMINI_FLASH_LIMITS.FREE_MINUTE}/min`,
} as const;
