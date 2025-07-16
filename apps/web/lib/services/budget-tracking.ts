import { ModelEnum } from "@repo/ai/models";
import { BUDGET_LIMITS, GEMINI_PRICES } from "@repo/shared/constants/rate-limits";
import { log } from "@repo/shared/logger";
import { isGeminiModel } from "@repo/shared/utils";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/database";
import { providerUsage } from "@/lib/database/schema";

/**
 * Record a request for budget tracking and cost monitoring
 * This should be called after a successful API request to track usage costs
 */
export async function recordProviderUsage(
    userId: string,
    modelId: ModelEnum,
    provider: string = "gemini",
): Promise<void> {
    // Only track costs for models we have pricing data for
    if (!isGeminiModel(modelId)) {
        return; // Don't track costs for non-Gemini models
    }

    // Get estimated cost based on model
    let estimatedCostCents = 0;

    switch (modelId) {
        case ModelEnum.GEMINI_2_5_FLASH_LITE:
            estimatedCostCents = Math.round(GEMINI_PRICES.FLASH_LITE * 100);
            break;
        case "gemini-2.5-flash-lite-preview-06-17":
            estimatedCostCents = Math.round(
                GEMINI_PRICES["gemini-2.5-flash-lite-preview-06-17"] * 100,
            );
            break;
        case ModelEnum.GEMINI_2_5_FLASH:
            estimatedCostCents = Math.round(GEMINI_PRICES.FLASH * 100);
            break;
        case ModelEnum.GEMINI_2_5_PRO:
            estimatedCostCents = Math.round(GEMINI_PRICES.PRO * 100);
            break;
        default:
            return; // Unknown model, don't track
    }

    try {
        await db.insert(providerUsage).values({
            userId,
            modelId,
            provider,
            estimatedCostCents,
            requestTimestamp: new Date(),
        });

        log.info(
            {
                userId,
                modelId,
                provider,
                estimatedCostCents,
                estimatedCostUSD: estimatedCostCents / 100,
            },
            "Recorded provider usage for budget tracking",
        );
    } catch (error) {
        log.error({ error, userId, modelId }, "Failed to record provider usage");
        // Don't throw - budget tracking failure shouldn't break the main request
    }
}

/**
 * Get monthly spending for budget monitoring
 * Returns total cost in USD for the current month
 */
export async function getMonthlySpend(
    provider: string = "gemini",
    month: Date = new Date(),
): Promise<{ totalCostUSD: number; requestCount: number }> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const result = await db
            .select({
                totalCostCents: sql<number>`COALESCE(SUM(${providerUsage.estimatedCostCents}), 0)`,
                requestCount: sql<number>`COUNT(*)`,
            })
            .from(providerUsage)
            .where(
                and(
                    eq(providerUsage.provider, provider),
                    gte(providerUsage.requestTimestamp, startOfMonth),
                    sql`${providerUsage.requestTimestamp} <= ${endOfMonth}`,
                ),
            );

        const { totalCostCents, requestCount } = result[0] || {
            totalCostCents: 0,
            requestCount: 0,
        };

        return {
            totalCostUSD: totalCostCents / 100,
            requestCount: Number(requestCount),
        };
    } catch (error) {
        log.error({ error, provider, month }, "Failed to get monthly spend");
        return { totalCostUSD: 0, requestCount: 0 };
    }
}

/**
 * Check if we're approaching or exceeding budget limits
 * Returns budget status and recommendations
 */
export async function checkBudgetStatus(
    provider: string = "gemini",
    month: Date = new Date(),
): Promise<{
    status: "ok" | "warning" | "exceeded";
    totalCostUSD: number;
    budgetLimitUSD: number;
    percentageUsed: number;
    shouldDisable: boolean;
    requestCount: number;
}> {
    const { totalCostUSD, requestCount } = await getMonthlySpend(provider, month);
    const budgetLimitUSD = BUDGET_LIMITS.MONTHLY_CAP_USD;
    const percentageUsed = (totalCostUSD / budgetLimitUSD) * 100;

    let status: "ok" | "warning" | "exceeded";
    let shouldDisable = false;

    if (percentageUsed >= 100) {
        status = "exceeded";
        shouldDisable = true;
    } else if (percentageUsed >= BUDGET_LIMITS.WARNING_THRESHOLD * 100) {
        status = "warning";
        shouldDisable = false;
    } else {
        status = "ok";
        shouldDisable = false;
    }

    return {
        status,
        totalCostUSD,
        budgetLimitUSD,
        percentageUsed,
        shouldDisable,
        requestCount,
    };
}

/**
 * Get user-specific spending for the current month
 * Useful for per-user analytics and debugging
 */
export async function getUserMonthlySpend(
    userId: string,
    provider: string = "gemini",
    month: Date = new Date(),
): Promise<{
    totalCostUSD: number;
    requestCount: number;
    modelBreakdown: Record<string, { cost: number; count: number }>;
}> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const result = await db
            .select({
                modelId: providerUsage.modelId,
                totalCostCents: sql<number>`SUM(${providerUsage.estimatedCostCents})`,
                requestCount: sql<number>`COUNT(*)`,
            })
            .from(providerUsage)
            .where(
                and(
                    eq(providerUsage.userId, userId),
                    eq(providerUsage.provider, provider),
                    gte(providerUsage.requestTimestamp, startOfMonth),
                    sql`${providerUsage.requestTimestamp} <= ${endOfMonth}`,
                ),
            )
            .groupBy(providerUsage.modelId);

        let totalCostUSD = 0;
        let totalRequestCount = 0;
        const modelBreakdown: Record<string, { cost: number; count: number }> = {};

        for (const row of result) {
            const costUSD = Number(row.totalCostCents) / 100;
            const count = Number(row.requestCount);

            totalCostUSD += costUSD;
            totalRequestCount += count;

            modelBreakdown[row.modelId] = {
                cost: costUSD,
                count,
            };
        }

        return {
            totalCostUSD,
            requestCount: totalRequestCount,
            modelBreakdown,
        };
    } catch (error) {
        log.error({ error, userId, provider, month }, "Failed to get user monthly spend");
        return { totalCostUSD: 0, requestCount: 0, modelBreakdown: {} };
    }
}

/**
 * Check if Gemini models should be disabled due to budget limits
 * This can be called before processing requests to enforce budget caps
 */
export async function shouldDisableGeminiModels(): Promise<boolean> {
    const budgetStatus = await checkBudgetStatus("gemini");
    return budgetStatus.shouldDisable;
}
