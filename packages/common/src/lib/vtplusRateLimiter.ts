import { db, schema } from "@repo/shared/lib/database";
import { log } from "@repo/shared/lib/logger";
import { and, eq, sql } from "drizzle-orm";
import {
    QUOTA_WINDOW,
    QuotaExceededError,
    type QuotaWindow,
    VT_PLUS_LIMITS,
    VtPlusFeature,
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
const VtPlusUsageColumns = {
    USER_ID: "user_id",
    FEATURE: "feature",
    PERIOD_START: "period_start",
    USED: "used",
    UPDATED_AT: "updated_at",
} as const;

/**
 * Helper function to get current usage with type-safe column references
 */
async function getCurrentUsage(
    tx: any,
    userId: string,
    feature: VtPlusFeature,
    periodStart: Date,
): Promise<number> {
    const result = await tx.execute(
        sql`
            SELECT ${sql.identifier(VtPlusUsageColumns.USED)}
            FROM vtplus_usage
            WHERE ${sql.identifier(VtPlusUsageColumns.USER_ID)} = ${userId}
            AND ${sql.identifier(VtPlusUsageColumns.FEATURE)} = ${feature}
            AND ${sql.identifier(VtPlusUsageColumns.PERIOD_START)} = ${periodStart}
        `,
    );
    return (result.rows[0]?.used as number) || 0;
}

/**
 * Helper function to perform atomic upsert with type-safe operations
 */
async function upsertUsage(
    tx: any,
    userId: string,
    feature: VtPlusFeature,
    periodStart: Date,
    amount: number,
): Promise<number> {
    const result = await tx.execute(
        sql`
            INSERT INTO vtplus_usage (
                ${sql.identifier(VtPlusUsageColumns.USER_ID)},
                ${sql.identifier(VtPlusUsageColumns.FEATURE)},
                ${sql.identifier(VtPlusUsageColumns.PERIOD_START)},
                ${sql.identifier(VtPlusUsageColumns.USED)},
                created_at,
                ${sql.identifier(VtPlusUsageColumns.UPDATED_AT)}
            )
            VALUES (${userId}, ${feature}, ${periodStart}, ${amount}, NOW(), NOW())
            ON CONFLICT (
                ${sql.identifier(VtPlusUsageColumns.USER_ID)},
                ${sql.identifier(VtPlusUsageColumns.FEATURE)},
                ${sql.identifier(VtPlusUsageColumns.PERIOD_START)}
            )
            DO UPDATE SET
                ${sql.identifier(VtPlusUsageColumns.USED)} = vtplus_usage.${sql.identifier(VtPlusUsageColumns.USED)} + ${amount},
                ${sql.identifier(VtPlusUsageColumns.UPDATED_AT)} = NOW()
            RETURNING ${sql.identifier(VtPlusUsageColumns.USED)};
        `,
    );
    return result.rows[0].used as number;
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

    // Use a cleaner approach with separate check and update operations
    try {
        await db.transaction(async (tx) => {
            // Step 1: Get current usage to validate quota availability
            const currentUsage = await getCurrentUsage(tx, userId, feature, periodStart);

            // Step 2: Validate quota before attempting update
            if (currentUsage + amount > limit) {
                throw new QuotaExceededError(feature, limit, currentUsage);
            }

            // Step 3: Perform atomic upsert with optimistic update
            const newUsed = await upsertUsage(tx, userId, feature, periodStart, amount);

            log.info(
                { userId, feature, newUsage: newUsed, limit },
                RateLimiterLogMessage.QUOTA_CONSUMED_SUCCESS,
            );
        });
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

    const usage = await db
        .select()
        .from(schema.vtplusUsage)
        .where(
            and(
                eq(schema.vtplusUsage.userId, userId),
                eq(schema.vtplusUsage.feature, feature),
                eq(schema.vtplusUsage.periodStart, periodStart),
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
    for (const [window, features] of featuresByWindow) {
        const periodStart = getPeriodStart(window);

        const usageRecords = await db
            .select()
            .from(schema.vtplusUsage)
            .where(
                and(
                    eq(schema.vtplusUsage.userId, userId),
                    eq(schema.vtplusUsage.periodStart, periodStart),
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
