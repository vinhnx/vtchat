/**
 * Registry for tracking active SSE streams to prevent memory leaks
 */

interface StreamInfo {
    abortController: AbortController;
    requestId: string;
    startTime: number;
    userId?: string;
    threadId?: string;
}

export const streamRegistry = new Map<string, StreamInfo>();

/**
 * Register a new stream
 */
export function registerStream(
    requestId: string,
    abortController: AbortController,
    metadata: {
        userId?: string;
        threadId?: string;
    } = {}
): void {
    streamRegistry.set(requestId, {
        abortController,
        requestId,
        startTime: Date.now(),
        ...metadata,
    });
}

/**
 * Unregister a stream and clean up resources
 */
export function unregisterStream(requestId: string): void {
    const streamInfo = streamRegistry.get(requestId);
    if (streamInfo) {
        streamRegistry.delete(requestId);
    }
}

/**
 * Get stream info by request ID
 */
export function getStreamInfo(requestId: string): StreamInfo | undefined {
    return streamRegistry.get(requestId);
}

/**
 * Abort a specific stream by request ID
 */
export function abortStream(requestId: string): boolean {
    const streamInfo = streamRegistry.get(requestId);
    if (streamInfo) {
        streamInfo.abortController.abort();
        unregisterStream(requestId);
        return true;
    }
    return false;
}

/**
 * Get all active streams
 */
export function getActiveStreams(): StreamInfo[] {
    return Array.from(streamRegistry.values());
}

/**
 * Clean up old streams (older than 5 minutes)
 */
export function cleanupOldStreams(): number {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    let cleanedCount = 0;

    for (const [requestId, streamInfo] of streamRegistry.entries()) {
        if (now - streamInfo.startTime > maxAge) {
            streamInfo.abortController.abort();
            streamRegistry.delete(requestId);
            cleanedCount++;
        }
    }

    return cleanedCount;
}

/**
 * Emergency cleanup - abort all streams
 */
export function abortAllStreams(): number {
    const count = streamRegistry.size;
    for (const streamInfo of streamRegistry.values()) {
        streamInfo.abortController.abort();
    }
    streamRegistry.clear();
    return count;
}
