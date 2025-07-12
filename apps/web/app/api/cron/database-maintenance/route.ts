/**
 * Cron job for database maintenance
 * Runs every hour to cleanup expired sessions and refresh materialized views
 */

import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';
import {
    checkDatabaseHealth,
    performDatabaseMaintenance,
} from '../../../../lib/cron/database-maintenance';

// This endpoint should be called by a cron service like Vercel Cron or GitHub Actions
export async function POST(request: NextRequest) {
    try {
        // Verify the request is from a trusted source
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.CRON_SECRET_TOKEN;

        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            log.warn('Unauthorized cron request', {
                hasAuth: !!authHeader,
                hasToken: !!expectedToken,
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        log.info('Starting scheduled database maintenance...');

        // Perform maintenance
        await performDatabaseMaintenance();

        // Get health stats
        const health = await checkDatabaseHealth();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            health: {
                healthy: health.healthy,
                issues: health.issues,
                stats: health.stats,
            },
        });
    } catch (error) {
        log.error('Database maintenance cron failed:', { error });
        return NextResponse.json(
            {
                success: false,
                error: 'Maintenance failed',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Database maintenance cron endpoint',
        method: 'POST',
        auth: 'Bearer token required',
    });
}
