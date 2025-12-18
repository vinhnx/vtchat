/**
 * Rate limit error message constants
 * Centralized location for all rate limit error messages to avoid hard-coded strings
 */

export const RATE_LIMIT_MESSAGES = {
    // Daily limit messages
    DAILY_LIMIT_SIGNED_IN:
        'You have reached the daily limit of requests. Please try again tomorrow or use your own API key. Upgrade to VT+ for unlimited usage and advanced features!',
    DAILY_LIMIT_SIGNED_OUT:
        'You have reached the daily limit of requests. Please sign in to enjoy more requests, or upgrade to VT+ for unlimited usage!',
    DAILY_LIMIT_VT_PLUS:
        'You have reached your VT+ daily limit (100 requests) for free Gemini 3 Flash Lite. Please try again tomorrow or set up your own Gemini API key for unlimited usage!',

    // Per-minute limit messages
    MINUTE_LIMIT_SIGNED_IN:
        'You have reached the rate limit for requests per minute. Please try again in 1 minute or use your own API key. Upgrade to VT+ for unlimited usage!',
    MINUTE_LIMIT_SIGNED_OUT:
        'You have reached the rate limit for requests per minute. Please sign in for more requests, or upgrade to VT+ for unlimited usage!',
    MINUTE_LIMIT_VT_PLUS:
        'You have reached your VT+ rate limit (10 requests per minute) for free Gemini 3 Flash Lite. Please wait 1 minute or set up your own Gemini API key for unlimited usage!',
} as const;

/**
 * Helper functions to get appropriate rate limit messages
 */
export const getRateLimitMessage = {
    dailyLimit: (isSignedIn: boolean, isVtPlus: boolean = false): string => {
        if (isVtPlus) {
            return RATE_LIMIT_MESSAGES.DAILY_LIMIT_VT_PLUS;
        }
        return isSignedIn
            ? RATE_LIMIT_MESSAGES.DAILY_LIMIT_SIGNED_IN
            : RATE_LIMIT_MESSAGES.DAILY_LIMIT_SIGNED_OUT;
    },

    minuteLimit: (isSignedIn: boolean, isVtPlus: boolean = false): string => {
        if (isVtPlus) {
            return RATE_LIMIT_MESSAGES.MINUTE_LIMIT_VT_PLUS;
        }
        return isSignedIn
            ? RATE_LIMIT_MESSAGES.MINUTE_LIMIT_SIGNED_IN
            : RATE_LIMIT_MESSAGES.MINUTE_LIMIT_SIGNED_OUT;
    },
} as const;
