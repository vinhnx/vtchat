import { db, schema } from '@repo/shared/lib/database';
import { log } from '@repo/shared/lib/logger';
import { and, eq, sql } from 'drizzle-orm';
import { QuotaExceededError, VT_PLUS_LIMITS, VtPlusFeature } from '../config/vtPlusLimits';

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
 * Get the first day of the current month in UTC
 */
function getCurrentPeriodStart(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Consume quota for a VT+ feature with atomic database operations
 */
export async function consumeQuota(options: ConsumeOptions): Promise<void> {
    const { userId, feature, amount = 1 } = options;

    // Validate amount is positive
    if (amount <= 0) {
        throw new Error('Amount must be positive');
    }

    const periodStart = getCurrentPeriodStart();
    const limit = VT_PLUS_LIMITS[feature];
    const periodString = periodStart.toISOString().split('T')[0];

    log.info({ userId, feature, amount, periodStart }, 'Attempting to consume VT+ quota');

    try {
        await db.transaction(async (tx) => {
            // Use atomic UPSERT to handle concurrent inserts safely
            // This prevents race conditions on first-time inserts
            const result = await tx.execute(
                sql`
                    INSERT INTO vtplus_usage (user_id, feature, period_start, used, created_at, updated_at)
                    VALUES (${userId}, ${feature}, ${periodString}, ${amount}, NOW(), NOW())
                    ON CONFLICT (user_id, feature, period_start)
                    DO UPDATE SET 
                        used = vtplus_usage.used + ${amount},
                        updated_at = NOW()
                    WHERE vtplus_usage.used + ${amount} <= ${limit}
                    RETURNING used, (vtplus_usage.used + ${amount} > ${limit}) as would_exceed;
                `
            );

            if (result.rows.length === 0) {
                // No rows returned means the WHERE clause failed (quota would be exceeded)
                // Get current usage for accurate error reporting
                const currentUsage = await tx.execute(
                    sql`
                        SELECT used FROM vtplus_usage 
                        WHERE user_id = ${userId} AND feature = ${feature} AND period_start = ${periodString}
                    `
                );

                const currentUsed = (currentUsage.rows[0]?.used as number) || 0;
                throw new QuotaExceededError(feature, limit, currentUsed);
            }

            const newUsed = result.rows[0].used as number;
            log.info(
                { userId, feature, newUsage: newUsed, limit },
                'VT+ quota consumed successfully'
            );
        });
    } catch (error) {
        if (error instanceof QuotaExceededError) {
            throw error;
        }
        log.error({ error, userId, feature }, 'Failed to consume VT+ quota');
        throw new Error('Failed to consume quota');
    }
}

/**
 * Get current usage for a user and feature
 */
export async function getUsage(userId: string, feature: VtPlusFeature): Promise<UsageResponse> {
    const periodStart = getCurrentPeriodStart();
    const limit = VT_PLUS_LIMITS[feature];

    const usage = await db
        .select()
        .from(schema.vtplusUsage)
        .where(
            and(
                eq(schema.vtplusUsage.userId, userId),
                eq(schema.vtplusUsage.feature, feature),
                eq(schema.vtplusUsage.periodStart, periodStart.toISOString().split('T')[0])
            )
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
 * Get usage for all VT+ features for a user (optimized single query)
 */
export async function getAllUsage(userId: string): Promise<Record<VtPlusFeature, UsageResponse>> {
    const periodStart = getCurrentPeriodStart();
    const periodString = periodStart.toISOString().split('T')[0];

    // Fetch all usage records for the user in a single query
    const usageRecords = await db
        .select()
        .from(schema.vtplusUsage)
        .where(
            and(
                eq(schema.vtplusUsage.userId, userId),
                eq(schema.vtplusUsage.periodStart, periodString)
            )
        );

    // Create a map for quick lookup
    const usageMap = new Map(
        usageRecords.map((record) => [record.feature as VtPlusFeature, record.used])
    );

    // Build response for all features, defaulting to 0 for unused features
    const result: Record<VtPlusFeature, UsageResponse> = {} as Record<VtPlusFeature, UsageResponse>;

    for (const feature of Object.values(VtPlusFeature)) {
        result[feature] = {
            used: usageMap.get(feature) || 0,
            limit: VT_PLUS_LIMITS[feature],
            feature,
            periodStart,
        };
    }

    return result;
}
