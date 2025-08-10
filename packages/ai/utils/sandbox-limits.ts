/**
 * E2B Sandbox Rate Limiting and Premium Gating Utilities
 * Implements cost-efficient sandbox management for VT Chat
 */

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../../../apps/web/lib/database";
import { sandboxUsage } from "../../../apps/web/lib/database/schema";

// Rate limiting constants based on E2B documentation
const RATE_LIMITS = {
    VT_PLUS: {
        dailyLimit: 2, // 2 successful sandbox runs per day
        maxConcurrent: 1, // 1 concurrent sandbox to minimize costs
        maxTimeoutMinutes: 30, // Max 30 minutes to control costs
    },
    VT_FREE: {
        dailyLimit: 0, // No access for free users
        maxConcurrent: 0,
        maxTimeoutMinutes: 0,
    },
} as const;

/**
 * Check if user has VT+ subscription
 * Throws error if user is not VT+ subscriber
 */
export async function requireVTPlusUser(): Promise<void> {
    // This will be implemented to check user's subscription status
    // For now, we'll assume the user context is available
    const userTier = await getUserTier();

    if (userTier !== "VT_PLUS") {
        throw new Error(
            "VT+ required: Sandbox feature is only available for VT+ subscribers. Upgrade to access secure code execution.",
        );
    }
}

/**
 * Check sandbox rate limits for the current user
 * Throws error if daily limit exceeded
 */
export async function checkSandboxRateLimit(): Promise<void> {
    const userId = await getCurrentUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count successful sandbox runs today
    const usageToday = await db
        .select({ count: sql<number>`count(*)` })
        .from(sandboxUsage)
        .where(
            and(
                eq(sandboxUsage.userId, userId),
                eq(sandboxUsage.success, true),
                gte(sandboxUsage.createdAt, today),
            ),
        );

    const todayCount = usageToday[0]?.count || 0;

    if (todayCount >= RATE_LIMITS.VT_PLUS.dailyLimit) {
        throw new Error(
            `Daily sandbox limit reached (${todayCount}/${RATE_LIMITS.VT_PLUS.dailyLimit}). Limit resets at midnight UTC.`,
        );
    }
}

/**
 * Track successful sandbox usage
 * Increments the daily counter
 */
export async function trackSandboxUsage(): Promise<void> {
    const userId = await getCurrentUserId();

    await db.insert(sandboxUsage).values({
        userId,
        success: true,
        createdAt: new Date(),
        metadata: {
            source: "vtchat-ai-tool",
            tier: "VT_PLUS",
        },
    });
}

/**
 * Get current user's subscription tier
 * This should integrate with your existing user/subscription system
 */
async function getUserTier(): Promise<"VT_FREE" | "VT_PLUS"> {
    // TODO: Implement actual user tier checking
    // This should check the user's subscription status from your database
    // For now, returning VT_PLUS for development
    return "VT_PLUS";
}

/**
 * Get current user ID from context
 * This should integrate with your existing auth system
 */
async function getCurrentUserId(): Promise<string> {
    // TODO: Implement actual user ID retrieval
    // This should get the user ID from the current request context
    // For now, returning a placeholder
    return "current-user-id";
}

/**
 * Get sandbox usage statistics for the current user
 */
export async function getSandboxUsageStats(): Promise<{
    todayUsage: number;
    dailyLimit: number;
    remainingToday: number;
}> {
    const userId = await getCurrentUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageToday = await db
        .select({ count: sql<number>`count(*)` })
        .from(sandboxUsage)
        .where(
            and(
                eq(sandboxUsage.userId, userId),
                eq(sandboxUsage.success, true),
                gte(sandboxUsage.createdAt, today),
            ),
        );

    const todayCount = usageToday[0]?.count || 0;
    const dailyLimit = RATE_LIMITS.VT_PLUS.dailyLimit;

    return {
        todayUsage: todayCount,
        dailyLimit,
        remainingToday: Math.max(0, dailyLimit - todayCount),
    };
}
