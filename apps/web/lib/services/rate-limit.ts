import { ModelEnum } from "@repo/ai/models";
import { GEMINI_LIMITS } from "@repo/shared/constants/rate-limits";
import { db } from "@repo/shared/lib/database";
import { log } from "@repo/shared/lib/logger";
import { and, eq } from "drizzle-orm";
import type { UserRateLimit } from "../database/schema";
import { userRateLimits } from "../database/schema";
import { recordProviderUsage } from "./budget-tracking";

// Security bounds to prevent integer overflow and malicious data
const _SECURITY_BOUNDS = {
    MAX_DAILY_COUNT: 1000000,
    MAX_MINUTE_COUNT: 10000,
} as const;

// Map model enum to rate limit configuration
const MODEL_LIMITS_MAP = {
    [ModelEnum.GEMINI_2_5_FLASH_LITE]: GEMINI_LIMITS.FLASH_LITE,
    [ModelEnum.GEMINI_2_5_FLASH]: GEMINI_LIMITS.FLASH,
    [ModelEnum.GEMINI_2_5_PRO]: GEMINI_LIMITS.PRO,
} as const;

// Legacy support
export const RATE_LIMITS = {
    GEMINI_2_5_FLASH_LITE: {
        DAILY_LIMIT: GEMINI_LIMITS.FLASH_LITE.FREE_DAY,
        MINUTE_LIMIT: GEMINI_LIMITS.FLASH_LITE.FREE_MINUTE,
        MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
        VT_PLUS_DAILY_LIMIT: GEMINI_LIMITS.FLASH_LITE.PLUS_DAY,
        VT_PLUS_MINUTE_LIMIT: GEMINI_LIMITS.FLASH_LITE.PLUS_MINUTE,
    },
} as const;

// Helper to check if a model is a Gemini model that needs rate limiting
function isGeminiModel(modelId: ModelEnum): boolean {
    return modelId in MODEL_LIMITS_MAP;
}

// Helper to get rate limit configuration for a model
function getModelLimits(modelId: ModelEnum) {
    return MODEL_LIMITS_MAP[modelId as keyof typeof MODEL_LIMITS_MAP];
}

/**
 * Helper to get or create a rate limit record for a user and model
 */
async function getOrCreateRateRecord(userId: string, modelId: ModelEnum) {
    const now = new Date();

    let rateLimitRecord = await db
        .select()
        .from(userRateLimits)
        .where(and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)))
        .limit(1)
        .then((rows) => rows[0]);

    if (!rateLimitRecord) {
        // Create new record with race condition handling
        rateLimitRecord = {
            id: crypto.randomUUID(),
            userId,
            modelId,
            dailyRequestCount: "0",
            minuteRequestCount: "0",
            lastDailyReset: now,
            lastMinuteReset: now,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await safeInsertRateLimit(rateLimitRecord);
        } catch (error: unknown) {
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                (error as { code?: string }).code === "23505" &&
                "constraint" in error &&
                (error as { constraint?: string }).constraint === "unique_user_model"
            ) {
                // Fetch the existing record
                const existingRecord = await db
                    .select()
                    .from(userRateLimits)
                    .where(
                        and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)),
                    )
                    .limit(1)
                    .then((rows) => rows[0]);

                if (existingRecord) {
                    rateLimitRecord = existingRecord;
                } else {
                    throw error; // Re-throw if not a race condition
                }
            } else {
                throw error; // Re-throw if not a unique constraint violation
            }
        }
    }

    return rateLimitRecord;
}

// Prevent pushing zero-value records in service layer
function isZeroRateRecord(record: UserRateLimit): boolean {
    return record.dailyRequestCount === "0" && record.minuteRequestCount === "0";
}

