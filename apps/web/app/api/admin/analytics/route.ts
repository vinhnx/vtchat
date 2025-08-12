import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import {
    feedback,
    providerUsage,
    resources,
    sessions,
    users,
    vtplusUsage,
} from '@/lib/database/schema';
import { log } from '@repo/shared/lib/logger';
import { count, eq, gte, sql, sum } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Date ranges for analytics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // User growth metrics
        const [totalUsersCount] = await db.select({ count: count() }).from(users);

        const [newUsersLast30Days] = await db
            .select({ count: count() })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo));

        const [newUsersLast7Days] = await db
            .select({ count: count() })
            .from(users)
            .where(gte(users.createdAt, sevenDaysAgo));

        const [vtPlusUsers] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.planSlug, 'vt_plus'));

        // Session activity metrics
        const [activeSessionsLast24h] = await db
            .select({ count: count() })
            .from(sessions)
            .where(gte(sessions.createdAt, oneDayAgo));

        // Provider usage analytics
        const providerStats = await db
            .select({
                provider: providerUsage.provider,
                totalRequests: sql<number>`COUNT(*)`,
                uniqueUsers: sql<number>`COUNT(DISTINCT ${providerUsage.userId})`,
            })
            .from(providerUsage)
            .where(gte(providerUsage.requestTimestamp, thirtyDaysAgo))
            .groupBy(providerUsage.provider);

        // VT+ feature usage
        const vtPlusFeatureUsage = await db
            .select({
                feature: vtplusUsage.feature,
                totalUsage: sum(vtplusUsage.used),
                uniqueUsers: sql<number>`COUNT(DISTINCT ${vtplusUsage.userId})`,
            })
            .from(vtplusUsage)
            .where(gte(vtplusUsage.periodStart, thirtyDaysAgo.toISOString()))
            .groupBy(vtplusUsage.feature);

        // Feedback analytics
        const [totalFeedback] = await db.select({ count: count() }).from(feedback);

        const [recentFeedback] = await db
            .select({ count: count() })
            .from(feedback)
            .where(gte(feedback.createdAt, sevenDaysAgo));

        const [totalResources] = await db.select({ count: count() }).from(resources);

        const [recentResources] = await db
            .select({ count: count() })
            .from(resources)
            .where(gte(resources.createdAt, sevenDaysAgo));

        // Daily active users over time (last 30 days)
        const dailyActiveUsers = await db
            .select({
                date: sql<string>`DATE(${sessions.createdAt})`,
                activeUsers: sql<number>`COUNT(DISTINCT ${sessions.userId})`,
            })
            .from(sessions)
            .where(gte(sessions.createdAt, thirtyDaysAgo))
            .groupBy(sql`DATE(${sessions.createdAt})`)
            .orderBy(sql`DATE(${sessions.createdAt})`);

        // User registrations over time (last 30 days)
        const dailyRegistrations = await db
            .select({
                date: sql<string>`DATE(${users.createdAt})`,
                registrations: count(),
            })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo))
            .groupBy(sql`DATE(${users.createdAt})`)
            .orderBy(sql`DATE(${users.createdAt})`);

        return NextResponse.json({
            userMetrics: {
                totalUsers: totalUsersCount.count,
                newUsersLast30Days: newUsersLast30Days.count,
                newUsersLast7Days: newUsersLast7Days.count,
                vtPlusUsers: vtPlusUsers.count,
                conversionRate: totalUsersCount.count > 0
                    ? ((vtPlusUsers.count / totalUsersCount.count) * 100).toFixed(2)
                    : '0.00',
            },
            activityMetrics: {
                activeSessionsLast24h: activeSessionsLast24h.count,
                totalFeedback: totalFeedback.count,
                recentFeedback: recentFeedback.count,
                totalResources: totalResources.count,
                recentResources: recentResources.count,
            },
            providerUsage: providerStats.map((stat) => ({
                provider: stat.provider,
                requests: stat.totalRequests,
            })),
            vtPlusUsage: vtPlusFeatureUsage.map((usage) => ({
                feature: usage.feature,
                totalUsage: Number(usage.totalUsage) || 0,
                uniqueUsers: Number(usage.uniqueUsers) || 0,
            })),
            timeSeriesData: {
                dailyActiveUsers: dailyActiveUsers.map((day) => ({
                    date: day.date,
                    users: Number(day.activeUsers),
                })),
                dailyRegistrations: dailyRegistrations.map((day) => ({
                    date: day.date,
                    registrations: Number(day.registrations),
                })),
            },
        });
    } catch (error) {
        log.error({ error }, 'Failed to fetch analytics (detailed)');
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 },
        );
    }
}
