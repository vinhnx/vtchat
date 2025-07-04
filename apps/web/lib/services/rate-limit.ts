import { ModelEnum } from '@repo/ai/models';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/database';
import { userRateLimits } from '@/lib/database/schema';

// Rate limit constants - PER USER ACCOUNT
export const RATE_LIMITS = {
    GEMINI_2_5_FLASH_LITE: {
        DAILY_LIMIT: 10, // 10 requests per day PER USER
        MINUTE_LIMIT: 1, // 1 request per minute PER USER
        MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
    },
} as const;

export interface RateLimitResult {
    allowed: boolean;
    reason?: 'daily_limit_exceeded' | 'minute_limit_exceeded';
    remainingDaily: number;
    remainingMinute: number;
    resetTime: {
        daily: Date;
        minute: Date;
    };
}

export interface RateLimitStatus {
    dailyUsed: number;
    minuteUsed: number;
    dailyLimit: number;
    minuteLimit: number;
    remainingDaily: number;
    remainingMinute: number;
    resetTime: {
        daily: Date;
        minute: Date;
    };
}

/**
 * Check if user can make a request to the specified model
 * Rate limits are enforced PER USER ACCOUNT
 */
export async function checkRateLimit(userId: string, modelId: ModelEnum): Promise<RateLimitResult> {
    // Only apply rate limiting to free models
    if (modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE) {
        return {
            allowed: true,
            remainingDaily: Number.POSITIVE_INFINITY,
            remainingMinute: Number.POSITIVE_INFINITY,
            resetTime: {
                daily: new Date(),
                minute: new Date(),
            },
        };
    }

    const config = RATE_LIMITS.GEMINI_2_5_FLASH_LITE;
    const now = new Date();

    // Get or create user rate limit record
    let rateLimitRecord = await db
        .select()
        .from(userRateLimits)
        .where(and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)))
        .limit(1)
        .then((rows) => rows[0]);

    if (!rateLimitRecord) {
        // Create new record
        rateLimitRecord = {
            id: crypto.randomUUID(),
            userId,
            modelId,
            dailyRequestCount: '0',
            minuteRequestCount: '0',
            lastDailyReset: now,
            lastMinuteReset: now,
            createdAt: now,
            updatedAt: now,
        };

        await db.insert(userRateLimits).values(rateLimitRecord);
    }

    // Check if resets are needed
    const needsDailyReset = isNewDay(rateLimitRecord.lastDailyReset, now);
    const needsMinuteReset = isNewMinute(rateLimitRecord.lastMinuteReset, now);

    let dailyCount = Number.parseInt(rateLimitRecord.dailyRequestCount);
    let minuteCount = Number.parseInt(rateLimitRecord.minuteRequestCount);

    if (needsDailyReset) {
        dailyCount = 0;
    }

    if (needsMinuteReset) {
        minuteCount = 0;
    }

    // Calculate remaining requests
    const remainingDaily = config.DAILY_LIMIT - dailyCount;
    const remainingMinute = config.MINUTE_LIMIT - minuteCount;

    // Calculate reset times
    const nextDailyReset = getNextDailyReset();
    const nextMinuteReset = getNextMinuteReset();

    // Check limits
    if (remainingDaily <= 0) {
        return {
            allowed: false,
            reason: 'daily_limit_exceeded',
            remainingDaily: 0,
            remainingMinute,
            resetTime: {
                daily: nextDailyReset,
                minute: nextMinuteReset,
            },
        };
    }

    if (remainingMinute <= 0) {
        return {
            allowed: false,
            reason: 'minute_limit_exceeded',
            remainingDaily,
            remainingMinute: 0,
            resetTime: {
                daily: nextDailyReset,
                minute: nextMinuteReset,
            },
        };
    }

    return {
        allowed: true,
        remainingDaily,
        remainingMinute,
        resetTime: {
            daily: nextDailyReset,
            minute: nextMinuteReset,
        },
    };
}

/**
 * Record a successful request for rate limiting
 */
