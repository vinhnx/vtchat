import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/lib/logger';

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
        // Database connection metrics
        const connectionStart = Date.now();
        await db.select().from(users).limit(1);
        const connectionTime = Date.now() - connectionStart;

        // Database size and table metrics
        const dbMetrics = await db.execute(
            sql`
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public'
            LIMIT 10
            `
        );

        // Get database activity statistics
        const dbActivity = await db.execute(
            sql`
            SELECT 
                numbackends as active_connections,
                xact_commit as transactions_committed,
                xact_rollback as transactions_rolled_back,
                blks_read as blocks_read,
                blks_hit as blocks_hit,
                tup_returned as tuples_returned,
                tup_fetched as tuples_fetched,
                tup_inserted as tuples_inserted,
                tup_updated as tuples_updated,
                tup_deleted as tuples_deleted
            FROM pg_stat_database 
            WHERE datname = current_database()
            `
        );

        // Get table sizes
        const tableSizes = await db.execute(
            sql`
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10
            `
        );

        // Get index usage statistics
        const indexStats = await db.execute(
            sql`
            SELECT 
                schemaname,
                relname as tablename,
                indexrelname as indexname,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes 
            WHERE schemaname = 'public'
            ORDER BY idx_tup_read DESC
            LIMIT 10
            `
        );

        // Calculate cache hit ratio
        const activity = dbActivity.rows[0] as any;
        const cacheHitRatio = activity
            ? ((activity.blocks_hit / (activity.blocks_hit + activity.blocks_read)) * 100).toFixed(
                  2
              )
            : '0';

        // Determine database health based on metrics
        let dbHealth = 'excellent';
        if (connectionTime > 1000) {
            dbHealth = 'critical';
        } else if (connectionTime > 500) {
            dbHealth = 'warning';
        } else if (connectionTime > 100) {
            dbHealth = 'good';
        }

        return NextResponse.json({
            database: {
                health: dbHealth,
                connectionTime,
                provider: 'neon',
                region: process.env.NEON_REGION || 'unknown',
                metrics: {
                    cacheHitRatio: parseFloat(cacheHitRatio),
                    activeConnections: activity?.active_connections || 0,
                    transactionsCommitted: activity?.transactions_committed || 0,
                    transactionsRolledBack: activity?.transactions_rolled_back || 0,
                    tuplesReturned: activity?.tuples_returned || 0,
                    tuplesFetched: activity?.tuples_fetched || 0,
                    tuplesInserted: activity?.tuples_inserted || 0,
                    tuplesUpdated: activity?.tuples_updated || 0,
                    tuplesDeleted: activity?.tuples_deleted || 0,
                },
                tables: tableSizes.rows.map((row: any) => ({
                    schema: row.schemaname,
                    name: row.tablename,
                    size: row.size,
                    sizeBytes: row.size_bytes,
                })),
                indexes: indexStats.rows.map((row: any) => ({
                    schema: row.schemaname,
                    table: row.tablename,
                    name: row.indexname,
                    tuplesRead: row.idx_tup_read,
                    tuplesFetched: row.idx_tup_fetch,
                })),
                statistics: dbMetrics.rows.slice(0, 5).map((row: any) => ({
                    schema: row.schemaname,
                    table: row.tablename,
                    column: row.attname,
                    distinctValues: row.n_distinct,
                    correlation: row.correlation,
                })),
            },
        });
    } catch (error) {
        log.error({ error }, 'Failed to fetch database metrics');
        return NextResponse.json({ error: 'Failed to fetch database metrics' }, { status: 500 });
    }
}
