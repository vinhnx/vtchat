/**
 * Request deduplication utility to prevent multiple identical API calls
 */

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
            console.log(`[RequestDeduplication] Using existing request for: ${key}`);
            return existing.promise;
        }

        console.log(`[RequestDeduplication] Creating new request for: ${key}`);
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
                console.log(`[RequestDeduplication] Cleaning up expired request: ${key}`);
                this.pendingRequests.delete(key);
            }
        }
    }

    clear(): void {
        this.pendingRequests.clear();
    }
}

export const requestDeduplicator = new RequestDeduplicator();
