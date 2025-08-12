import { auth } from '@/lib/auth-server';
import { SubscriptionMonitoring } from '@/lib/monitoring/subscription-monitoring';
import { log } from '@repo/shared/logger';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check if user is admin
        const session = await auth.api.getSession({
            headers: new Headers(),
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 },
            );
        }

        // Get comprehensive health check
        const health = await SubscriptionMonitoring.healthCheck();

        log.info('Subscription health check requested', {
            adminUserId: session.user.id,
            healthy: health.healthy,
            issueCount: health.issues.length,
        });

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            healthy: health.healthy,
            issues: health.issues,
            metrics: health.metrics,
            recommendations: health.healthy
                ? []
                : [
                    'Run auto-fix: POST /api/admin/subscription-health/fix',
                    'Check database constraints are active',
                    'Verify cache invalidation is working',
                    'Review recent subscription changes',
                ],
        });
    } catch (error) {
        log.error('Subscription health check failed', { error });
        return NextResponse.json(
            {
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}

export async function POST() {
    try {
        // Check if user is admin
        const session = await auth.api.getSession({
            headers: new Headers(),
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 },
            );
        }

        log.info('Auto-fix subscription issues requested', {
            adminUserId: session.user.id,
        });

        // Run auto-fix
        const fixResult = await SubscriptionMonitoring.autoFixIssues();

        log.info('Auto-fix completed', {
            adminUserId: session.user.id,
            fixed: fixResult.fixed,
            failed: fixResult.failed,
            errors: fixResult.errors,
        });

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            success: fixResult.failed === 0,
            fixed: fixResult.fixed,
            failed: fixResult.failed,
            errors: fixResult.errors,
            message: fixResult.failed === 0
                ? `Successfully fixed ${fixResult.fixed} subscription issues`
                : `Fixed ${fixResult.fixed} issues, ${fixResult.failed} failed`,
        });
    } catch (error) {
        log.error('Auto-fix subscription issues failed', { error });
        return NextResponse.json(
            {
                error: 'Auto-fix failed',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
