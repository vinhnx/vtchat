/**
 * Performance monitoring utilities for authentication flow
 */

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private timers: Map<string, number> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    startTimer(operation: string): void {
        this.timers.set(operation, performance.now());
        console.log(`[Performance] Started: ${operation}`);
    }

    endTimer(operation: string): number {
        const startTime = this.timers.get(operation);
        if (!startTime) {
            console.warn(`[Performance] No start time found for: ${operation}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(operation);

        console.log(`[Performance] Completed: ${operation} (${duration.toFixed(2)}ms)`);

        // Log slow operations
        if (duration > 2000) {
            console.warn(
                `[Performance] SLOW OPERATION: ${operation} took ${duration.toFixed(2)}ms`
            );
        }

        return duration;
    }

    async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
        this.startTimer(operation);
        try {
            const result = await fn();
            this.endTimer(operation);
            return result;
        } catch (error) {
            this.endTimer(operation);
            console.error(`[Performance] Failed: ${operation}`, error);
            throw error;
        }
    }
}

export const perfMonitor = PerformanceMonitor.getInstance();

// Auth-specific performance monitoring
export const monitorAuth = {
    sessionCheck: (fn: () => Promise<any>) => perfMonitor.measureAsync('auth-session-check', fn),

    subscriptionFetch: (fn: () => Promise<any>) =>
        perfMonitor.measureAsync('subscription-fetch', fn),

    middlewareAuth: (fn: () => Promise<any>) => perfMonitor.measureAsync('middleware-auth', fn),
};
