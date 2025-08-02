/**
 * Request deduplication utility to prevent multiple identical API calls
 */

import { log } from "@repo/shared/logger";

interface PendingRequest<T> {
    promise: Promise<T>;
    timestamp: number;
}

// Use a functional approach to avoid SWC class compilation issues
const pendingRequests = new Map<string, PendingRequest<any>>();
const REQUEST_TIMEOUT = 10_000; // 10 seconds

function cleanup(): void {
    const now = Date.now();
    for (const [key, request] of pendingRequests.entries()) {
        if (now - request.timestamp > REQUEST_TIMEOUT) {
            log.debug({ key }, "Cleaning up expired request");
            pendingRequests.delete(key);
        }
    }
}

async function deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Clean up expired requests
    cleanup();

    const existing = pendingRequests.get(key);
    if (existing) {
        log.debug({ key }, "Using existing request");
        return existing.promise;
    }

    log.debug({ key }, "Creating new request");
    const promise = requestFn().finally(() => {
        // Remove from pending requests when completed
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, {
        promise,
        timestamp: Date.now(),
    });

    return promise;
}

function clear(): void {
    pendingRequests.clear();
}

export const requestDeduplicator = {
    deduplicate,
    clear,
};
