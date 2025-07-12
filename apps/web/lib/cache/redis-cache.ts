/**
 * Redis-based caching system for fast authentication and subscription data
 */

import { log } from '@repo/shared/lib/logger';

// Dynamic import for ioredis to make it optional
let Redis: any;
try {
    Redis = require('ioredis').Redis;
} catch {
    // ioredis not available, cache will be disabled
}

interface CacheConfig {
    defaultTTL?: number;
    keyPrefix?: string;
}

interface SubscriptionCacheData {
    planSlug: string | null;
    subPlan: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    creemSubscriptionId: string | null;
    isActive: boolean;
    isPremium: boolean;
    isVtPlus: boolean;
    lastUpdated: number;
}

class RedisCache {
    private redis: any = null;
    private config: CacheConfig;
    private isConnected = false;

    constructor(config: CacheConfig = {}) {
        this.config = {
            defaultTTL: 30, // 30 seconds default
            keyPrefix: 'vtchat:',
            ...config,
        };

        this.initRedis();
    }

    private initRedis() {
        try {
            if (!Redis) {
                log.warn('ioredis not available, caching disabled');
                return;
            }

            const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

            if (!redisUrl) {
                log.warn('No Redis URL configured, caching disabled');
                return;
            }

            this.redis = new Redis(redisUrl, {
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                // Connection timeout
                connectTimeout: 5000,
                // Command timeout
                commandTimeout: 3000,
            });

            this.redis.on('connect', () => {
                this.isConnected = true;
                log.info('Redis cache connected');
            });

            this.redis.on('error', (error) => {
                this.isConnected = false;
                log.error('Redis cache error:', error);
            });

            this.redis.on('close', () => {
                this.isConnected = false;
                log.warn('Redis cache disconnected');
            });
        } catch (error) {
            log.error('Failed to initialize Redis cache:', error);
        }
    }

    private getKey(key: string): string {
        return `${this.config.keyPrefix}${key}`;
    }

    async get<T = any>(key: string): Promise<T | null> {
        if (!this.redis || !this.isConnected) {
            return null;
        }

        try {
            const value = await this.redis.get(this.getKey(key));
            return value ? JSON.parse(value) : null;
        } catch (error) {
            log.warn('Redis get failed:', { key, error });
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
        if (!this.redis || !this.isConnected) {
            return false;
        }

        try {
            const ttl = ttlSeconds || this.config.defaultTTL!;
            const serialized = JSON.stringify(value);

            if (ttl > 0) {
                await this.redis.setex(this.getKey(key), ttl, serialized);
            } else {
                await this.redis.set(this.getKey(key), serialized);
            }

            return true;
        } catch (error) {
            log.warn('Redis set failed:', { key, error });
            return false;
        }
    }

    async del(key: string): Promise<boolean> {
        if (!this.redis || !this.isConnected) {
            return false;
        }

        try {
            await this.redis.del(this.getKey(key));
            return true;
        } catch (error) {
            log.warn('Redis delete failed:', { key, error });
            return false;
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.redis || !this.isConnected) {
            return false;
        }

        try {
            const result = await this.redis.exists(this.getKey(key));
            return result === 1;
        } catch (error) {
            log.warn('Redis exists check failed:', { key, error });
            return false;
        }
    }

    async increment(key: string, ttlSeconds?: number): Promise<number> {
        if (!this.redis || !this.isConnected) {
            return 0;
        }

        try {
            const fullKey = this.getKey(key);
            const pipeline = this.redis.pipeline();
            pipeline.incr(fullKey);

            if (ttlSeconds) {
                pipeline.expire(fullKey, ttlSeconds);
            }

            const results = await pipeline.exec();
            return (results?.[0]?.[1] as number) || 0;
        } catch (error) {
            log.warn('Redis increment failed:', { key, error });
            return 0;
        }
    }

    async setJson<T = any>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
        return this.set(key, value, ttlSeconds);
    }

    async getJson<T = any>(key: string): Promise<T | null> {
        return this.get<T>(key);
    }

