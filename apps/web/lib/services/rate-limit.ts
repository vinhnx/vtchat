import { ModelEnum } from '@repo/ai/models';
import { GEMINI_FLASH_LIMITS } from '@repo/shared/constants/rate-limits';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/database';
import { userRateLimits } from '@/lib/database/schema';

// Rate limit constants - PER USER ACCOUNT
export const RATE_LIMITS = {
    GEMINI_2_5_FLASH_LITE: {
        DAILY_LIMIT: GEMINI_FLASH_LIMITS.FREE_DAY, // requests per day PER USER (free tier)
        MINUTE_LIMIT: GEMINI_FLASH_LIMITS.FREE_MINUTE, // requests per minute PER USER (free tier)
        MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
        // VT+ enhanced limits (without BYOK)
        VT_PLUS_DAILY_LIMIT: GEMINI_FLASH_LIMITS.PLUS_DAY, // requests per day for VT+ users
        VT_PLUS_MINUTE_LIMIT: GEMINI_FLASH_LIMITS.PLUS_MINUTE, // requests per minute for VT+ users
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
 * VT+ users get enhanced limits (100/day, 10/minute)
 */
export async function checkRateLimit(
    userId: string,
    modelId: ModelEnum,
    isVTPlusUser?: boolean
): Promise<RateLimitResult> {
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

    // Use VT+ enhanced limits if user has VT+ subscription
    const dailyLimit = isVTPlusUser ? config.VT_PLUS_DAILY_LIMIT : config.DAILY_LIMIT;
    const minuteLimit = isVTPlusUser ? config.VT_PLUS_MINUTE_LIMIT : config.MINUTE_LIMIT;

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

    let dailyCount = Number.parseInt(rateLimitRecord.dailyRequestCount, 10);
    let minuteCount = Number.parseInt(rateLimitRecord.minuteRequestCount, 10);

    if (needsDailyReset) {
        dailyCount = 0;
    }

    if (needsMinuteReset) {
        minuteCount = 0;
    }

    // Calculate remaining requests
    const remainingDaily = dailyLimit - dailyCount;
    const remainingMinute = minuteLimit - minuteCount;

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

    let dailyCount = Number.parseInt(rateLimitRecord.dailyRequestCount, 10);
    let minuteCount = Number.parseInt(rateLimitRecord.minuteRequestCount, 10);
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
    modelId: ModelEnum,
    isVTPlusUser?: boolean
): Promise<RateLimitStatus | null> {
    // Only provide status for free models
    if (modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE) {
        return null;
    }

    const config = RATE_LIMITS.GEMINI_2_5_FLASH_LITE;
    const now = new Date();

    // Use VT+ enhanced limits if user has VT+ subscription
    const dailyLimit = isVTPlusUser ? config.VT_PLUS_DAILY_LIMIT : config.DAILY_LIMIT;
    const minuteLimit = isVTPlusUser ? config.VT_PLUS_MINUTE_LIMIT : config.MINUTE_LIMIT;

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
            dailyLimit: dailyLimit,
            minuteLimit: minuteLimit,
            remainingDaily: dailyLimit,
            remainingMinute: minuteLimit,
            resetTime: {
                daily: getNextDailyReset(),
                minute: getNextMinuteReset(),
            },
        };
    }

    // Check if resets are needed
    const needsDailyReset = isNewDay(rateLimitRecord.lastDailyReset, now);
    const needsMinuteReset = isNewMinute(rateLimitRecord.lastMinuteReset, now);

    let dailyUsed = Number.parseInt(rateLimitRecord.dailyRequestCount, 10);
    let minuteUsed = Number.parseInt(rateLimitRecord.minuteRequestCount, 10);

    if (needsDailyReset) {
        dailyUsed = 0;
    }

    if (needsMinuteReset) {
        minuteUsed = 0;
    }

    return {
        dailyUsed,
        minuteUsed,
        dailyLimit: dailyLimit,
        minuteLimit: minuteLimit,
        remainingDaily: dailyLimit - dailyUsed,
        remainingMinute: minuteLimit - minuteUsed,
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