export async function recordRequest(userId: string, modelId: ModelEnum): Promise<void> {
    // Only track free models
    if (modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE) {
        return;
    }

    const now = new Date();

    // Get current record
    const rateLimitRecord = await db
        .select()
        .from(userRateLimits)
        .where(and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)))
        .limit(1)
        .then((rows) => rows[0]);

    if (!rateLimitRecord) {
        // Create new record with count of 1
        await db.insert(userRateLimits).values({
            id: crypto.randomUUID(),
            userId,
            modelId,
            dailyRequestCount: '1',
            minuteRequestCount: '1',
            lastDailyReset: now,
            lastMinuteReset: now,
            createdAt: now,
            updatedAt: now,
        });
        return;
    }

    // Check if resets are needed
    const needsDailyReset = isNewDay(rateLimitRecord.lastDailyReset, now);
    const needsMinuteReset = isNewMinute(rateLimitRecord.lastMinuteReset, now);

    let dailyCount = Number.parseInt(rateLimitRecord.dailyRequestCount);
    let minuteCount = Number.parseInt(rateLimitRecord.minuteRequestCount);
    let lastDailyReset = rateLimitRecord.lastDailyReset;
    let lastMinuteReset = rateLimitRecord.lastMinuteReset;

    if (needsDailyReset) {
        dailyCount = 0;
        lastDailyReset = now;
    }

    if (needsMinuteReset) {
        minuteCount = 0;
        lastMinuteReset = now;
    }

    // Increment counts
    dailyCount += 1;
    minuteCount += 1;

    // Update record
    await db
        .update(userRateLimits)
        .set({
            dailyRequestCount: dailyCount.toString(),
            minuteRequestCount: minuteCount.toString(),
            lastDailyReset,
            lastMinuteReset,
            updatedAt: now,
        })
        .where(eq(userRateLimits.id, rateLimitRecord.id));
}

/**
 * Get current rate limit status for a user and model
 */
export async function getRateLimitStatus(
    userId: string,
    modelId: ModelEnum
): Promise<RateLimitStatus | null> {
    // Only provide status for free models
    if (modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE) {
        return null;
    }

    const config = RATE_LIMITS.GEMINI_2_5_FLASH_LITE;
    const now = new Date();

    const rateLimitRecord = await db
        .select()
        .from(userRateLimits)
        .where(and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)))
        .limit(1)
        .then((rows) => rows[0]);

    if (!rateLimitRecord) {
        return {
            dailyUsed: 0,
            minuteUsed: 0,
            dailyLimit: config.DAILY_LIMIT,
            minuteLimit: config.MINUTE_LIMIT,
            remainingDaily: config.DAILY_LIMIT,
            remainingMinute: config.MINUTE_LIMIT,
            resetTime: {
                daily: getNextDailyReset(),
                minute: getNextMinuteReset(),
            },
        };
    }

    // Check if resets are needed
    const needsDailyReset = isNewDay(rateLimitRecord.lastDailyReset, now);
    const needsMinuteReset = isNewMinute(rateLimitRecord.lastMinuteReset, now);

    let dailyUsed = Number.parseInt(rateLimitRecord.dailyRequestCount);
    let minuteUsed = Number.parseInt(rateLimitRecord.minuteRequestCount);

    if (needsDailyReset) {
        dailyUsed = 0;
    }

    if (needsMinuteReset) {
        minuteUsed = 0;
    }

    return {
        dailyUsed,
        minuteUsed,
        dailyLimit: config.DAILY_LIMIT,
        minuteLimit: config.MINUTE_LIMIT,
        remainingDaily: config.DAILY_LIMIT - dailyUsed,
        remainingMinute: config.MINUTE_LIMIT - minuteUsed,
        resetTime: {
            daily: getNextDailyReset(),
            minute: getNextMinuteReset(),
        },
    };
}

/**
 * Check if it's a new day (UTC)
 */
function isNewDay(lastReset: Date | null, now: Date): boolean {
    if (!lastReset) return true;
    return (
        now.getUTCDate() !== lastReset.getUTCDate() ||
        now.getUTCMonth() !== lastReset.getUTCMonth() ||
        now.getUTCFullYear() !== lastReset.getUTCFullYear()
    );
}

/**
 * Check if it's a new minute
 */
function isNewMinute(lastReset: Date | null, now: Date): boolean {
    if (!lastReset) return true;
    return Math.floor(now.getTime() / 60_000) > Math.floor(lastReset.getTime() / 60_000);
}

/**
 * Get next daily reset time (00:00 UTC)
 */
function getNextDailyReset(): Date {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    nextReset.setUTCHours(0, 0, 0, 0);
    return nextReset;
}

/**
 * Get next minute reset time
 */
function getNextMinuteReset(): Date {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    return nextMinute;
}
