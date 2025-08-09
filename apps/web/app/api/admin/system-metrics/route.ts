import { log } from "@repo/shared/lib/logger";
import { count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { feedback, providerUsage, sessions, users, vtplusUsage } from "@/lib/database/schema";

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

        // Core System Metrics
        const [totalUsers] = await db.select({ count: count() }).from(users);
        const [totalSessions] = await db.select({ count: count() }).from(sessions);
        const [totalFeedback] = await db.select({ count: count() }).from(feedback);

        // Activity Metrics
        const [activeSessions] = await db
            .select({ count: count() })
            .from(sessions)
            .where(sql`${sessions.expiresAt} > NOW()`);

        const [dailyActiveUsers] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${sessions.userId})` })
            .from(sessions)
            .where(gte(sessions.createdAt, oneDayAgo));

        const [weeklyActiveUsers] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${sessions.userId})` })
            .from(sessions)
            .where(gte(sessions.createdAt, sevenDaysAgo));

        const [monthlyActiveUsers] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${sessions.userId})` })
            .from(sessions)
            .where(gte(sessions.createdAt, thirtyDaysAgo));

        // Provider Usage Statistics
        const providerStats = await db
            .select({
                provider: providerUsage.provider,
                totalRequests: sql<number>`COUNT(*)`,
                uniqueUsers: sql<number>`COUNT(DISTINCT ${providerUsage.userId})`,
            })
            .from(providerUsage)
            .where(gte(providerUsage.requestTimestamp, thirtyDaysAgo))
            .groupBy(providerUsage.provider);

        // VT+ Feature Usage
        const vtPlusFeatureStats = await db
            .select({
                feature: vtplusUsage.feature,
                totalUsage: sum(vtplusUsage.used),
                uniqueUsers: sql<number>`COUNT(DISTINCT ${vtplusUsage.userId})`,
                avgUsagePerUser: sql<number>`AVG(${vtplusUsage.used})`,
            })
            .from(vtplusUsage)
            .where(gte(sql`${vtplusUsage.periodStart}::timestamp`, thirtyDaysAgo))
            .groupBy(vtplusUsage.feature);

        // Usage Trends (daily usage over last 30 days)
        const dailyUsageTrends = await db
            .select({
                date: sql<string>`DATE(${providerUsage.requestTimestamp})`,
                totalRequests: count(),
                uniqueUsers: sql<number>`COUNT(DISTINCT ${providerUsage.userId})`,
            })
            .from(providerUsage)
            .where(gte(providerUsage.requestTimestamp, thirtyDaysAgo))
            .groupBy(sql`DATE(${providerUsage.requestTimestamp})`)
            .orderBy(sql`DATE(${providerUsage.requestTimestamp})`);

        // User Growth Trends
        const userGrowthTrends = await db
            .select({
                date: sql<string>`DATE(${users.createdAt})`,
                newUsers: count(),
            })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo))
            .groupBy(sql`DATE(${users.createdAt})`)
            .orderBy(sql`DATE(${users.createdAt})`);

        // Top Users by Activity
        const topUsersByRequests = await db
            .select({
                userId: providerUsage.userId,
                userName: users.name,
                userEmail: users.email,
                userPlan: users.planSlug,
                totalRequests: count(),
            })
            .from(providerUsage)
            .leftJoin(users, eq(providerUsage.userId, users.id))
            .where(gte(providerUsage.requestTimestamp, thirtyDaysAgo))
            .groupBy(providerUsage.userId, users.name, users.email, users.planSlug)
            .orderBy(desc(count()))
            .limit(10);

        // System Health Indicators
        const avgSessionDuration = await db
            .select({
                avgDuration: sql<number>`AVG(EXTRACT(EPOCH FROM (${sessions.expiresAt} - ${sessions.createdAt})) / 3600)`,
            })
            .from(sessions)
            .where(gte(sessions.createdAt, sevenDaysAgo));

        // Error Rate Analysis (feedback as proxy for issues)
        const [errorRate] = await db
            .select({
                totalFeedback: count(),
                recentFeedback: sql<number>`COUNT(CASE WHEN ${feedback.createdAt} >= ${sevenDaysAgo} THEN 1 END)`,
            })
            .from(feedback);

        // Performance Metrics
        const performanceMetrics = {
            systemUptime: "99.9%", // This would come from monitoring systems
            avgResponseTime: "245ms", // This would come from APM
            requestsPerSecond:
                dailyUsageTrends.length > 0
                    ? Math.round(
                          dailyUsageTrends[dailyUsageTrends.length - 1]?.totalRequests /
                              (24 * 60 * 60),
                      )
                    : 0,
            errorRate: (errorRate.recentFeedback / Math.max(errorRate.totalFeedback, 1)) * 100,
        };

        return NextResponse.json({
            systemMetrics: {
                totalUsers: totalUsers.count,
                totalSessions: totalSessions.count,
                activeSessions: activeSessions.count,
                dailyActiveUsers: dailyActiveUsers.count,
                weeklyActiveUsers: weeklyActiveUsers.count,
                monthlyActiveUsers: monthlyActiveUsers.count,
                totalFeedback: totalFeedback.count,
                avgSessionDurationHours: avgSessionDuration[0]?.avgDuration || 0,
            },
            providerStats: providerStats.map((stat) => ({
                provider: stat.provider,
                requests: stat.totalRequests,
                uniqueUsers: Number(stat.uniqueUsers),
            })),
            vtPlusFeatureStats: vtPlusFeatureStats.map((stat) => ({
                feature: stat.feature,
                totalUsage: Number(stat.totalUsage) || 0,
                uniqueUsers: Number(stat.uniqueUsers) || 0,
                avgUsagePerUser: Number(stat.avgUsagePerUser) || 0,
            })),
            trends: {
                dailyUsage: dailyUsageTrends.map((day) => ({
                    date: day.date,
                    requests: day.totalRequests,
                    users: Number(day.uniqueUsers),
                })),
                userGrowth: userGrowthTrends.map((day) => ({
                    date: day.date,
                    newUsers: day.newUsers,
                })),
            },
            topUsers: {
                byRequests: topUsersByRequests.map((user) => ({
                    userId: user.userId,
                    name: user.userName,
                    email: user.userEmail,
                    plan: user.userPlan,
                    requests: user.totalRequests,
                })),
            },
            performanceMetrics,
        });
    } catch (error) {
        log.error({ error }, "Failed to fetch system metrics");
        return NextResponse.json({ error: "Failed to fetch system metrics" }, { status: 500 });
    }
}
