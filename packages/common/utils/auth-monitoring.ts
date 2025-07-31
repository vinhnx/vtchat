"use client";

import { log } from "@repo/shared/logger";

interface AuthEvent {
    type: "session_check" | "session_refresh" | "auth_error" | "redirect" | "recovery";
    timestamp: Date;
    details: Record<string, any>;
    pathname?: string;
    userId?: string;
}

interface AuthMetrics {
    sessionChecks: number;
    sessionRefreshes: number;
    authErrors: number;
    redirects: number;
    recoveries: number;
    lastActivity: Date | null;
}

class AuthMonitor {
    private events: AuthEvent[] = [];
    private metrics: AuthMetrics = {
        sessionChecks: 0,
        sessionRefreshes: 0,
        authErrors: 0,
        redirects: 0,
        recoveries: 0,
        lastActivity: null,
    };
    private maxEvents = 100; // Keep last 100 events

    logEvent(
        type: AuthEvent["type"],
        details: Record<string, any> = {},
        pathname?: string,
        userId?: string,
    ) {
        const event: AuthEvent = {
            type,
            timestamp: new Date(),
            details,
            pathname,
            userId,
        };

        // Add to events array
        this.events.push(event);
        if (this.events.length > this.maxEvents) {
            this.events.shift(); // Remove oldest event
        }

        // Update metrics
        this.metrics[this.getMetricKey(type)]++;
        this.metrics.lastActivity = event.timestamp;

        // Log to console in development
        if (process.env.NODE_ENV === "development") {
            log.debug(
                {
                    authEvent: type,
                    details,
                    pathname,
                    userId: userId ? `${userId.substring(0, 8)}...` : undefined,
                },
                `[AuthMonitor] ${type}`,
            );
        }

        // Log critical events in production
        if (process.env.NODE_ENV === "production" && ["auth_error", "redirect"].includes(type)) {
            log.warn(
                {
                    authEvent: type,
                    details,
                    pathname,
                    metrics: this.getMetrics(),
                },
                `[AuthMonitor] Critical auth event: ${type}`,
            );
        }
    }

    private getMetricKey(type: AuthEvent["type"]): keyof Omit<AuthMetrics, "lastActivity"> {
        switch (type) {
            case "session_check":
                return "sessionChecks";
            case "session_refresh":
                return "sessionRefreshes";
            case "auth_error":
                return "authErrors";
            case "redirect":
                return "redirects";
            case "recovery":
                return "recoveries";
            default:
                return "authErrors";
        }
    }

    getMetrics(): AuthMetrics {
        return { ...this.metrics };
    }

    getRecentEvents(limit: number = 10): AuthEvent[] {
        return this.events.slice(-limit);
    }

    getEventsByType(type: AuthEvent["type"], limit: number = 10): AuthEvent[] {
        return this.events.filter((event) => event.type === type).slice(-limit);
    }

    // Check for patterns that might indicate issues
    detectIssues(): string[] {
        const issues: string[] = [];
        const recentEvents = this.getRecentEvents(20);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        // Check for frequent auth errors
        const recentErrors = recentEvents.filter(
            (event) => event.type === "auth_error" && event.timestamp > fiveMinutesAgo,
        );
        if (recentErrors.length > 3) {
            issues.push(`High auth error rate: ${recentErrors.length} errors in last 5 minutes`);
        }

        // Check for frequent redirects
        const recentRedirects = recentEvents.filter(
            (event) => event.type === "redirect" && event.timestamp > fiveMinutesAgo,
        );
        if (recentRedirects.length > 2) {
            issues.push(
                `Frequent redirects: ${recentRedirects.length} redirects in last 5 minutes`,
            );
        }

        // Check for session refresh failures
        const recentRefreshes = recentEvents.filter(
            (event) => event.type === "session_refresh" && event.timestamp > fiveMinutesAgo,
        );
        const failedRefreshes = recentRefreshes.filter((event) => event.details.success === false);
        if (failedRefreshes.length > 1) {
            issues.push(`Session refresh failures: ${failedRefreshes.length} failed refreshes`);
        }

        return issues;
    }

    // Generate a summary report
    generateReport(): string {
        const metrics = this.getMetrics();
        const issues = this.detectIssues();
        const recentEvents = this.getRecentEvents(5);

        let report = `Auth Monitor Report (${new Date().toISOString()})\n`;
        report += "===========================================\n\n";

        report += "Metrics:\n";
        report += `- Session Checks: ${metrics.sessionChecks}\n`;
        report += `- Session Refreshes: ${metrics.sessionRefreshes}\n`;
        report += `- Auth Errors: ${metrics.authErrors}\n`;
        report += `- Redirects: ${metrics.redirects}\n`;
        report += `- Recoveries: ${metrics.recoveries}\n`;
        report += `- Last Activity: ${metrics.lastActivity?.toISOString() || "None"}\n\n`;

        if (issues.length > 0) {
            report += "Issues Detected:\n";
            issues.forEach((issue) => {
                report += `- ${issue}\n`;
            });
            report += "\n";
        }

        report += "Recent Events:\n";
        recentEvents.forEach((event) => {
            report += `- ${event.timestamp.toISOString()} [${event.type}] ${JSON.stringify(event.details)}\n`;
        });

        return report;
    }

    // Clear all data (useful for testing)
    clear() {
        this.events = [];
        this.metrics = {
            sessionChecks: 0,
            sessionRefreshes: 0,
            authErrors: 0,
            redirects: 0,
            recoveries: 0,
            lastActivity: null,
        };
    }
}

// Global auth monitor instance
export const authMonitor = new AuthMonitor();

// Convenience functions for common events
export const logSessionCheck = (success: boolean, pathname?: string, userId?: string) => {
    authMonitor.logEvent("session_check", { success }, pathname, userId);
};

export const logSessionRefresh = (success: boolean, error?: string, userId?: string) => {
    authMonitor.logEvent("session_refresh", { success, error }, undefined, userId);
};

export const logAuthError = (error: string, pathname?: string, userId?: string) => {
    authMonitor.logEvent("auth_error", { error }, pathname, userId);
};

export const logAuthRedirect = (from: string, to: string, reason?: string) => {
    authMonitor.logEvent("redirect", { from, to, reason }, from);
};

export const logAuthRecovery = (success: boolean, method: string, userId?: string) => {
    authMonitor.logEvent("recovery", { success, method }, undefined, userId);
};

// Hook for React components to access auth monitoring
export const useAuthMonitoring = () => {
    return {
        logSessionCheck,
        logSessionRefresh,
        logAuthError,
        logAuthRedirect,
        logAuthRecovery,
        getMetrics: () => authMonitor.getMetrics(),
        getRecentEvents: (limit?: number) => authMonitor.getRecentEvents(limit),
        detectIssues: () => authMonitor.detectIssues(),
        generateReport: () => authMonitor.generateReport(),
    };
};
