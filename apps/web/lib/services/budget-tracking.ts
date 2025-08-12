import { db } from '@/lib/database';
import { providerUsage } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { and, eq, gte, sql } from 'drizzle-orm';

/**
 * Record a request for provider usage tracking (rate limits only)
 * This should be called after a successful API request to track usage
 */
export async function recordProviderUsage(
    userId: string,
    modelId: string, // Accept any string for modelId
    provider: string = 'gemini',
): Promise<void> {
    // Accept any modelId, including Deep Research
    try {
        await db.insert(providerUsage).values({
            userId,
            modelId,
            provider,
            requestTimestamp: new Date(),
        });

        log.info(
            {
                userId,
                modelId,
                provider,
            },
            'Recorded provider usage for rate limit tracking',
        );
    } catch (error) {
        log.error({ error, userId, modelId }, 'Failed to record provider usage');
        // Don't throw - tracking failure shouldn't break the main request
    }
}

/**
 * Get monthly usage for provider (no cost tracking)
 */
export async function getMonthlyUsage(
    provider: string = 'gemini',
    month: Date = new Date(),
): Promise<{ requestCount: number; }> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const result = await db
            .select({
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

        const { requestCount } = result[0] || {
            requestCount: 0,
        };

        return {
            requestCount: Number(requestCount),
        };
    } catch (error) {
        log.error({ error, provider, month }, 'Failed to get monthly usage');
        return { requestCount: 0 };
    }
}

/**
 * Get user-specific usage for the current month
 */
export async function getUserMonthlyUsage(
    userId: string,
    provider: string = 'gemini',
    month: Date = new Date(),
): Promise<{
    requestCount: number;
    modelBreakdown: Record<string, { count: number; }>;
}> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const result = await db
            .select({
                modelId: providerUsage.modelId,
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

        let totalRequestCount = 0;
        const modelBreakdown: Record<string, { count: number; }> = {};

        for (const row of result) {
            const count = Number(row.requestCount);
            totalRequestCount += count;
            modelBreakdown[row.modelId] = {
                count,
            };
        }

        return {
            requestCount: totalRequestCount,
            modelBreakdown,
        };
    } catch (error) {
        log.error({ error, userId, provider, month }, 'Failed to get user monthly usage');
        return { requestCount: 0, modelBreakdown: {} };
    }
}

/**
 * Check if Gemini models should be disabled due to usage limits
 */
export async function shouldDisableGeminiModels(): Promise<boolean> {
    // Implement usage-based disabling if needed
    return false;
}
