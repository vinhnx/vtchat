import { log } from "@repo/shared/logger";
import { NextResponse } from "next/server";
import { SubscriptionMonitoring } from "@/lib/monitoring/subscription-monitoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Canary user ID for monitoring (should be a test VT+ user)
const CANARY_USER_ID = "canary-vt-plus-user";

export async function GET() {
    try {
        const startTime = Date.now();

        // Get comprehensive metrics
        const [metrics, canaryResult] = await Promise.all([
            SubscriptionMonitoring.getMetrics(),
            SubscriptionMonitoring.canaryCheck(CANARY_USER_ID),
        ]);

        const responseTime = Date.now() - startTime;

        // Determine overall system health
        const isHealthy =
            metrics.duplicateActiveSubscriptions === 0 &&
            metrics.planSlugMismatches < 5 &&
            metrics.expiredButActiveSubscriptions < 10 &&
            canaryResult.success;

        const response = {
            timestamp: new Date().toISOString(),
            healthy: isHealthy,
            responseTime,
            metrics: {
                ...metrics,
                canary: canaryResult,
            },
            alerts: [],
        };

        // Add alerts for critical issues
        if (metrics.duplicateActiveSubscriptions > 0) {
            response.alerts.push({
                severity: "critical",
                message: `${metrics.duplicateActiveSubscriptions} users have duplicate active subscriptions`,
                action: "Immediate investigation required",
            });
        }

        if (metrics.planSlugMismatches > 5) {
            response.alerts.push({
                severity: "warning",
                message: `${metrics.planSlugMismatches} users have plan_slug mismatches`,
                action: "Review subscription synchronization",
            });
        }

        if (!canaryResult.success) {
            response.alerts.push({
                severity: "critical",
                message: `Canary check failed: ${canaryResult.error}`,
                action: "Check subscription system availability",
            });
        }

        // Log metrics for external monitoring systems
        log.info("Subscription metrics collected", {
            healthy: isHealthy,
            totalUsers: metrics.totalUsers,
            vtPlusUsers: metrics.vtPlusUsers,
            duplicateActiveSubscriptions: metrics.duplicateActiveSubscriptions,
            planSlugMismatches: metrics.planSlugMismatches,
            expiredButActiveSubscriptions: metrics.expiredButActiveSubscriptions,
            canarySuccess: canaryResult.success,
            canaryResponseTime: canaryResult.responseTime,
            alertCount: response.alerts.length,
        });

        return NextResponse.json(response);
    } catch (error) {
        log.error("Failed to collect subscription metrics", { error });

        return NextResponse.json(
            {
                timestamp: new Date().toISOString(),
                healthy: false,
                error: "Metrics collection failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
