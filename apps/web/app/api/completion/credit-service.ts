import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { kv } from '@vercel/kv';
import { eq } from 'drizzle-orm';

const DAILY_CREDITS_AUTH = process.env.FREE_CREDITS_LIMIT_REQUESTS_AUTH
    ? parseInt(process.env.FREE_CREDITS_LIMIT_REQUESTS_AUTH)
    : 0;

const DAILY_CREDITS_IP = process.env.FREE_CREDITS_LIMIT_REQUESTS_IP
    ? parseInt(process.env.FREE_CREDITS_LIMIT_REQUESTS_IP)
    : 0;

// Lua scripts for IP-based credits (unchanged)
const GET_REMAINING_CREDITS_SCRIPT = `
local key = KEYS[1]
local lastRefillKey = KEYS[2]
local dailyCredits = tonumber(ARGV[1])
local now = ARGV[2]

local lastRefill = redis.call('GET', lastRefillKey)

if lastRefill ~= now then
    redis.call('SET', key, dailyCredits)
    redis.call('SET', lastRefillKey, now)
    return dailyCredits
end

local remaining = redis.call('GET', key)
return remaining or 0
`;

const DEDUCT_CREDITS_SCRIPT = `
local key = KEYS[1]
local cost = tonumber(ARGV[1])

-- Get current credits
local remaining = tonumber(redis.call('GET', key)) or 0

-- Check if enough credits
if remaining < cost then
    return 0
end

-- Deduct credits atomically
redis.call('SET', key, remaining - cost)
return 1
`;

export type RequestIdentifier = {
    userId?: string;
    ip?: string;
};

/**
 * Get remaining credits for a user or IP
 * For authenticated users, prioritizes Creem.io credits from database,
 * then falls back to traditional daily credits.
 * For unauthenticated users, uses IP-based daily credits.
 */
export async function getRemainingCredits(identifier: RequestIdentifier): Promise<number> {
    const { userId, ip } = identifier;

    if (userId) {
        return getRemainingCreditsForUser(userId);
    } else if (ip) {
        return getRemainingCreditsForIp(ip);
    }

    return 0;
}

/**
 * Get remaining credits for authenticated user
 * First checks Creem.io credits from database,
 * then falls back to daily credits if no Creem credits available
 */
async function getRemainingCreditsForUser(userId: string): Promise<number> {
    try {
        // First, check Creem.io credits from database
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (user.length === 0) {
            console.error(`User ${userId} not found in database`);
            return 0;
        }

        const creemCredits = user[0].credits || 0;

        if (creemCredits > 0) {
            console.log(`User ${userId} has ${creemCredits} Creem.io credits`);
            return creemCredits;
        }

        // Fall back to traditional daily credits if no Creem credits
        if (DAILY_CREDITS_AUTH === 0) {
            return 0;
        }

        const key = `credits:user:${userId}`;
        const lastRefillKey = `${key}:lastRefill`;
        const now = new Date().toISOString().split('T')[0];

        const remaining = await kv.eval(
            GET_REMAINING_CREDITS_SCRIPT,
            [key, lastRefillKey],
            [DAILY_CREDITS_AUTH.toString(), now]
        );

        console.log(`User ${userId} has ${remaining} daily credits (fallback)`);
        return Number(remaining);
    } catch (error) {
        console.error('Failed to get remaining credits for user:', error);
        return 0;
    }
}

async function getRemainingCreditsForIp(ip: string): Promise<number> {
    if (DAILY_CREDITS_IP === 0) {
        return 0;
    }

    try {
        const key = `credits:ip:${ip}`;
        const lastRefillKey = `${key}:lastRefill`;
        const now = new Date().toISOString().split('T')[0];

        const result = await kv.eval(
            GET_REMAINING_CREDITS_SCRIPT,
            [key, lastRefillKey],
            [DAILY_CREDITS_IP.toString(), now]
        );
        return Number(result);
    } catch (error) {
        console.error('Failed to get remaining credits for IP:', error);
        return 0;
    }
}

/**
 * Deduct credits from user or IP
 * For authenticated users, prioritizes deducting from Creem.io credits,
 * then falls back to daily credits.
 * For unauthenticated users, uses IP-based daily credits.
 */
export async function deductCredits(identifier: RequestIdentifier, cost: number): Promise<boolean> {
    const { userId, ip } = identifier;

    if (userId) {
        return deductCreditsFromUser(userId, cost);
    } else if (ip) {
        return deductCreditsFromIp(ip, cost);
    }

    return false;
}

/**
 * Deduct credits from authenticated user
 * First tries to deduct from Creem.io credits,
 * then falls back to daily credits if needed
 */
async function deductCreditsFromUser(userId: string, cost: number): Promise<boolean> {
    try {
        // First, try to deduct from Creem.io credits stored in database
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (user.length === 0) {
            console.error(`User ${userId} not found in database`);
            return false;
        }

        const currentUser = user[0];
        const currentCreemCredits = currentUser.credits || 0;

        if (currentCreemCredits >= cost) {
            // Deduct from Creem.io credits
            const newBalance = currentCreemCredits - cost;

            // Update user credits in database
            await db
                .update(users)
                .set({
                    credits: newBalance,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            console.log(
                `Deducted ${cost} Creem.io credits from user ${userId}. New balance: ${newBalance}`
            );
            return true;
        }

        // Fall back to traditional daily credits
        const key = `credits:user:${userId}`;
        const success = (await kv.eval(DEDUCT_CREDITS_SCRIPT, [key], [cost.toString()])) === 1;

        if (success) {
            console.log(`Deducted ${cost} daily credits from user ${userId} (fallback)`);
        }

        return success;
    } catch (error) {
        console.error('Failed to deduct credits from user:', error);
        return false;
    }
}

async function deductCreditsFromIp(ip: string, cost: number): Promise<boolean> {
    try {
        const key = `credits:ip:${ip}`;
        return (await kv.eval(DEDUCT_CREDITS_SCRIPT, [key], [cost.toString()])) === 1;
    } catch (error) {
        console.error('Failed to deduct credits from IP:', error);
        return false;
    }
}

export { DAILY_CREDITS_AUTH, DAILY_CREDITS_IP };
