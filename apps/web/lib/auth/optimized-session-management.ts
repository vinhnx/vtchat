/**
 * Optimized session management using Neon database optimizations
 */

import { log } from "@repo/shared/logger";
import { and, desc, eq, lt } from "drizzle-orm";
import { redisCache } from "../cache/redis-cache";
import { db } from "../database";
import { sessions } from "../database/schema";

interface SessionData {
    id: string;
    userId: string;
    expiresAt: Date;
    token?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}

/**
 * Fast session validation using Redis + optimized DB queries
 */
export async function validateSessionOptimized(sessionId: string): Promise<SessionData | null> {
    if (!sessionId) return null;

    // 1. Check Redis cache first (5 minute TTL)
    const cacheKey = `session:${sessionId}`;
    const cached = await redisCache.get<SessionData>(cacheKey);
    if (cached) {
        // Check if still valid
        if (cached.expiresAt > new Date()) {
            return cached;
        } else {
            // Remove expired session from cache
            await redisCache.del(cacheKey);
        }
    }

    try {
        // 2. Query database using optimized index
        const result = await db
            .select({
                id: sessions.id,
                userId: sessions.userId,
                expiresAt: sessions.expiresAt,
                token: sessions.token,
                ipAddress: sessions.ipAddress,
                userAgent: sessions.userAgent,
            })
            .from(sessions)
            .where(
                and(
                    eq(sessions.id, sessionId),
                    lt(new Date(), sessions.expiresAt), // Only get non-expired sessions
                ),
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const sessionData = result[0];

        // 3. Cache valid session for 5 minutes
        await redisCache.set(cacheKey, sessionData, 300);

        return sessionData;
    } catch (error) {
        log.error("Session validation failed:", { sessionId, error });
        return null;
    }
}

/**
 * Get user sessions with pagination and optimization
 */
export async function getUserSessions(userId: string, limit: number = 10): Promise<SessionData[]> {
    if (!userId) return [];

    try {
        // Use the composite index (user_id, expires_at DESC)
        const result = await db
            .select({
                id: sessions.id,
                userId: sessions.userId,
                expiresAt: sessions.expiresAt,
                token: sessions.token,
                ipAddress: sessions.ipAddress,
                userAgent: sessions.userAgent,
            })
            .from(sessions)
            .where(
                and(
                    eq(sessions.userId, userId),
                    lt(new Date(), sessions.expiresAt), // Only active sessions
                ),
            )
            .orderBy(desc(sessions.expiresAt))
            .limit(limit);

        return result;
    } catch (error) {
        log.error("Failed to get user sessions:", { userId, error });
        return [];
    }
}

/**
 * Optimized session cleanup using database function
 */
export async function cleanupExpiredSessions(): Promise<number> {
    try {
        // Use our optimized database function
        const result = await db.execute("SELECT cleanup_expired_sessions() as deleted_count");
        const deletedCount = (result.rows[0]?.deleted_count as number) || 0;

        log.info("Session cleanup completed", { deletedCount });
        return deletedCount;
    } catch (error) {
        log.error("Session cleanup failed:", { error });
        return 0;
    }
}

/**
 * Revoke specific session and clear cache
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;

    try {
        // Delete from database
        const result = await db
            .delete(sessions)
            .where(eq(sessions.id, sessionId))
            .returning({ id: sessions.id });

        if (result.length > 0) {
            // Clear from cache
            const cacheKey = `session:${sessionId}`;
            await redisCache.del(cacheKey);

            log.debug("Session revoked", { sessionId });
            return true;
        }

        return false;
    } catch (error) {
        log.error("Failed to revoke session:", { sessionId, error });
        return false;
    }
}

/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(userId: string): Promise<number> {
    if (!userId) return 0;

    try {
        // Get all session IDs first for cache cleanup
        const userSessions = await db
            .select({ id: sessions.id })
            .from(sessions)
            .where(eq(sessions.userId, userId));

        // Delete all sessions
        const result = await db
            .delete(sessions)
            .where(eq(sessions.userId, userId))
            .returning({ id: sessions.id });

        // Clear from cache
        for (const session of userSessions) {
            const cacheKey = `session:${session.id}`;
            await redisCache.del(cacheKey);
        }

        log.info("User sessions revoked", { userId, count: result.length });
        return result.length;
    } catch (error) {
        log.error("Failed to revoke user sessions:", { userId, error });
        return 0;
    }
}

/**
 * Session statistics for monitoring
 */
export async function getSessionStats() {
    try {
        const result = await db.execute(`
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
                COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions,
                COUNT(DISTINCT user_id) as unique_users,
                MIN(expires_at) as oldest_expiry,
                MAX(expires_at) as newest_expiry
            FROM sessions
        `);

        return result.rows[0];
    } catch (error) {
        log.error("Failed to get session stats:", { error });
        return null;
    }
}

/**
 * Validate session token (faster than session ID lookup)
 */
export async function validateSessionToken(token: string): Promise<SessionData | null> {
    if (!token) return null;

    // Use Redis cache with token as key
    const cacheKey = `session_token:${token}`;
    const cached = await redisCache.get<SessionData>(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
        return cached;
    }

    try {
        // Query using token index
        const result = await db
            .select({
                id: sessions.id,
                userId: sessions.userId,
                expiresAt: sessions.expiresAt,
                token: sessions.token,
                ipAddress: sessions.ipAddress,
                userAgent: sessions.userAgent,
            })
            .from(sessions)
            .where(and(eq(sessions.token, token), lt(new Date(), sessions.expiresAt)))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const sessionData = result[0];

        // Cache for 5 minutes
        await redisCache.set(cacheKey, sessionData, 300);

        return sessionData;
    } catch (error) {
        log.error("Token validation failed:", { error });
        return null;
    }
}

/**
 * Create optimized session with caching
 */
export async function createSessionOptimized(
    sessionData: Omit<SessionData, "id">,
): Promise<string | null> {
    try {
        const result = await db
            .insert(sessions)
            .values({
                userId: sessionData.userId,
                expiresAt: sessionData.expiresAt,
                token: sessionData.token,
                ipAddress: sessionData.ipAddress,
                userAgent: sessionData.userAgent,
            })
            .returning({ id: sessions.id });

        if (result.length > 0) {
            const sessionId = result[0].id;

            // Cache immediately
            const cacheKey = `session:${sessionId}`;
            await redisCache.set(cacheKey, { id: sessionId, ...sessionData }, 300);

            // Also cache by token if available
            if (sessionData.token) {
                const tokenCacheKey = `session_token:${sessionData.token}`;
                await redisCache.set(tokenCacheKey, { id: sessionId, ...sessionData }, 300);
            }

            return sessionId;
        }

        return null;
    } catch (error) {
        log.error("Failed to create session:", { error });
        return null;
    }
}

export type { SessionData };