/**
 * Inserts or updates a user/model rate limit record.
 * Uses Drizzle ORM's onConflictDoUpdate to perform an upsert on (userId, modelId).
 * This ensures that duplicate key errors are avoided and records are updated as needed.
 * If a record for (userId, modelId) exists, it is updated with the latest counts and reset times.
 * If no record exists, a new one is inserted.
 * This logic is robust against race conditions and concurrent requests.
 */
async function safeInsertRateLimit(record: UserRateLimit) {
    if (isZeroRateRecord(record)) {
        log.warn({ record }, "Blocked attempt to insert zero-value rate limit record");
        throw new Error("Cannot insert zero-value rate limit record");
    }
    await db
        .insert(userRateLimits)
        .values(record)
        .onConflictDoUpdate({
            target: [userRateLimits.userId, userRateLimits.modelId],
            set: {
                dailyRequestCount: record.dailyRequestCount,
                minuteRequestCount: record.minuteRequestCount,
                lastDailyReset: record.lastDailyReset,
                lastMinuteReset: record.lastMinuteReset,
                updatedAt: new Date(),
            },
        });
}

/**
 * Helper to increment a rate limit record
 */
async function incrementRateRecord(userId: string, modelId: ModelEnum): Promise<void> {
    const now = new Date();

    await safeInsertRateLimit({
        id: crypto.randomUUID(),
        userId,
        modelId,
        dailyRequestCount: "1",
        minuteRequestCount: "1",
        lastDailyReset: now,
        lastMinuteReset: now,
        createdAt: now,
        updatedAt: now,
    });

    // Also record for budget tracking (async, don't await to avoid slowing down the request)
    recordProviderUsage(userId, modelId, "gemini").catch((_error) => {
        // Error already logged in recordProviderUsage, just ensure it doesn't bubble up
    });
}

/**
 * Record usage for VT+ users using non-Flash-Lite models
 * Records in both model-specific AND Flash Lite quotas
 */
async function recordDualQuotaUsage(userId: string, modelId: ModelEnum): Promise<void> {
    // Record in the model-specific quota
    await incrementRateRecord(userId, modelId);

    // Also record in the Flash Lite shared quota
    await incrementRateRecord(userId, ModelEnum.GEMINI_2_5_FLASH_LITE);
}

/**
 * Get dual quota status for VT+ users using non-Flash-Lite models
 * Shows the effective remaining quota (minimum of both model-specific and Flash Lite quotas)
 */
async function getDualQuotaStatus(userId: string, modelId: ModelEnum): Promise<RateLimitStatus> {
    const now = new Date();

    // Get both records
    const modelRecord = await getOrCreateRateRecord(userId, modelId);
    const flashLiteRecord = await getOrCreateRateRecord(userId, ModelEnum.GEMINI_2_5_FLASH_LITE);

    // Get limits for both
    const modelConfig = getModelLimits(modelId);
    const flashLiteConfig = GEMINI_LIMITS.FLASH_LITE;

    const modelDailyLimit = modelConfig.PLUS_DAY;
    const modelMinuteLimit = modelConfig.PLUS_MINUTE;
    const flashLiteDailyLimit = flashLiteConfig.PLUS_DAY;
    const flashLiteMinuteLimit = flashLiteConfig.PLUS_MINUTE;

    // Calculate current usage (with resets)
    const modelNeedsDailyReset = isNewDay(modelRecord.lastDailyReset, now);
    const modelNeedsMinuteReset = isNewMinute(modelRecord.lastMinuteReset, now);
    const flashLiteNeedsDailyReset = isNewDay(flashLiteRecord.lastDailyReset, now);
    const flashLiteNeedsMinuteReset = isNewMinute(flashLiteRecord.lastMinuteReset, now);

    const modelDailyUsed = modelNeedsDailyReset
        ? 0
        : Number.parseInt(modelRecord.dailyRequestCount, 10);
    const modelMinuteUsed = modelNeedsMinuteReset
        ? 0
        : Number.parseInt(modelRecord.minuteRequestCount, 10);
    const flashLiteDailyUsed = flashLiteNeedsDailyReset
        ? 0
        : Number.parseInt(flashLiteRecord.dailyRequestCount, 10);
    const flashLiteMinuteUsed = flashLiteNeedsMinuteReset
        ? 0
        : Number.parseInt(flashLiteRecord.minuteRequestCount, 10);

    // Calculate remaining for both quotas
    const modelRemainingDaily = modelDailyLimit - modelDailyUsed;
    const modelRemainingMinute = modelMinuteLimit - modelMinuteUsed;
    const flashLiteRemainingDaily = flashLiteDailyLimit - flashLiteDailyUsed;
    const flashLiteRemainingMinute = flashLiteMinuteLimit - flashLiteMinuteUsed;

    // The effective remaining is the minimum of both quotas
    const effectiveRemainingDaily = Math.min(modelRemainingDaily, flashLiteRemainingDaily);
    const effectiveRemainingMinute = Math.min(modelRemainingMinute, flashLiteRemainingMinute);

    return {
        dailyUsed: modelDailyUsed,
        minuteUsed: modelMinuteUsed,
        dailyLimit: modelDailyLimit,
        minuteLimit: modelMinuteLimit,
        remainingDaily: effectiveRemainingDaily,
        remainingMinute: effectiveRemainingMinute,
        resetTime: {
            daily: getNextDailyReset(),
            minute: getNextMinuteReset(),
        },
    };
}

