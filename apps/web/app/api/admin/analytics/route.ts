import { count, eq, gte, sql, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/middleware/admin-auth";
import { getAdminDateRanges } from "@repo/shared/utils/admin-date-utils";
import { AdminApiSuccess, handleAdminRouteError, formatCostFromCents, calculateConversionRate } from "@repo/shared/utils/admin-api-responses";
import { db } from "@/lib/database";
import {
    feedback,
    providerUsage,
    resources,
    sessions,
    users,
    vtplusUsage,
} from "@/lib/database/schema";

export async function GET(request: NextRequest) {
    // Use centralized admin authentication
    const authResult = await requireAdminAuth(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        // Use centralized date utilities
        const { thirtyDaysAgo, sevenDaysAgo, oneDayAgo } = getAdminDateRanges();

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
            .where(eq(users.planSlug, "vt_plus"));

        // Session activity metrics
        const [activeSessionsLast24h] = await db
            .select({ count: count() })
            .from(sessions)
            .where(gte(sessions.createdAt, oneDayAgo));

        // Provider usage analytics
        const providerUsageStats = await db
            .select({
                provider: providerUsage.provider,
                totalRequests: count(),
                totalCostCents: sum(providerUsage.estimatedCostCents),
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
            .where(gte(vtplusUsage.periodStart, thirtyDaysAgo))
            .groupBy(vtplusUsage.feature);

        // Feedback analytics
        const [totalFeedback] = await db.select({ count: count() }).from(feedback);

        const [recentFeedback] = await db
            .select({ count: count() })
            .from(feedback)
            .where(gte(feedback.createdAt, sevenDaysAgo));

        // RAG analytics
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

        // Use centralized response utilities and helper functions
        return AdminApiSuccess.ok({
            userMetrics: {
                totalUsers: totalUsersCount.count,
                newUsersLast30Days: newUsersLast30Days.count,
                newUsersLast7Days: newUsersLast7Days.count,
                vtPlusUsers: vtPlusUsers.count,
                conversionRate: calculateConversionRate(vtPlusUsers.count, totalUsersCount.count),
            },
            activityMetrics: {
                activeSessionsLast24h: activeSessionsLast24h.count,
                totalFeedback: totalFeedback.count,
                recentFeedback: recentFeedback.count,
                totalResources: totalResources.count,
                recentResources: recentResources.count,
            },
            providerUsage: providerUsageStats.map((stat) => ({
                provider: stat.provider,
                requests: stat.totalRequests,
                costUsd: formatCostFromCents(stat.totalCostCents),
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
        return handleAdminRouteError(error, "analytics");
    }
}
