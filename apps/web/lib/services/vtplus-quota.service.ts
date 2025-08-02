import { db } from "@/lib/database";
import { vtplusUsage } from "@/lib/database/schema";
import {
    QUOTA_WINDOW,
    QuotaExceededError,
    VtPlusFeature,
    type QuotaWindow,
} from "@repo/common/config/vtPlusLimits";
import { log } from "@repo/shared/lib/logger";
import type { PlanSlug } from "@repo/shared/types/subscription";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getQuotaConfig } from "./quota-config.service";

/**
 * Rate limiter error messages
 */
const RateLimiterErrorMessage = {
    AMOUNT_MUST_BE_POSITIVE: "Amount must be positive",
    FAILED_TO_CONSUME_QUOTA: "Failed to consume quota",
} as const;

/**
 * Rate limiter log messages
 */
const RateLimiterLogMessage = {
    ATTEMPTING_TO_CONSUME: "Attempting to consume VT+ quota",
    QUOTA_CONSUMED_SUCCESS: "VT+ quota consumed successfully via Drizzle",
    FAILED_TO_CONSUME: "Failed to consume VT+ quota",
} as const;

export interface ConsumeOptions {
    userId: string;
    feature: VtPlusFeature;
    userPlan: PlanSlug; // User's current subscription plan
    amount?: number; // default 1
}

export interface UsageResponse {
    used: number;
    limit: number;
    feature: VtPlusFeature;
    periodStart: Date;
}

/**
 * Get the period start date based on quota window (daily/monthly)
 */
