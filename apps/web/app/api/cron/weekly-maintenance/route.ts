/**
 * Weekly database maintenance cron job
 * Runs VACUUM, ANALYZE, and index maintenance
 */

import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';
import {
    checkDatabaseHealth,
    performWeeklyMaintenance,
} from '../../../../lib/cron/database-maintenance';

export async function POST(request: NextRequest) {
    try {
        // Verify the request is from a trusted source
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.CRON_SECRET_TOKEN;

        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            log.warn('Unauthorized weekly maintenance request', {
                hasAuth: !!authHeader,
                hasToken: !!expectedToken,
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        log.info('Starting scheduled weekly database maintenance...');

        // Perform weekly maintenance
        await performWeeklyMaintenance();

        // Get health stats after maintenance
        const health = await checkDatabaseHealth();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            type: 'weekly',
            health: {
                healthy: health.healthy,
                issues: health.issues,
                stats: health.stats,
            },
        });
    } catch (error) {
        log.error('Weekly database maintenance failed:', { error });
        return NextResponse.json(
            {
                success: false,
                error: 'Weekly maintenance failed',
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Weekly database maintenance cron endpoint',
        method: 'POST',
        auth: 'Bearer token required',
        schedule: 'Weekly',
    });
}
