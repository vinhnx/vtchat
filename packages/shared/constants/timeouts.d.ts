/**
 * Timeout constants for generation tracking and loading indicators
 */
export declare const GENERATION_TIMEOUTS: {
    /** Show timeout indicator after this duration (ms) */
    readonly TIMEOUT_THRESHOLD: 5000;
    /** Consider response slow after this duration (ms) */
    readonly SLOW_RESPONSE_THRESHOLD: 10000;
    /** Show critical timeout warning after this duration (ms) */
    readonly CRITICAL_TIMEOUT_THRESHOLD: 20000;
    /** Update interval for elapsed time display (ms) */
    readonly ELAPSED_TIME_UPDATE_INTERVAL: 100;
};
/**
 * Loading indicator messages for different timeout states
 */
export declare const TIMEOUT_MESSAGES: {
    readonly GENERATING: "AI is generating response...";
    readonly TIMEOUT_WARNING: "Processing is taking longer than usual...";
    readonly SLOW_RESPONSE: "Slow response detected...";
    readonly CRITICAL_TIMEOUT: "Very slow response - you may want to try again...";
};
/**
 * Loading states based on generation progress
 */
export declare const LOADING_STATES: {
    readonly NORMAL: "normal";
    readonly TIMEOUT: "timeout";
    readonly SLOW: "slow";
    readonly CRITICAL: "critical";
};
export type LoadingState = (typeof LOADING_STATES)[keyof typeof LOADING_STATES];
//# sourceMappingURL=timeouts.d.ts.map