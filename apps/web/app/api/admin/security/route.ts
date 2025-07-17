import { log } from "@repo/shared/lib/logger";
import { and, count, desc, eq, gte, isNotNull, ne, or, sql, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { providerUsage, sessions, users } from "@/lib/database/schema";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Security Metrics
        const [bannedUsersCount] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.banned, true));

        const [activeBansCount] = await db
            .select({ count: count() })
            .from(users)
            .where(
                and(
                    eq(users.banned, true),
                    or(isNotNull(users.banExpires), sql`${users.banExpires} > NOW()`),
                ),
            );

        const [recentBansCount] = await db
            .select({ count: count() })
            .from(users)
            .where(and(eq(users.banned, true), gte(users.updatedAt, sevenDaysAgo)));

        // Session Security Metrics
        const [totalSessionsCount] = await db.select({ count: count() }).from(sessions);

        const [activeSessionsCount] = await db
            .select({ count: count() })
            .from(sessions)
            .where(sql`${sessions.expiresAt} > NOW()`);

        const [impersonatedSessionsCount] = await db
            .select({ count: count() })
            .from(sessions)
            .where(isNotNull(sessions.impersonatedBy));

        const suspiciousSessionsCount = await db
            .select({ count: count() })
            .from(sessions)
            .where(gte(sessions.createdAt, oneDayAgo))
            .groupBy(sessions.ipAddress)
            .having(sql`COUNT(*) > 10`);

        // Get banned users with details
        const bannedUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                banReason: users.banReason,
                banExpires: users.banExpires,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.banned, true))
            .orderBy(desc(users.updatedAt))
            .limit(20);

        // Get suspicious activity - users with high request rates (excluding admin users)
        const suspiciousActivity = await db
            .select({
                userId: providerUsage.userId,
                userName: users.name,
                userEmail: users.email,
                requestCount: count(),
                totalCostCents: sum(providerUsage.estimatedCostCents),
            })
            .from(providerUsage)
            .leftJoin(users, eq(providerUsage.userId, users.id))
            .where(and(gte(providerUsage.requestTimestamp, oneDayAgo), ne(users.role, "admin")))
            .groupBy(providerUsage.userId, users.name, users.email)
            .having(sql`COUNT(*) > 100`)
            .orderBy(desc(count()))
            .limit(10);

        // Get IP address analysis
        const ipAnalysis = await db
            .select({
                ipAddress: sessions.ipAddress,
                uniqueUsers: sql<number>`COUNT(DISTINCT ${sessions.userId})`,
                totalSessions: count(),
                recentSessions: sql<number>`COUNT(CASE WHEN ${sessions.createdAt} >= ${oneDayAgo} THEN 1 END)`,
            })
            .from(sessions)
            .where(isNotNull(sessions.ipAddress))
            .groupBy(sessions.ipAddress)
            .having(sql`COUNT(DISTINCT ${sessions.userId}) > 5 OR COUNT(*) > 20`)
            .orderBy(desc(sql`COUNT(DISTINCT ${sessions.userId})`))
            .limit(15);

        // Get recent impersonation activity
        const impersonationActivity = await db
            .select({
                sessionId: sessions.id,
                targetUserId: sessions.userId,
                targetUserName: users.name,
                targetUserEmail: users.email,
                impersonatedBy: sessions.impersonatedBy,
                createdAt: sessions.createdAt,
                ipAddress: sessions.ipAddress,
            })
            .from(sessions)
            .leftJoin(users, eq(sessions.userId, users.id))
            .where(and(isNotNull(sessions.impersonatedBy), gte(sessions.createdAt, thirtyDaysAgo)))
            .orderBy(desc(sessions.createdAt))
            .limit(20);

        // Account security metrics
        const [unverifiedEmailsCount] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.emailVerified, false));

        const [protectedUsersCount] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.protected, true));

        // Security events timeline (bans over time)
        const securityTimeline = await db
            .select({
                date: sql<string>`DATE(${users.updatedAt})`,
                banCount: count(),
            })
            .from(users)
            .where(and(eq(users.banned, true), gte(users.updatedAt, thirtyDaysAgo)))
            .groupBy(sql`DATE(${users.updatedAt})`)
            .orderBy(sql`DATE(${users.updatedAt})`);

        return NextResponse.json({
            securityMetrics: {
                totalBannedUsers: bannedUsersCount.count,
                activeBans: activeBansCount.count,
                recentBans: recentBansCount.count,
                totalSessions: totalSessionsCount.count,
                activeSessions: activeSessionsCount.count,
                impersonatedSessions: impersonatedSessionsCount.count,
                suspiciousSessions: suspiciousSessionsCount.length,
                unverifiedEmails: unverifiedEmailsCount.count,
                protectedUsers: protectedUsersCount.count,
            },
            bannedUsers,
            suspiciousActivity,
            ipAnalysis,
            impersonationActivity,
            securityTimeline,
        });
    } catch (error) {
        log.error({ error }, "Failed to fetch security data");
        return NextResponse.json({ error: "Failed to fetch security data" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case "bulkBan": {
                const { userIds, reason, expires } = data;
                await db
                    .update(users)
                    .set({
                        banned: true,
                        banReason: reason || "Bulk ban by admin",
                        banExpires: expires ? new Date(expires) : null,
                        updatedAt: new Date(),
                    })
                    .where(sql`${users.id} = ANY(${userIds})`);
                break;
            }

            case "revokeAllSessions": {
                const { userId } = data;
                await db.delete(sessions).where(eq(sessions.userId, userId));
                break;
            }

            case "blockIP":
                // This would require implementing IP blocking functionality
                // For now, just log the action
                log.info({ ipAddress: data.ipAddress }, "IP block requested");
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        log.error({ error }, "Failed to perform security action");
        return NextResponse.json({ error: "Failed to perform security action" }, { status: 500 });
    }
}