/**
 * Check rate limits for VT+ users using non-Flash-Lite models
 * These users are limited by BOTH the model-specific quota AND the Flash Lite shared quota
 */
async function checkDualQuotaLimits(userId: string, modelId: ModelEnum): Promise<RateLimitResult> {
    const now = new Date();

    // Get both records
    const modelRecord = await getOrCreateRateRecord(userId, modelId);
    const flashLiteRecord = await getOrCreateRateRecord(userId, ModelEnum.GEMINI_2_5_FLASH_LITE);

    // Get limits for both
    const modelConfig = getModelLimits(modelId);
    const flashLiteConfig = GEMINI_LIMITS.FLASH_LITE;

    const modelDailyLimit = modelConfig.PLUS_DAY;
    const modelMinuteLimit = modelConfig.PLUS_MINUTE;
    const flashLiteDailyLimit = flashLiteConfig.PLUS_DAY;
    const flashLiteMinuteLimit = flashLiteConfig.PLUS_MINUTE;

    // Calculate current usage (with resets)
    const modelNeedsDailyReset = isNewDay(modelRecord.lastDailyReset, now);
    const modelNeedsMinuteReset = isNewMinute(modelRecord.lastMinuteReset, now);
    const flashLiteNeedsDailyReset = isNewDay(flashLiteRecord.lastDailyReset, now);
    const flashLiteNeedsMinuteReset = isNewMinute(flashLiteRecord.lastMinuteReset, now);

    const modelDailyUsed = modelNeedsDailyReset
        ? 0
        : Number.parseInt(modelRecord.dailyRequestCount, 10);
    const modelMinuteUsed = modelNeedsMinuteReset
        ? 0
        : Number.parseInt(modelRecord.minuteRequestCount, 10);
    const flashLiteDailyUsed = flashLiteNeedsDailyReset
        ? 0
        : Number.parseInt(flashLiteRecord.dailyRequestCount, 10);
    const flashLiteMinuteUsed = flashLiteNeedsMinuteReset
        ? 0
        : Number.parseInt(flashLiteRecord.minuteRequestCount, 10);

    // Calculate remaining for both quotas
    const modelRemainingDaily = modelDailyLimit - modelDailyUsed;
    const modelRemainingMinute = modelMinuteLimit - modelMinuteUsed;
    const flashLiteRemainingDaily = flashLiteDailyLimit - flashLiteDailyUsed;
    const flashLiteRemainingMinute = flashLiteMinuteLimit - flashLiteMinuteUsed;

    // The effective remaining is the minimum of both quotas
    const effectiveRemainingDaily = Math.min(modelRemainingDaily, flashLiteRemainingDaily);
    const effectiveRemainingMinute = Math.min(modelRemainingMinute, flashLiteRemainingMinute);

    // Calculate reset times
    const nextDailyReset = getNextDailyReset();
    const nextMinuteReset = getNextMinuteReset();

    // Check limits - fail if either quota is exhausted
    if (effectiveRemainingDaily <= 0) {
        return {
            allowed: false,
            reason: "daily_limit_exceeded",
            remainingDaily: 0,
            remainingMinute: effectiveRemainingMinute,
            resetTime: {
                daily: nextDailyReset,
                minute: nextMinuteReset,
            },
        };
    }

    if (effectiveRemainingMinute <= 0) {
        return {
            allowed: false,
            reason: "minute_limit_exceeded",
            remainingDaily: effectiveRemainingDaily,
            remainingMinute: 0,
            resetTime: {
                daily: nextDailyReset,
                minute: nextMinuteReset,
            },
        };
    }

    return {
        allowed: true,
        remainingDaily: effectiveRemainingDaily,
        remainingMinute: effectiveRemainingMinute,
        resetTime: {
            daily: nextDailyReset,
            minute: nextMinuteReset,
        },
    };
}

