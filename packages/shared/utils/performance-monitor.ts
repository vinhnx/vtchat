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
        if (process.env.NODE_ENV === 'development') {
            log.info({ operation }, 'Performance timer started');
        }
    }

    endTimer(operation: string): number {
        const startTime = this.timers.get(operation);
        if (!startTime) {
            if (process.env.NODE_ENV === 'development') {
                log.warn({ operation }, 'Performance timer not found for operation');
            }
            return 0;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(operation);

        if (process.env.NODE_ENV === 'development') {
            log.info({ operation, duration: duration.toFixed(2) }, 'Performance timer completed');
        }

        // Log slow operations
        if (duration > 2000 && process.env.NODE_ENV === 'development') {
            log.warn({ operation, duration: duration.toFixed(2) }, 'Slow operation detected');
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
            if (process.env.NODE_ENV === 'development') {
                log.error(
                    {
                        operation,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                    'Performance timer failed'
                );
            }
            throw error;
        }
    }
}

export const perfMonitor = PerformanceMonitor.getInstance();

import { log } from '@repo/shared/logger';

// Auth-specific performance monitoring
export const monitorAuth = {
    sessionCheck: (fn: () => Promise<any>) => perfMonitor.measureAsync('auth-session-check', fn),

    subscriptionFetch: (fn: () => Promise<any>) =>
        perfMonitor.measureAsync('subscription-fetch', fn),

    middlewareAuth: (fn: () => Promise<any>) => perfMonitor.measureAsync('middleware-auth', fn),
};
