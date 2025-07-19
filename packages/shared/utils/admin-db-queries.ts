import { count, eq, gte, sql, sum } from "drizzle-orm";
import type { AdminDateRanges } from "./admin-date-utils";

/**
 * Common database query utilities for admin analytics
 * Provides reusable query patterns to reduce duplication
 */

/**
 * Generic count query with optional date filtering
 */
export function createCountQuery<T extends Record<string, any>>(
    table: T,
    dateColumn?: keyof T,
    dateFilter?: Date,
) {
    const baseQuery = { count: count() };
    
    if (dateColumn && dateFilter) {
        return {
            select: baseQuery,
            from: table,
            where: gte(table[dateColumn], dateFilter),
        };
    }
    
    return {
        select: baseQuery,
        from: table,
    };
}

/**
 * User metrics queries
 */
export const UserQueries = {
    /**
     * Get total user count
     */
    getTotalUsers: (usersTable: any) => ({
        select: { count: count() },
        from: usersTable,
    }),

    /**
     * Get new users in date range
     */
    getNewUsers: (usersTable: any, dateFilter: Date) => ({
        select: { count: count() },
        from: usersTable,
        where: gte(usersTable.createdAt, dateFilter),
    }),

    /**
     * Get VT+ users count
     */
    getVtPlusUsers: (usersTable: any) => ({
        select: { count: count() },
        from: usersTable,
        where: eq(usersTable.planSlug, "vt_plus"),
    }),

    /**
     * Get banned users count
     */
    getBannedUsers: (usersTable: any) => ({
        select: { count: count() },
        from: usersTable,
        where: eq(usersTable.banned, true),
    }),

    /**
     * Get daily user registrations
     */
    getDailyRegistrations: (usersTable: any, dateFilter: Date) => ({
        select: {
            date: sql<string>`DATE(${usersTable.createdAt})`,
            registrations: count(),
        },
        from: usersTable,
        where: gte(usersTable.createdAt, dateFilter),
        groupBy: sql`DATE(${usersTable.createdAt})`,
        orderBy: sql`DATE(${usersTable.createdAt})`,
    }),
} as const;

/**
 * Session metrics queries
 */
export const SessionQueries = {
    /**
     * Get active sessions in date range
     */
    getActiveSessions: (sessionsTable: any, dateFilter: Date) => ({
        select: { count: count() },
        from: sessionsTable,
        where: gte(sessionsTable.createdAt, dateFilter),
    }),

    /**
     * Get daily active users
     */
    getDailyActiveUsers: (sessionsTable: any, dateFilter: Date) => ({
        select: {
            date: sql<string>`DATE(${sessionsTable.createdAt})`,
            activeUsers: sql<number>`COUNT(DISTINCT ${sessionsTable.userId})`,
        },
        from: sessionsTable,
        where: gte(sessionsTable.createdAt, dateFilter),
        groupBy: sql`DATE(${sessionsTable.createdAt})`,
        orderBy: sql`DATE(${sessionsTable.createdAt})`,
    }),
} as const;

/**
 * Provider usage queries
 */
export const ProviderUsageQueries = {
    /**
     * Get provider usage statistics
     */
    getProviderStats: (providerUsageTable: any, dateFilter: Date) => ({
        select: {
            provider: providerUsageTable.provider,
            totalRequests: count(),
            totalCostCents: sum(providerUsageTable.estimatedCostCents),
        },
        from: providerUsageTable,
        where: gte(providerUsageTable.requestTimestamp, dateFilter),
        groupBy: providerUsageTable.provider,
    }),

    /**
     * Get total provider usage cost
     */
    getTotalProviderCost: (providerUsageTable: any, dateFilter: Date) => ({
        select: {
            totalCostCents: sum(providerUsageTable.estimatedCostCents),
        },
        from: providerUsageTable,
        where: gte(providerUsageTable.requestTimestamp, dateFilter),
    }),
} as const;

/**
 * VT+ usage queries
 */
export const VtPlusUsageQueries = {
    /**
     * Get VT+ feature usage statistics
     */
    getFeatureUsage: (vtplusUsageTable: any, dateFilter: Date) => ({
        select: {
            feature: vtplusUsageTable.feature,
            totalUsage: sum(vtplusUsageTable.used),
            uniqueUsers: sql<number>`COUNT(DISTINCT ${vtplusUsageTable.userId})`,
        },
        from: vtplusUsageTable,
        where: gte(vtplusUsageTable.periodStart, dateFilter),
        groupBy: vtplusUsageTable.feature,
    }),
} as const;

/**
 * Feedback queries
 */
export const FeedbackQueries = {
    /**
     * Get total feedback count
     */
    getTotalFeedback: (feedbackTable: any) => ({
        select: { count: count() },
        from: feedbackTable,
    }),

    /**
     * Get recent feedback count
     */
    getRecentFeedback: (feedbackTable: any, dateFilter: Date) => ({
        select: { count: count() },
        from: feedbackTable,
        where: gte(feedbackTable.createdAt, dateFilter),
    }),
} as const;

/**
 * Resource queries (RAG)
 */
export const ResourceQueries = {
    /**
     * Get total resources count
     */
    getTotalResources: (resourcesTable: any) => ({
        select: { count: count() },
        from: resourcesTable,
    }),

    /**
     * Get recent resources count
     */
    getRecentResources: (resourcesTable: any, dateFilter: Date) => ({
        select: { count: count() },
        from: resourcesTable,
        where: gte(resourcesTable.createdAt, dateFilter),
    }),
} as const;

/**
 * Helper function to execute multiple queries in parallel
 */
export async function executeParallelQueries<T extends Record<string, any>>(
    db: any,
    queries: Record<string, T>,
): Promise<Record<string, any>> {
    const queryEntries = Object.entries(queries);
    const results = await Promise.all(
        queryEntries.map(async ([key, query]) => {
            const result = await db.select(query.select).from(query.from).where(query.where);
            return [key, result];
        }),
    );

    return Object.fromEntries(results);
}

/**
 * Common analytics data structure
 */
export interface AdminAnalyticsData {
    userMetrics: {
        totalUsers: number;
        newUsersLast30Days: number;
        newUsersLast7Days: number;
        vtPlusUsers: number;
        conversionRate: string;
    };
    activityMetrics: {
        activeSessionsLast24h: number;
        totalFeedback: number;
        recentFeedback: number;
        totalResources: number;
        recentResources: number;
    };
    providerUsage: Array<{
        provider: string;
        requests: number;
        costUsd: string;
    }>;
    vtPlusUsage: Array<{
        feature: string;
        totalUsage: number;
        uniqueUsers: number;
    }>;
    timeSeriesData: {
        dailyActiveUsers: Array<{
            date: string;
            users: number;
        }>;
        dailyRegistrations: Array<{
            date: string;
            registrations: number;
        }>;
    };
}

/**
 * Helper to format cost from cents to USD string
 */
export function formatCostFromCents(cents: number | null | undefined): string {
    if (!cents) return "0.00";
    return (Number(cents) / 100).toFixed(2);
}

/**
 * Helper to calculate conversion rate
 */
export function calculateConversionRate(vtPlusUsers: number, totalUsers: number): string {
    if (totalUsers === 0) return "0.00";
    return ((vtPlusUsers / totalUsers) * 100).toFixed(2);
}
