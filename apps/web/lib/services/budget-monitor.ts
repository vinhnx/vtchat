import { log } from "@repo/shared/logger";
import { checkBudgetStatus } from "./budget-tracking";

/**
 * Cache for budget status to avoid excessive database queries
 * Budget status is checked every 6 hours max
 */
let budgetStatusCache: {
    shouldDisable: boolean;
    lastChecked: Date;
    status: "ok" | "warning" | "exceeded";
} | null = null;

const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes for tight budget control

/**
 * Check if Gemini models should be disabled due to budget constraints
 * Uses caching to avoid excessive database queries
 */
export async function shouldDisableGemini(): Promise<{
    shouldDisable: boolean;
    status: "ok" | "warning" | "exceeded";
    reason?: string;
}> {
    const now = new Date();

    // Check cache first
    if (
        budgetStatusCache &&
        now.getTime() - budgetStatusCache.lastChecked.getTime() < CACHE_DURATION_MS
    ) {
        return {
            shouldDisable: budgetStatusCache.shouldDisable,
            status: budgetStatusCache.status,
            reason: budgetStatusCache.shouldDisable ? "Monthly budget limit exceeded" : undefined,
        };
    }

    try {
        // Check current budget status
        const budgetStatus = await checkBudgetStatus("gemini");

        // Update cache
        budgetStatusCache = {
            shouldDisable: budgetStatus.shouldDisable,
            lastChecked: now,
            status: budgetStatus.status,
        };

        if (budgetStatus.shouldDisable) {
            log.warn(
                {
                    totalCostUSD: budgetStatus.totalCostUSD,
                    budgetLimitUSD: budgetStatus.budgetLimitUSD,
                    percentageUsed: budgetStatus.percentageUsed,
                },
                "Gemini models disabled due to budget limit exceeded",
            );
        } else if (budgetStatus.status === "warning") {
            log.info(
                {
                    totalCostUSD: budgetStatus.totalCostUSD,
                    budgetLimitUSD: budgetStatus.budgetLimitUSD,
                    percentageUsed: budgetStatus.percentageUsed,
                },
                "Approaching budget limit for Gemini models",
            );
        }

        return {
            shouldDisable: budgetStatus.shouldDisable,
            status: budgetStatus.status,
            reason: budgetStatus.shouldDisable ? "Monthly budget limit exceeded" : undefined,
        };
    } catch (error) {
        log.error({ error }, "Failed to check budget status, allowing requests to continue");

        // On error, allow requests to continue (fail open)
        return {
            shouldDisable: false,
            status: "ok",
        };
    }
}

/**
 * Force refresh the budget status cache
 * Useful for admin functions or after manual budget adjustments
 */
export function refreshBudgetCache(): void {
    budgetStatusCache = null;
    log.info("Budget status cache cleared");
}

/**
 * Get current budget status without caching
 * Useful for admin dashboards that need real-time data
 */
export async function getCurrentBudgetStatus() {
    return await checkBudgetStatus("gemini");
}
