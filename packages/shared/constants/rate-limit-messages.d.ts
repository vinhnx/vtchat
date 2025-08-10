/**
 * Rate limit error message constants
 * Centralized location for all rate limit error messages to avoid hard-coded strings
 */
export declare const RATE_LIMIT_MESSAGES: {
    readonly DAILY_LIMIT_SIGNED_IN: "You have reached the daily limit of requests. Please try again tomorrow or use your own API key. Upgrade to VT+ for unlimited usage and advanced features!";
    readonly DAILY_LIMIT_SIGNED_OUT: "You have reached the daily limit of requests. Please sign in to enjoy more requests, or upgrade to VT+ for unlimited usage!";
    readonly DAILY_LIMIT_VT_PLUS: "You have reached your VT+ daily limit (100 requests) for free Gemini 2.5 Flash Lite. Please try again tomorrow or set up your own Gemini API key for unlimited usage!";
    readonly MINUTE_LIMIT_SIGNED_IN: "You have reached the rate limit for requests per minute. Please try again in 1 minute or use your own API key. Upgrade to VT+ for unlimited usage!";
    readonly MINUTE_LIMIT_SIGNED_OUT: "You have reached the rate limit for requests per minute. Please sign in for more requests, or upgrade to VT+ for unlimited usage!";
    readonly MINUTE_LIMIT_VT_PLUS: "You have reached your VT+ rate limit (10 requests per minute) for free Gemini 2.5 Flash Lite. Please wait 1 minute or set up your own Gemini API key for unlimited usage!";
};
/**
 * Helper functions to get appropriate rate limit messages
 */
export declare const getRateLimitMessage: {
    readonly dailyLimit: (isSignedIn: boolean, isVtPlus?: boolean) => string;
    readonly minuteLimit: (isSignedIn: boolean, isVtPlus?: boolean) => string;
};
//# sourceMappingURL=rate-limit-messages.d.ts.map