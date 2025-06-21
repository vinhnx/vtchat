/**
 * Gemini Explicit Caching Implementation
 * 
 * Provides cost-effective caching for Gemini 2.5 and 2.0 models using GoogleAICacheManager.
 * This feature is exclusive to VT+ subscribers.
 */

import { GoogleAICacheManager } from '@google/generative-ai/server';
import { ModelEnum } from '../models';

/**
 * Supported Gemini models for explicit caching
 */
export type GoogleModelCacheableId =
    | 'models/gemini-2.5-pro'
    | 'models/gemini-2.5-flash' 
    | 'models/gemini-2.0-flash'
    | 'models/gemini-1.5-flash-001'
    | 'models/gemini-1.5-pro-001';

/**
 * Cache configuration interface
 */
export interface GeminiCacheConfig {
    /** Cache content (conversation context) */
    contents: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
    }>;
    /** Time-to-live in seconds */
    ttlSeconds: number;
    /** Model to use for caching */
    model: GoogleModelCacheableId;
}

/**
 * Cache manager wrapper for Gemini explicit caching
 */
export class GeminiCacheManager {
    private cacheManager: GoogleAICacheManager;
    private static instance: GeminiCacheManager;

    private constructor(apiKey: string) {
        this.cacheManager = new GoogleAICacheManager(apiKey);
    }

    /**
     * Get singleton instance of cache manager
     */
    public static getInstance(apiKey: string): GeminiCacheManager {
        if (!GeminiCacheManager.instance) {
            GeminiCacheManager.instance = new GeminiCacheManager(apiKey);
        }
        return GeminiCacheManager.instance;
    }

    /**
     * Create a new cache entry
     */
    public async createCache(config: GeminiCacheConfig): Promise<string> {
        try {
            const { name: cachedContent } = await this.cacheManager.create({
                model: config.model,
                contents: config.contents,
                ttlSeconds: config.ttlSeconds,
            });
            return cachedContent;
        } catch (error) {
            console.error('Failed to create Gemini cache:', error);
            throw new Error('Gemini cache creation failed');
        }
    }

    /**
     * List all cached contents
     */
    public async listCaches() {
        try {
            return await this.cacheManager.list();
        } catch (error) {
            console.error('Failed to list Gemini caches:', error);
            throw new Error('Failed to retrieve cache list');
        }
    }

    /**
     * Delete a cached content by name
     */
    public async deleteCache(cacheName: string): Promise<void> {
        try {
            await this.cacheManager.delete(cacheName);
        } catch (error) {
            console.error('Failed to delete Gemini cache:', error);
            throw new Error('Failed to delete cache');
        }
    }

    /**
     * Get a cached content by name
     */
    public async getCache(cacheName: string) {
        try {
            return await this.cacheManager.get(cacheName);
        } catch (error) {
            console.error('Failed to get Gemini cache:', error);
            throw new Error('Failed to retrieve cache');
        }
    }
}

/**
 * Check if a model supports explicit caching
 */
export function isModelCacheable(modelId: string): modelId is GoogleModelCacheableId {
    const cacheableModels: GoogleModelCacheableId[] = [
        'models/gemini-2.5-pro',
        'models/gemini-2.5-flash',
        'models/gemini-2.0-flash',
        'models/gemini-1.5-flash-001',
        'models/gemini-1.5-pro-001',
    ];
    return cacheableModels.includes(modelId as GoogleModelCacheableId);
}

/**
 * Convert VTChat model enum to cacheable model ID
 */
export function getGeminiCacheableModelId(modelEnum: ModelEnum): GoogleModelCacheableId | null {
    switch (modelEnum) {
        case 'gemini-2.5-pro':
            return 'models/gemini-2.5-pro';
        case 'gemini-2.5-flash':
            return 'models/gemini-2.5-flash';
        case 'gemini-2.0-flash':
            return 'models/gemini-2.0-flash';
        case 'gemini-1.5-flash-001':
            return 'models/gemini-1.5-flash-001';
        case 'gemini-1.5-pro-001':
            return 'models/gemini-1.5-pro-001';
        default:
            return null;
    }
}

/**
 * Default cache settings for VT+ users
 */
export const DEFAULT_CACHE_SETTINGS = {
    /** Default TTL: 5 minutes */
    DEFAULT_TTL_SECONDS: 300,
    /** Maximum TTL: 1 hour */
    MAX_TTL_SECONDS: 3600,
    /** Minimum TTL: 1 minute */
    MIN_TTL_SECONDS: 60,
    /** Maximum number of cached conversations per user */
    MAX_CACHED_CONVERSATIONS: 10,
} as const;

/**
 * Cache usage statistics interface
 */
export interface CacheUsageStats {
    totalCaches: number;
    activeCaches: number;
    totalSizeBytes: number;
    lastUsed: Date | null;
}
