import { log } from '@repo/shared/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Metrics schema for validation
const MetricsSchema = z.object({
    timestamp: z.iso.datetime(),
    maintenance_type: z.enum(['hourly', 'weekly']),
    status: z.enum(['success', 'error', 'fatal_error', 'unhandled_rejection']),
    duration_ms: z.number().min(0),
    attempt: z.number().min(1),
    error: z.string().nullable(),
    environment: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
});

type MaintenanceMetrics = z.infer<typeof MetricsSchema>;

// In-memory storage for metrics (in production, use Redis/Database)
const metricsStore: MaintenanceMetrics[] = [];
const MAX_STORED_METRICS = 1000; // Keep last 1000 metrics

// Add mock data for development/testing
if (process.env.NODE_ENV === 'development') {
    const now = new Date();
    const mockData: MaintenanceMetrics[] = [
        {
            timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 12500,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 8750,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            maintenance_type: 'hourly',
            status: 'error',
            duration_ms: 45000,
            attempt: 2,
            error: 'Database connection timeout',
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 15200,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 9800,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 11300,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
        {
            timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            maintenance_type: 'weekly',
            status: 'success',
            duration_ms: 125000,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'database_maintenance' },
        },
        {
            timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            maintenance_type: 'hourly',
            status: 'success',
            duration_ms: 13700,
            attempt: 1,
            error: null,
            environment: 'development',
            metadata: { task: 'cleanup_old_sessions' },
        },
    ];

    metricsStore.push(...mockData);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate metrics data
        const metrics = MetricsSchema.parse(body);

        // Store metrics (in production, persist to database/Redis)
        metricsStore.push(metrics);

        // Keep only the most recent metrics
        if (metricsStore.length > MAX_STORED_METRICS) {
            metricsStore.splice(0, metricsStore.length - MAX_STORED_METRICS);
        }

        // Log structured metrics for monitoring systems
        log.info(
            {
                metrics,
                stored_count: metricsStore.length,
            },
            'Database maintenance metrics received',
        );

        // Check for alerting conditions
        await checkAlertConditions(metrics);

        return NextResponse.json({
            success: true,
            stored: true,
            metrics_count: metricsStore.length,
        });
    } catch (error) {
        log.error(
            { error: error instanceof Error ? error.message : String(error) },
            'Failed to process maintenance metrics',
        );

        return NextResponse.json({ error: 'Failed to process metrics' }, { status: 400 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const maintenance_type = url.searchParams.get('type');
        const hours = parseInt(url.searchParams.get('hours') || '24');

        // Filter metrics by time window and type
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        let filteredMetrics = metricsStore.filter((m) => new Date(m.timestamp) > cutoffTime);

        if (maintenance_type) {
            filteredMetrics = filteredMetrics.filter(
                (m) => m.maintenance_type === maintenance_type,
            );
        }

        // Calculate summary statistics
        const summary = calculateMetricsSummary(filteredMetrics);

        return NextResponse.json({
            success: true,
            time_window_hours: hours,
            maintenance_type: maintenance_type || 'all',
            metrics: filteredMetrics,
            summary,
        });
    } catch (error) {
        log.error(
            { error: error instanceof Error ? error.message : String(error) },
            'Failed to retrieve maintenance metrics',
        );

        return NextResponse.json({ error: 'Failed to retrieve metrics' }, { status: 500 });
    }
}

// Alert condition checker
async function checkAlertConditions(metrics: MaintenanceMetrics) {
    const recentMetrics = metricsStore.slice(-10); // Last 10 metrics

    // Alert conditions
    const conditions = {
        // More than 3 consecutive failures
        consecutive_failures: checkConsecutiveFailures(recentMetrics),
        // Average duration > 5 minutes
        high_duration: metrics.duration_ms > 5 * 60 * 1000,
        // More than 2 retries needed
        high_retry_count: metrics.attempt > 2,
        // Fatal error occurred
        fatal_error: metrics.status === 'fatal_error',
    };

    const alerts = Object.entries(conditions)
        .filter(([, condition]) => condition)
        .map(([name]) => name);

    if (alerts.length > 0) {
        log.warn(
            {
                alerts,
                metrics,
                recent_metrics_count: recentMetrics.length,
            },
            'Database maintenance alert conditions triggered',
        );

        // In production, send alerts to monitoring systems here
        // - Send to Slack/Discord
        // - Send to PagerDuty
        // - Send email notifications
        // - Update monitoring dashboards
    }
}

function checkConsecutiveFailures(metrics: MaintenanceMetrics[]): boolean {
    if (metrics.length < 3) return false;

    const recent = metrics.slice(-3);
    return recent.every((m) => m.status === 'error' || m.status === 'fatal_error');
}

function calculateMetricsSummary(metrics: MaintenanceMetrics[]) {
    if (metrics.length === 0) {
        return {
            total_runs: 0,
            success_rate: 0,
            average_duration_ms: 0,
            max_duration_ms: 0,
            total_errors: 0,
            error_rate: 0,
        };
    }

    const successCount = metrics.filter((m) => m.status === 'success').length;
    const errorCount = metrics.filter(
        (m) => m.status === 'error' || m.status === 'fatal_error',
    ).length;

    const durations = metrics.map((m) => m.duration_ms);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    return {
        total_runs: metrics.length,
        success_rate: (successCount / metrics.length) * 100,
        average_duration_ms: Math.round(avgDuration),
        max_duration_ms: maxDuration,
        total_errors: errorCount,
        error_rate: (errorCount / metrics.length) * 100,
        by_type: {
            hourly: metrics.filter((m) => m.maintenance_type === 'hourly').length,
            weekly: metrics.filter((m) => m.maintenance_type === 'weekly').length,
        },
    };
}
