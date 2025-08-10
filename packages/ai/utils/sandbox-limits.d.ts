/**
 * E2B Sandbox Rate Limiting and Premium Gating Utilities
 * Implements cost-efficient sandbox management for VT Chat
 */
/**
 * Check if user has VT+ subscription
 * Throws error if user is not VT+ subscriber
 */
export declare function requireVTPlusUser(): Promise<void>;
/**
 * Check sandbox rate limits for the current user
 * Throws error if daily limit exceeded
 */
export declare function checkSandboxRateLimit(): Promise<void>;
/**
 * Track successful sandbox usage
 * Increments the daily counter
 */
export declare function trackSandboxUsage(): Promise<void>;
/**
 * Get sandbox usage statistics for the current user
 */
export declare function getSandboxUsageStats(): Promise<{
    todayUsage: number;
    dailyLimit: number;
    remainingToday: number;
}>;
//# sourceMappingURL=sandbox-limits.d.ts.map