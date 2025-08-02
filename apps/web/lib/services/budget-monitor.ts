import { log } from "@repo/shared/logger";

/**
 * Check if Gemini models should be disabled due to budget constraints
 * Since cost tracking has been removed, this now always allows requests
 * Rate limiting is handled separately via the rate-limit service
 */
export async function shouldDisableGemini(): Promise<{
    shouldDisable: boolean;
    status: "ok" | "warning" | "exceeded";
    reason?: string;
}> {
    // Since we've removed cost tracking, budget monitoring is disabled
    // Rate limiting is handled separately in rate-limit.ts
    // Always allow requests - budget control is now handled externally
    log.debug("Budget monitoring disabled - cost tracking removed, using rate limits only");

    return {
        shouldDisable: false,
        status: "ok",
        reason: undefined,
    };
}

/**
 * Force refresh the budget status cache
 * Since budget monitoring is disabled, this is a no-op
 */
export function refreshBudgetCache(): void {
    log.debug("Budget cache refresh called - budget monitoring is disabled");
}

/**
 * Get current budget status without caching
 * Since budget monitoring is disabled, always returns OK status
 */
export async function getCurrentBudgetStatus() {
    log.debug("Budget status requested - budget monitoring is disabled");
    return {
        shouldDisable: false,
        status: "ok" as const,
        totalCostUSD: 0,
        budgetLimitUSD: 0,
        percentageUsed: 0,
    };
}