    // Subscription-specific cache methods
    async getSubscription(userId: string): Promise<SubscriptionCacheData | null> {
        const key = `sub:${userId}`;
        const cached = await this.getJson<SubscriptionCacheData>(key);

        if (cached && Date.now() - cached.lastUpdated < 30000) {
            // 30 second freshness
            return cached;
        }

        return null;
    }

    async setSubscription(
        userId: string,
        data: Omit<SubscriptionCacheData, 'lastUpdated'>,
        ttlSeconds = 30
    ): Promise<boolean> {
        const key = `sub:${userId}`;
        const cacheData: SubscriptionCacheData = {
            ...data,
            lastUpdated: Date.now(),
        };

        // Calculate dynamic TTL based on subscription period end
        let dynamicTTL = ttlSeconds;
        if (data.currentPeriodEnd) {
            const periodEndTime = new Date(data.currentPeriodEnd).getTime();
            const timeUntilEnd = Math.floor((periodEndTime - Date.now()) / 1000);
            dynamicTTL = Math.min(ttlSeconds, Math.max(5, timeUntilEnd - 30)); // 30s buffer before expiry
        }

        return this.setJson(key, cacheData, dynamicTTL);
    }

    async invalidateSubscription(userId: string): Promise<boolean> {
        return this.del(`sub:${userId}`);
    }

    // Rate limiting cache methods
    async getRateLimit(userId: string, key: string): Promise<number> {
        const cacheKey = `rate:${userId}:${key}`;
        const value = await this.get<number>(cacheKey);
        return value || 0;
    }

    async incrementRateLimit(userId: string, key: string, ttlSeconds: number): Promise<number> {
        const cacheKey = `rate:${userId}:${key}`;
        return this.increment(cacheKey, ttlSeconds);
    }

    // Fire-and-forget operations for performance
    incrementRateLimitAsync(userId: string, key: string, ttlSeconds: number): void {
        if (!this.redis || !this.isConnected) return;

        const cacheKey = `rate:${userId}:${key}`;
        const fullKey = this.getKey(cacheKey);

        // Use pipeline for atomic operations
        this.redis
            .pipeline()
            .incr(fullKey)
            .expire(fullKey, ttlSeconds)
            .exec()
            .catch((error) => {
                log.warn('Async rate limit increment failed:', { userId, key, error });
            });
    }

    // Multi-key operations for batch processing
    async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
        if (!this.redis || !this.isConnected || keys.length === 0) {
            return keys.map(() => null);
        }

        try {
            const fullKeys = keys.map((key) => this.getKey(key));
            const values = await this.redis.mget(...fullKeys);

            return values.map((value) => {
                try {
                    return value ? JSON.parse(value) : null;
                } catch {
                    return null;
                }
            });
        } catch (error) {
            log.warn('Redis mget failed:', { keys, error });
            return keys.map(() => null);
        }
    }

    async mset(keyValuePairs: Array<[string, any]>, ttlSeconds?: number): Promise<boolean> {
        if (!this.redis || !this.isConnected || keyValuePairs.length === 0) {
            return false;
        }

        try {
            const pipeline = this.redis.pipeline();

            for (const [key, value] of keyValuePairs) {
                const fullKey = this.getKey(key);
                const serialized = JSON.stringify(value);

                if (ttlSeconds) {
                    pipeline.setex(fullKey, ttlSeconds, serialized);
                } else {
                    pipeline.set(fullKey, serialized);
                }
            }

            await pipeline.exec();
            return true;
        } catch (error) {
            log.warn('Redis mset failed:', { count: keyValuePairs.length, error });
            return false;
        }
    }

    // Health check
    async ping(): Promise<boolean> {
        if (!this.redis || !this.isConnected) {
            return false;
        }

        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }

    // Cleanup
    async disconnect(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
            this.redis = null;
            this.isConnected = false;
        }
    }
}

// Global cache instance
export const redisCache = new RedisCache();

// Graceful shutdown
if (typeof process !== 'undefined') {
    process.on('SIGTERM', async () => {
        await redisCache.disconnect();
    });

    process.on('SIGINT', async () => {
        await redisCache.disconnect();
    });
}

export type { SubscriptionCacheData };
