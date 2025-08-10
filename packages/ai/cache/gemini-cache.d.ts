/**
 * Gemini Explicit Caching Implementation
 *
 * Provides cost-effective caching for Gemini 2.5 and 2.0 models using GoogleAICacheManager.
 * This feature is exclusive to VT+ subscribers.
 */
import type { ModelEnum } from "../models";
/**
 * Supported Gemini models for explicit caching
 */
export type GoogleModelCacheableId = "models/gemini-2.5-pro" | "models/gemini-2.5-flash" | "models/gemini-1.5-flash-001" | "models/gemini-1.5-pro-001";
/**
 * Cache configuration interface
 */
export interface GeminiCacheConfig {
    /** Cache content (conversation context) */
    contents: Array<{
        role: "user" | "model";
        parts: Array<{
            text: string;
        }>;
    }>;
    /** Time-to-live in seconds */
    ttlSeconds: number;
    /** Model to use for caching */
    model: GoogleModelCacheableId;
}
/**
 * Cache manager wrapper for Gemini explicit caching
 */
export declare class GeminiCacheManager {
    private cacheManager;
    private static instance;
    private constructor();
    /**
     * Get singleton instance of cache manager
     */
    static getInstance(apiKey: string): GeminiCacheManager;
    /**
     * Create a new cache entry
     */
    createCache(config: GeminiCacheConfig): Promise<string>;
    /**
     * List all cached contents
     */
    listCaches(): Promise<import("@google/generative-ai/server").ListCacheResponse>;
    /**
     * Delete a cached content by name
     */
    deleteCache(cacheName: string): Promise<void>;
    /**
     * Get a cached content by name
     */
    getCache(cacheName: string): Promise<import("@google/generative-ai/server").CachedContent>;
}
/**
 * Check if a model supports explicit caching
 */
export declare function isModelCacheable(modelId: string): modelId is GoogleModelCacheableId;
/**
 * Convert VTChat model enum to cacheable model ID
 */
export declare function getGeminiCacheableModelId(modelEnum: ModelEnum): GoogleModelCacheableId | null;
/**
 * Default cache settings for VT+ users
 */
export declare const DEFAULT_CACHE_SETTINGS: {
    /** Default TTL: 5 minutes */
    readonly DEFAULT_TTL_SECONDS: 300;
    /** Maximum TTL: 1 hour */
    readonly MAX_TTL_SECONDS: 3600;
    /** Minimum TTL: 1 minute */
    readonly MIN_TTL_SECONDS: 60;
    /** Maximum number of cached conversations per user */
    readonly MAX_CACHED_CONVERSATIONS: 10;
};
/**
 * Cache usage statistics interface
 */
export interface CacheUsageStats {
    totalCaches: number;
    activeCaches: number;
    totalSizeBytes: number;
    lastUsed: Date | null;
}
//# sourceMappingURL=gemini-cache.d.ts.map