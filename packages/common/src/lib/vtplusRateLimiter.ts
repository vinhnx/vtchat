import { db, schema } from "@repo/shared/lib/database";
import { log } from "@repo/shared/logger";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
    QUOTA_WINDOW,
    QuotaExceededError,
    VT_PLUS_LIMITS,
    VtPlusFeature,
    type QuotaWindow,
} from "../config/vtPlusLimits";

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

/**
 * Type-safe database column constants to prevent typos
 */
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
        .select({ used: schema.vtplusUsage.used })
        .from(schema.vtplusUsage)
        .where(
            and(
                eq(schema.vtplusUsage.userId, userId),
                eq(schema.vtplusUsage.feature, feature),
                eq(schema.vtplusUsage.periodStart, periodStartDate),
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
        .insert(schema.vtplusUsage)
        .values({
            userId,
            feature,
            periodStart: periodStartDate,
            used: amount,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [
                schema.vtplusUsage.userId,
                schema.vtplusUsage.feature,
                schema.vtplusUsage.periodStart,
            ],
            set: {
                used: sql`${schema.vtplusUsage.used} + ${amount}`,
                updatedAt: new Date(),
            },
        })
        .returning({ used: schema.vtplusUsage.used });

    const newUsed = result[0]?.used || amount;

    // Double-check if the final amount exceeds limit (race condition protection)
    if (newUsed > limit) {
        return { used: newUsed, exceeded: true };
    }

    return { used: newUsed, exceeded: false };
}

export interface ConsumeOptions {
    userId: string;
    feature: VtPlusFeature;
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
 * Consume quota for a VT+ feature with atomic database operations
 */
export async function consumeQuota(options: ConsumeOptions): Promise<void> {
    const { userId, feature, amount = 1 } = options;

    // Validate amount is positive
    if (amount <= 0) {
        throw new Error(RateLimiterErrorMessage.AMOUNT_MUST_BE_POSITIVE);
    }

    const { limit, window } = VT_PLUS_LIMITS[feature];
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
export async function getUsage(userId: string, feature: VtPlusFeature): Promise<UsageResponse> {
    const { limit, window } = VT_PLUS_LIMITS[feature];
    const periodStart = getPeriodStart(window);
    // Convert to date string for database storage (YYYY-MM-DD format)
    const periodStartDate = periodStart.toISOString().split("T")[0];

    const usage = await db
        .select()
        .from(schema.vtplusUsage)
        .where(
            and(
                eq(schema.vtplusUsage.userId, userId),
                eq(schema.vtplusUsage.feature, feature),
                eq(schema.vtplusUsage.periodStart, periodStartDate),
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
export async function getAllUsage(userId: string): Promise<Record<VtPlusFeature, UsageResponse>> {
    const result: Record<VtPlusFeature, UsageResponse> = {} as Record<VtPlusFeature, UsageResponse>;

    // Group features by window type for efficient querying
    const featuresByWindow = new Map<QuotaWindow, VtPlusFeature[]>();
    for (const feature of Object.values(VtPlusFeature)) {
        const { window } = VT_PLUS_LIMITS[feature];
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
            .from(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, userId),
                    eq(schema.vtplusUsage.periodStart, periodStartDate),
                    inArray(schema.vtplusUsage.feature, features),
                ),
            );

        // Create a map for quick lookup
        const usageMap = new Map(
            usageRecords.map((record) => [record.feature as VtPlusFeature, record.used]),
        );

        // Build response for features in this window
        for (const feature of features) {
            const { limit } = VT_PLUS_LIMITS[feature];
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