export interface RateLimitResult {
    allowed: boolean;
    reason?: "daily_limit_exceeded" | "minute_limit_exceeded";
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
 * VT+ users get enhanced limits
 * VT+ users have unlimited access to gemini-2.5-flash-lite-preview-06-17
 * VT+ users using other Gemini models count against both model-specific AND Flash Lite quotas
 */
export async function checkRateLimit(
    userId: string,
    modelId: ModelEnum,
    isVTPlusUser?: boolean,
): Promise<RateLimitResult> {
    // Only apply rate limiting to Gemini models
    if (!isGeminiModel(modelId)) {
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

    // VT+ users have unlimited access to Flash Lite models
    if (isVTPlusUser && modelId === ModelEnum.GEMINI_2_5_FLASH_LITE) {
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

    // VT+ users using other Gemini models must check both model-specific AND Flash Lite quotas
    if (
        isVTPlusUser &&
        (modelId === ModelEnum.GEMINI_2_5_FLASH || modelId === ModelEnum.GEMINI_2_5_PRO)
    ) {
        return await checkDualQuotaLimits(userId, modelId);
    }

    const config = getModelLimits(modelId);
    const now = new Date();

    // Use VT+ enhanced limits if user has VT+ subscription
    const dailyLimit = isVTPlusUser ? config.PLUS_DAY : config.FREE_DAY;
    const minuteLimit = isVTPlusUser ? config.PLUS_MINUTE : config.FREE_MINUTE;

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
            dailyRequestCount: "0",
            minuteRequestCount: "0",
            lastDailyReset: now,
            lastMinuteReset: now,
            createdAt: now,
            updatedAt: now,
        };

        await safeInsertRateLimit(rateLimitRecord);
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
            reason: "daily_limit_exceeded",
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
            reason: "minute_limit_exceeded",
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
 * Helper function to update an existing rate limit record
 */
async function updateExistingRateLimitRecord(
    rateLimitRecord: UserRateLimit,
    now: Date,
    userId: string,
    modelId: ModelEnum,
): Promise<void> {
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

    // Also record for budget tracking (async, don't await to avoid slowing down the request)
    recordProviderUsage(userId, modelId, "gemini").catch((_error) => {
        // Error already logged in recordProviderUsage, just ensure it doesn't bubble up
    });
}

/**
 * Record a successful request for rate limiting and usage tracking
 * VT+ users get usage tracked for display purposes while maintaining unlimited access for Flash Lite models
 * VT+ users using other Gemini models count against both model-specific AND Flash Lite quotas
 */
export async function recordRequest(
    userId: string,
    modelId: ModelEnum,
    isVTPlusUser?: boolean,
): Promise<void> {
    // Only track Gemini models
    if (!isGeminiModel(modelId)) {
        return;
    }

    // SECURITY: Validate VT+ user status before applying unlimited access
    if (isVTPlusUser && modelId === ModelEnum.GEMINI_2_5_FLASH_LITE) {
        // Additional validation could be added here to verify VT+ status
        await incrementRateRecord(userId, modelId);
        return;
    }

    // VT+ users using other Gemini models must record in both quotas (model-specific + shared Flash Lite quota)
    if (
        isVTPlusUser &&
        (modelId === ModelEnum.GEMINI_2_5_FLASH || modelId === ModelEnum.GEMINI_2_5_PRO)
    ) {
        await recordDualQuotaUsage(userId, modelId);
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
        // Use ON CONFLICT to handle race conditions gracefully
        try {
            await db.insert(userRateLimits).values({
                id: crypto.randomUUID(),
                userId,
                modelId,
                dailyRequestCount: "1",
                minuteRequestCount: "1",
                lastDailyReset: now,
                lastMinuteReset: now,
                createdAt: now,
                updatedAt: now,
            });
            return;
        } catch (error: unknown) {
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                (error as { code?: string }).code === "23505" &&
                "constraint" in error &&
                (error as { constraint?: string }).constraint === "unique_user_model"
            ) {
                const existingRecord = await db
                    .select()
                    .from(userRateLimits)
                    .where(
                        and(eq(userRateLimits.userId, userId), eq(userRateLimits.modelId, modelId)),
                    )
                    .limit(1)
                    .then((rows) => rows[0]);

                if (existingRecord) {
                    // Update existing record - proceed with normal update logic
                    await updateExistingRateLimitRecord(existingRecord, now, userId, modelId);
                    return;
                }
            }
            // Re-throw other errors
            throw error;
        }
    }

    // Update the existing record
    await updateExistingRateLimitRecord(rateLimitRecord, now, userId, modelId);
}

/**
 * Get current rate limit status for a user and model
 * VT+ users have unlimited access to gemini-2.5-flash-lite-preview-06-17 but usage is tracked for display
 * VT+ users using other Gemini models show dual quota status
 */
export async function getRateLimitStatus(
    userId: string,
    modelId: ModelEnum,
    isVTPlusUser?: boolean,
): Promise<RateLimitStatus | null> {
    // Only provide status for Gemini models
    if (!isGeminiModel(modelId)) {
        return null;
    }

    // VT+ users have unlimited access to Flash Lite models but show actual usage
    if (isVTPlusUser && modelId === ModelEnum.GEMINI_2_5_FLASH_LITE) {
        const now = new Date();
        const rateLimitRecord = await getOrCreateRateRecord(userId, modelId);

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
            dailyLimit: Number.POSITIVE_INFINITY,
            minuteLimit: Number.POSITIVE_INFINITY,
            remainingDaily: Number.POSITIVE_INFINITY,
            remainingMinute: Number.POSITIVE_INFINITY,
            resetTime: {
                daily: getNextDailyReset(),
                minute: getNextMinuteReset(),
            },
        };
    }

    // VT+ users using other Gemini models need dual quota status
    if (
        isVTPlusUser &&
        (modelId === ModelEnum.GEMINI_2_5_FLASH || modelId === ModelEnum.GEMINI_2_5_PRO)
    ) {
        return await getDualQuotaStatus(userId, modelId);
    }

    const config = getModelLimits(modelId);
    const now = new Date();

    // Use VT+ enhanced limits if user has VT+ subscription
    const dailyLimit = isVTPlusUser ? config.PLUS_DAY : config.FREE_DAY;
    const minuteLimit = isVTPlusUser ? config.PLUS_MINUTE : config.FREE_MINUTE;

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
