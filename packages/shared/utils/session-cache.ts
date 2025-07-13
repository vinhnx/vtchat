/**
 * Simple in-memory cache for session data to reduce auth checks
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class SessionCache {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly defaultTTL = 60_000; // 1 minute

    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Clean up expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

export const sessionCache = new SessionCache();

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
    setInterval(
        () => {
            sessionCache.cleanup();
        },
        5 * 60 * 1000,
    );
}
