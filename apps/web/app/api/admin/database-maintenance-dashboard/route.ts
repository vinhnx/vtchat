import { isUserAdmin } from '@/lib/admin';
import { auth } from '@/lib/auth-server';
import { http } from '@repo/shared/lib/http-client';
import { log } from '@repo/shared/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';

// This endpoint provides a dashboard view of database maintenance metrics
// For admin/monitoring purposes only
export async function GET(request: NextRequest) {
    // Check admin access
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const isAdmin = await isUserAdmin(session.user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
    } catch (authError) {
        log.error({ error: authError }, 'Admin auth check failed');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    try {
        const url = new URL(request.url);
        const hours = parseInt(url.searchParams.get('hours') || '24');

        // Get metrics from the metrics endpoint
        const metricsUrl = new URL('/api/metrics/database-maintenance', url.origin);
        metricsUrl.searchParams.set('hours', hours.toString());

        const data = await http.get(metricsUrl.toString());

        // Generate dashboard data
        const dashboard = {
            overview: {
                time_window_hours: hours,
                last_updated: new Date().toISOString(),
                health_status: calculateHealthStatus(data.summary),
                ...data.summary,
            },
            recent_activity: data.metrics.slice(-10).map((m) => ({
                timestamp: m.timestamp,
                type: m.maintenance_type,
                status: m.status,
                duration_seconds: Math.round(m.duration_ms / 1000),
                attempts: m.attempt,
                error: m.error,
            })),
            charts: {
                success_rate_trend: generateTrendData(data.metrics, 'success_rate'),
                duration_trend: generateTrendData(data.metrics, 'duration'),
                error_frequency: generateErrorFrequency(data.metrics),
            },
            alerts: generateAlerts(data.metrics, data.summary),
        };

        return NextResponse.json({
            success: true,
            dashboard,
        });
    } catch (error) {
        log.error(
            {
                error: error instanceof Error ? error.message : String(error),
                url: request.url,
            },
            'Failed to generate maintenance dashboard',
        );

        return NextResponse.json({ error: 'Failed to generate dashboard' }, { status: 500 });
    }
}

function calculateHealthStatus(summary: any): string {
    if (summary.total_runs === 0) return 'unknown';

    const successRate = summary.success_rate;
    const avgDuration = summary.average_duration_ms;

    if (successRate >= 95 && avgDuration < 60000) {
        // < 1 minute
        return 'excellent';
    } else if (successRate >= 90 && avgDuration < 120000) {
        // < 2 minutes
        return 'good';
    } else if (successRate >= 80 && avgDuration < 300000) {
        // < 5 minutes
        return 'warning';
    } else {
        return 'critical';
    }
}

function generateTrendData(metrics: any[], type: 'success_rate' | 'duration') {
    // Group metrics by hour
    const hourlyGroups = groupMetricsByHour(metrics);

    return Object.entries(hourlyGroups).map(([hour, hourMetrics]) => {
        if (type === 'success_rate') {
            const successCount = hourMetrics.filter((m) => m.status === 'success').length;
            return {
                timestamp: hour,
                value: hourMetrics.length > 0 ? (successCount / hourMetrics.length) * 100 : 0,
            };
        } else {
            const avgDuration = hourMetrics.length > 0
                ? hourMetrics.reduce((sum, m) => sum + m.duration_ms, 0) / hourMetrics.length
                : 0;
            return {
                timestamp: hour,
                value: Math.round(avgDuration / 1000), // Convert to seconds
            };
        }
    });
}

function generateErrorFrequency(metrics: any[]) {
    const errors = metrics.filter((m) => m.status === 'error' || m.status === 'fatal_error');

    // Group errors by type and hour
    const errorsByHour = groupMetricsByHour(errors);

    return Object.entries(errorsByHour).map(([hour, hourErrors]) => ({
        timestamp: hour,
        count: hourErrors.length,
        errors: hourErrors.map((e) => ({
            type: e.maintenance_type,
            message: e.error || 'Unknown error',
            attempts: e.attempt,
        })),
    }));
}

function groupMetricsByHour(metrics: any[]) {
    return metrics.reduce(
        (groups, metric) => {
            const hour = `${new Date(metric.timestamp).toISOString().substring(0, 13)}:00:00.000Z`;
            if (!groups[hour]) {
                groups[hour] = [];
            }
            groups[hour].push(metric);
            return groups;
        },
        {} as Record<string, any[]>,
    );
}

function generateAlerts(metrics: any[], summary: any) {
    const alerts = [];

    // Critical success rate
    if (summary.success_rate < 80) {
        alerts.push({
            severity: 'critical',
            type: 'low_success_rate',
            message: `Success rate is ${summary.success_rate.toFixed(1)}% (below 80% threshold)`,
            action: 'Investigate database connectivity and maintenance script errors',
        });
    }

    // High average duration
    if (summary.average_duration_ms > 300000) {
        // > 5 minutes
        alerts.push({
            severity: 'warning',
            type: 'high_duration',
            message: `Average duration is ${
                Math.round(summary.average_duration_ms / 1000)
            }s (above 5 minute threshold)`,
            action: 'Check database performance and maintenance script efficiency',
        });
    }

    // Recent consecutive failures
    const recentMetrics = metrics.slice(-5);
    const recentFailures = recentMetrics.filter((m) => m.status !== 'success').length;
    if (recentFailures >= 3) {
        alerts.push({
            severity: 'critical',
            type: 'consecutive_failures',
            message: `${recentFailures} of last 5 maintenance runs failed`,
            action: 'Immediate investigation required - maintenance system may be down',
        });
    }

    // No recent activity
    if (metrics.length > 0) {
        const lastMetric = metrics[metrics.length - 1];
        const timeSinceLastRun = Date.now() - new Date(lastMetric.timestamp).getTime();
        const hoursSinceLastRun = timeSinceLastRun / (1000 * 60 * 60);

        if (hoursSinceLastRun > 2) {
            // No activity for 2+ hours
            alerts.push({
                severity: 'warning',
                type: 'no_recent_activity',
                message: `No maintenance activity for ${hoursSinceLastRun.toFixed(1)} hours`,
                action: 'Check if cron jobs are running properly',
            });
        }
    }

    return alerts;
}
