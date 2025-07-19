/**
 * Timeout constants for generation tracking and loading indicators
 */

export const GENERATION_TIMEOUTS = {
    /** Show timeout indicator after this duration (ms) */
    TIMEOUT_THRESHOLD: 5000,

    /** Consider response slow after this duration (ms) */
    SLOW_RESPONSE_THRESHOLD: 10000,

    /** Show critical timeout warning after this duration (ms) */
    CRITICAL_TIMEOUT_THRESHOLD: 20000,

    /** Update interval for elapsed time display (ms) */
    ELAPSED_TIME_UPDATE_INTERVAL: 100,
} as const;

/**
 * Loading indicator messages for different timeout states
 */
export const TIMEOUT_MESSAGES = {
    GENERATING: 'AI is generating response...',
    TIMEOUT_WARNING: 'Processing is taking longer than usual...',
    SLOW_RESPONSE: 'Slow response detected...',
    CRITICAL_TIMEOUT: 'Very slow response - you may want to try again...',
} as const;

/**
 * Loading states based on generation progress
 */
export const LOADING_STATES = {
    NORMAL: 'normal',
    TIMEOUT: 'timeout',
    SLOW: 'slow',
    CRITICAL: 'critical',
} as const;

export type LoadingState = (typeof LOADING_STATES)[keyof typeof LOADING_STATES];