function getPeriodStart(window: QuotaWindow): Date {
    const now = new Date();
    if (window === QUOTA_WINDOW.DAILY) {
        // 00:00 UTC today
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
    // monthly
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Helper function to get current usage without transaction (for neon-http compatibility)
 */
async function getCurrentUsageNonTx(
    userId: string,
    feature: VtPlusFeature,
    periodStart: Date,
): Promise<number> {
    // Convert to date string for database storage (YYYY-MM-DD format)
    const periodStartDate = periodStart.toISOString().split("T")[0];
    const result = await db
        .select({ used: vtplusUsage.used })
        .from(vtplusUsage)
        .where(
            and(
                eq(vtplusUsage.userId, userId),
                eq(vtplusUsage.feature, feature),
                eq(vtplusUsage.periodStart, periodStartDate),
            ),
        )
        .limit(1);

    return result.length > 0 ? result[0].used : 0;
}

/**
 * Helper function to perform atomic upsert without transaction (for neon-http compatibility)
 */
async function upsertUsageNonTx(
    userId: string,
    feature: VtPlusFeature,
    periodStart: Date,
    amount: number,
    limit: number,
): Promise<{ used: number; exceeded: boolean }> {
    // Convert to date string for database storage (YYYY-MM-DD format)
    const periodStartDate = periodStart.toISOString().split("T")[0];

    // First, try to get current usage
    const currentUsage = await getCurrentUsageNonTx(userId, feature, periodStart);

    // Check if adding amount would exceed limit
    if (currentUsage + amount > limit) {
        return { used: currentUsage, exceeded: true };
    }

    // Perform upsert
    const result = await db
        .insert(vtplusUsage)
        .values({
            userId,
            feature,
            periodStart: periodStartDate,
            used: amount,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [vtplusUsage.userId, vtplusUsage.feature, vtplusUsage.periodStart],
            set: {
                used: sql`${vtplusUsage.used} + ${amount}`,
                updatedAt: new Date(),
            },
        })
        .returning({ used: vtplusUsage.used });

    const newUsed = result[0]?.used || amount;

    // Double-check if the final amount exceeds limit (race condition protection)
    if (newUsed > limit) {
        return { used: newUsed, exceeded: true };
    }

    return { used: newUsed, exceeded: false };
}

/**
 * Consume quota for a VT+ feature with atomic database operations
 */
export async function consumeQuota(options: ConsumeOptions): Promise<void> {
    const { userId, feature, userPlan, amount = 1 } = options;

    // Validate amount is positive
    if (amount <= 0) {
        throw new Error(RateLimiterErrorMessage.AMOUNT_MUST_BE_POSITIVE);
    }

    // Get quota configuration from database based on user's plan
    const { limit, window } = await getQuotaConfig(feature, userPlan);
    const periodStart = getPeriodStart(window);

    log.info(
        { userId, feature, amount, periodStart, window },
        RateLimiterLogMessage.ATTEMPTING_TO_CONSUME,
    );

    // Use simplified approach without transactions (neon-http compatibility)
    try {
        const result = await upsertUsageNonTx(userId, feature, periodStart, amount, limit);

        if (result.exceeded) {
            throw new QuotaExceededError(feature, limit, result.used);
        }

        log.info(
            { userId, feature, newUsage: result.used, limit },
            RateLimiterLogMessage.QUOTA_CONSUMED_SUCCESS,
        );
    } catch (error) {
        if (error instanceof QuotaExceededError) {
            throw error;
        }
        log.error({ error, userId, feature }, RateLimiterLogMessage.FAILED_TO_CONSUME);
        throw new Error(RateLimiterErrorMessage.FAILED_TO_CONSUME_QUOTA);
    }
}

/**
 * Get current usage for a user and feature
 */
export async function getUsage(
    userId: string,
    feature: VtPlusFeature,
    userPlan: PlanSlug,
): Promise<UsageResponse> {
    // Get quota configuration from database based on user's plan
    const { limit, window } = await getQuotaConfig(feature, userPlan);
    const periodStart = getPeriodStart(window);
    // Convert to date string for database storage (YYYY-MM-DD format)
    const periodStartDate = periodStart.toISOString().split("T")[0];

    const usage = await db
        .select()
        .from(vtplusUsage)
        .where(
            and(
                eq(vtplusUsage.userId, userId),
                eq(vtplusUsage.feature, feature),
                eq(vtplusUsage.periodStart, periodStartDate),
            ),
        )
        .limit(1);

    return {
        used: usage.length > 0 ? usage[0].used : 0,
        limit,
        feature,
        periodStart,
    };
}

/**
 * Get usage for all VT+ features for a user (optimized query per window type)
 */
export async function getAllUsage(
    userId: string,
    userPlan: PlanSlug,
): Promise<Record<VtPlusFeature, UsageResponse>> {
    const result: Record<VtPlusFeature, UsageResponse> = {} as Record<VtPlusFeature, UsageResponse>;

    // Get quota configurations for all features based on user's plan
    const quotaConfigs = new Map<VtPlusFeature, { limit: number; window: QuotaWindow }>();
    for (const feature of Object.values(VtPlusFeature)) {
        const config = await getQuotaConfig(feature, userPlan);
        quotaConfigs.set(feature, config);
    }

    // Group features by window type for efficient querying
    const featuresByWindow = new Map<QuotaWindow, VtPlusFeature[]>();
    for (const feature of Object.values(VtPlusFeature)) {
        const config = quotaConfigs.get(feature);
        if (!config) continue;

        const { window } = config;
        if (!featuresByWindow.has(window)) {
            featuresByWindow.set(window, []);
        }
        featuresByWindow.get(window)?.push(feature);
    }

    // Query each window type separately
    for (const [window, features] of Array.from(featuresByWindow.entries())) {
        const periodStart = getPeriodStart(window);
        // Convert to date string for database storage (YYYY-MM-DD format)
        const periodStartDate = periodStart.toISOString().split("T")[0];

        const usageRecords = await db
            .select()
            .from(vtplusUsage)
            .where(
                and(
                    eq(vtplusUsage.userId, userId),
                    eq(vtplusUsage.periodStart, periodStartDate),
                    inArray(vtplusUsage.feature, features),
                ),
            );

        // Create a map for quick lookup
        const usageMap = new Map(
            usageRecords.map((record) => [record.feature as VtPlusFeature, record.used]),
        );

        // Build response for features in this window
        for (const feature of features) {
            const config = quotaConfigs.get(feature);
            if (!config) continue;

            const { limit } = config;
            result[feature] = {
                used: usageMap.get(feature) || 0,
                limit,
                feature,
                periodStart,
            };
        }
    }

    return result;
}
