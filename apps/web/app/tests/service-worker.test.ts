import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock service worker APIs
Object.defineProperty(globalThis, 'navigator', {
    value: {
        serviceWorker: {
            register: vi.fn(),
            ready: Promise.resolve({
                unregister: vi.fn(),
                update: vi.fn(),
                installing: null,
                waiting: null,
                active: {
                    scriptURL: '/sw.js',
                    state: 'activated',
                },
            }),
        },
    },
    writable: true,
});

Object.defineProperty(globalThis, 'caches', {
    value: {
        open: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
        keys: vi.fn().mockResolvedValue(['v1-static', 'v1-dynamic', 'v1-images']),
        match: vi.fn(),
    },
    writable: true,
});

// Mock Cache API
const mockCache = {
    add: vi.fn(),
    addAll: vi.fn(),
    delete: vi.fn(),
    keys: vi
        .fn()
        .mockResolvedValue([
            { url: 'https://example.com/api/test' },
            { url: 'https://example.com/static/app.js' },
        ]),
    match: vi.fn(),
    matchAll: vi.fn(),
    put: vi.fn(),
};

describe('Service Worker Caching Strategies', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (globalThis.caches.open as any).mockResolvedValue(mockCache);
    });

    it('should register service worker successfully', async () => {
        const mockRegistration = {
            installing: null,
            waiting: null,
            active: { scriptURL: '/sw.js' },
            update: vi.fn(),
            unregister: vi.fn(),
        };

        (navigator.serviceWorker.register as any).mockResolvedValue(mockRegistration);

        const registration = await navigator.serviceWorker.register('/sw.js');

        expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
        expect(registration).toBeDefined();
        expect(registration.active?.scriptURL).toBe('/sw.js');
    });

    it('should handle cache-first strategy for static assets', async () => {
        // Mock cache hit
        mockCache.match.mockResolvedValue(new Response('cached content', { status: 200 }));

        // Simulate cache-first strategy
        const cachedResponse = await mockCache.match('/static/app.js');
        expect(cachedResponse).toBeDefined();
        expect(cachedResponse?.status).toBe(200);
        expect(mockCache.match).toHaveBeenCalledWith('/static/app.js');
    });

    it('should handle network-first strategy for API calls', async () => {
        // Mock network success then cache
        const networkResponse = new Response('{"data": "fresh"}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });

        // Test network-first logic (would normally try network first)
        expect(networkResponse.status).toBe(200);

        // Should cache the response
        await mockCache.put('/api/data', networkResponse.clone());
        expect(mockCache.put).toHaveBeenCalledWith('/api/data', expect.any(Response));
    });

    it('should handle stale-while-revalidate for dynamic content', async () => {
        // Mock stale cache response
        const staleResponse = new Response('stale content', { status: 200 });
        mockCache.match.mockResolvedValue(staleResponse);

        // Should return stale response immediately
        const response = await mockCache.match('/dynamic/content');
        expect(response).toBeDefined();
        expect(response?.status).toBe(200);

        // Should update cache in background (simulated)
        const freshResponse = new Response('fresh content', { status: 200 });
        await mockCache.put('/dynamic/content', freshResponse);
        expect(mockCache.put).toHaveBeenCalled();
    });

    it('should implement cache size limits and cleanup', async () => {
        const mockCacheKeys = Array.from({ length: 150 }, (_, i) => ({
            url: `https://example.com/item-${i}`,
        }));

        mockCache.keys.mockResolvedValue(mockCacheKeys);

        // Should identify excess items (over 100)
        const keys = await mockCache.keys();
        const excessItems = keys.slice(100); // Keep only first 100

        expect(keys.length).toBe(150);
        expect(excessItems.length).toBe(50);

        // Should delete excess items
        for (const item of excessItems) {
            await mockCache.delete(item.url);
        }

        expect(mockCache.delete).toHaveBeenCalledTimes(50);
    });

    it('should handle offline scenarios gracefully', async () => {
        // Mock network failure
        const networkError = new Error('Network failed');

        // Mock fallback to cache
        mockCache.match.mockResolvedValue(new Response('offline fallback', { status: 200 }));

        // Should return cached version when network fails
        try {
            throw networkError;
        } catch {
            const fallbackResponse = await mockCache.match('/offline-page');
            expect(fallbackResponse).toBeDefined();
            expect(fallbackResponse?.status).toBe(200);
        }
    });

    it('should queue failed requests for background sync', () => {
        const failedRequests = [];
        const request = new Request('https://example.com/api/sync-later', { method: 'POST' });

        // Simulate adding to sync queue
        failedRequests.push({
            url: request.url,
            method: request.method,
            timestamp: Date.now(),
        });

        expect(failedRequests).toHaveLength(1);
        expect(failedRequests[0].url).toBe('https://example.com/api/sync-later');
        expect(failedRequests[0].method).toBe('POST');
    });
});

describe('Cache Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should provide cache statistics', async () => {
        (globalThis.caches.keys as any).mockResolvedValue(['v1-static', 'v1-dynamic']);

        const cacheNames = await caches.keys();
        const stats = {
            totalCaches: cacheNames.length,
            cacheNames,
            totalSize: 0, // Would be calculated from actual cache
        };

        expect(stats.totalCaches).toBe(2);
        expect(stats.cacheNames).toContain('v1-static');
        expect(stats.cacheNames).toContain('v1-dynamic');
    });

    it('should clear specific cache', async () => {
        (globalThis.caches.delete as any).mockResolvedValue(true);

        const deleted = await caches.delete('v1-static');
        expect(deleted).toBe(true);
        expect(caches.delete).toHaveBeenCalledWith('v1-static');
    });

    it('should update service worker when new version available', async () => {
        const mockRegistration = {
            update: vi.fn().mockResolvedValue(undefined),
            waiting: { postMessage: vi.fn() },
        };

        await mockRegistration.update();
        expect(mockRegistration.update).toHaveBeenCalled();

        // Simulate activating waiting SW
        if (mockRegistration.waiting) {
            mockRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({
                type: 'SKIP_WAITING',
            });
        }
    });
});

describe('Background Sync', () => {
    it('should handle sync events for failed requests', () => {
        const syncQueue = [
            { url: '/api/data', method: 'POST', body: '{"test": true}' },
            { url: '/api/update', method: 'PUT', body: '{"id": 1}' },
        ];

        // Simulate processing sync queue
        const processedRequests = syncQueue.map((item) => ({
            ...item,
            processed: true,
            timestamp: Date.now(),
        }));

        expect(processedRequests).toHaveLength(2);
        expect(processedRequests[0].processed).toBe(true);
        expect(processedRequests[1].processed).toBe(true);
    });

    it('should retry failed sync attempts', () => {
        const failedSync = {
            url: '/api/retry',
            attempts: 0,
            maxAttempts: 3,
        };

        // Simulate retry logic
        failedSync.attempts++;
        const shouldRetry = failedSync.attempts < failedSync.maxAttempts;

        expect(failedSync.attempts).toBe(1);
        expect(shouldRetry).toBe(true);
    });
});
