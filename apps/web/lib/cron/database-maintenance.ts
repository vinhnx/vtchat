/**
 * Database maintenance cron jobs for optimal performance
 */

import { log } from "@repo/shared/logger";
import { cleanupExpiredSessions } from "../auth/optimized-session-management";
import { db } from "../database";

/**
 * Cleanup expired sessions and refresh materialized views
 * Run every hour
 */
export async function performDatabaseMaintenance(): Promise<void> {
    const startTime = Date.now();

    try {
        log.info("Starting database maintenance...");

        // 1. Cleanup expired sessions
        const deletedSessions = await cleanupExpiredSessions();

        // 2. Refresh subscription summary materialized view
        await db.execute("SELECT refresh_subscription_summary()");

        // 3. Update table statistics for better query planning
        await db.execute("ANALYZE users, user_subscriptions, sessions");

        // 4. Get maintenance stats
        const stats = await db.execute(`
            SELECT
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions
            FROM sessions
        `);

        const duration = Date.now() - startTime;

        log.info(
            {
                duration,
                deletedSessions,
                activeSessionsRemaining: stats.rows[0]?.active_sessions || 0,
            },
            "Database maintenance completed",
        );
    } catch (error) {
        const duration = Date.now() - startTime;
        log.error({ duration, error }, "Database maintenance failed");
        throw error;
    }
}

/**
 * Vacuum and reindex (run weekly)
 */
export async function performWeeklyMaintenance(): Promise<void> {
    const startTime = Date.now();

    try {
        log.info("Starting weekly database maintenance...");

        // 1. Vacuum analyze critical tables
        await db.execute("VACUUM ANALYZE users");
        await db.execute("VACUUM ANALYZE user_subscriptions");
        await db.execute("VACUUM ANALYZE sessions");

        // 2. Reindex if needed (only if fragmentation is high)
        const indexStats = await db.execute(`
            SELECT
                schemaname,
                tablename,
                indexname,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            ORDER BY idx_tup_read DESC
        `);

        // 3. Refresh all materialized views
        await db.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY user_subscription_summary");

        const duration = Date.now() - startTime;

        log.info(
            {
                duration,
                indexesChecked: indexStats.rowCount || 0,
            },
            "Weekly database maintenance completed",
        );
    } catch (error) {
        const duration = Date.now() - startTime;
        log.error({ duration, error }, "Weekly database maintenance failed");
        throw error;
    }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    stats: any;
}> {
    const issues: string[] = [];

    try {
        // Check connection
        await db.execute("SELECT 1");

        // Check for bloated tables
        const bloatCheck = await db.execute(`
            SELECT
                tablename,
                n_dead_tup,
                n_live_tup,
                CASE
                    WHEN n_live_tup > 0 THEN (n_dead_tup::float / n_live_tup * 100)::int
                    ELSE 0
                END as dead_tuple_percent
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY dead_tuple_percent DESC
        `);

        // Flag tables with > 20% dead tuples
        for (const row of bloatCheck.rows) {
            if ((row.dead_tuple_percent as number) > 20) {
                issues.push(`Table ${row.tablename} has ${row.dead_tuple_percent}% dead tuples`);
            }
        }

        // Check for unused indexes
        const unusedIndexes = await db.execute(`
            SELECT
                schemaname,
                tablename,
                indexname,
                idx_scan
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public' AND idx_scan = 0
        `);

        if (unusedIndexes.rowCount && unusedIndexes.rowCount > 0) {
            issues.push(`Found ${unusedIndexes.rowCount} unused indexes`);
        }

        // Check session table size
        const sessionStats = await db.execute(`
            SELECT
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions
            FROM sessions
        `);

        const expiredSessions = (sessionStats.rows[0]?.expired_sessions as number) || 0;
        if (expiredSessions > 1000) {
            issues.push(`${expiredSessions} expired sessions need cleanup`);
        }

        // Get overall stats
        const stats = {
            bloatedTables: bloatCheck.rows.filter((r) => (r.dead_tuple_percent as number) > 20)
                .length,
            unusedIndexes: unusedIndexes.rowCount || 0,
            expiredSessions,
            totalSessions: sessionStats.rows[0]?.total_sessions || 0,
        };

        return {
            healthy: issues.length === 0,
            issues,
            stats,
        };
    } catch (error) {
        log.error({ error }, "Database health check failed");
        return {
            healthy: false,
            issues: [`Database connection failed: ${error}`],
            stats: null,
        };
    }
}

/**
 * Optimize specific slow query (emergency use)
 */
export async function optimizeSlowQuery(query: string): Promise<{
    before: any;
    after: any;
    suggestions: string[];
}> {
    try {
        // Get query plan before optimization
        const beforePlan = await db.execute(`EXPLAIN (ANALYZE, BUFFERS) ${query}`);

        const suggestions: string[] = [];

        // Analyze the plan for optimization opportunities
        const planText = JSON.stringify(beforePlan.rows);

        if (planText.includes("Seq Scan")) {
            suggestions.push("Consider adding indexes for sequential scans");
        }

        if (planText.includes("Sort")) {
            suggestions.push("Consider adding ordered indexes to avoid sorting");
        }

        if (planText.includes("Nested Loop")) {
            suggestions.push("Consider hash joins by increasing work_mem");
        }

        // Run ANALYZE to update statistics
        await db.execute("ANALYZE");

        // Get query plan after ANALYZE
        const afterPlan = await db.execute(`EXPLAIN (ANALYZE, BUFFERS) ${query}`);

        return {
            before: beforePlan.rows,
            after: afterPlan.rows,
            suggestions,
        };
    } catch (error) {
        log.error({ query, error }, "Query optimization failed");
        throw error;
    }
}
