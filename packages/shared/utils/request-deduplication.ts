/**
 * Request deduplication utility to prevent multiple identical API calls
 */

import { log } from '@repo/shared/logger';

interface PendingRequest<T> {
    promise: Promise<T>;
    timestamp: number;
}

class RequestDeduplicator {
    private pendingRequests = new Map<string, PendingRequest<any>>();
    private readonly timeout = 10000; // 10 seconds

    async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
        // Clean up expired requests
        this.cleanup();

        const existing = this.pendingRequests.get(key);
        if (existing) {
            log.debug({ key }, 'Using existing request');
            return existing.promise;
        }

        log.debug({ key }, 'Creating new request');
        const promise = requestFn().finally(() => {
            // Remove from pending requests when completed
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, {
            promise,
            timestamp: Date.now(),
        });

        return promise;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, request] of this.pendingRequests.entries()) {
            if (now - request.timestamp > this.timeout) {
                log.debug({ key }, 'Cleaning up expired request');
                this.pendingRequests.delete(key);
            }
        }
    }

    clear(): void {
        this.pendingRequests.clear();
    }
}

export const requestDeduplicator = new RequestDeduplicator();

