import type { LanguageModelV2Middleware } from '@ai-sdk/provider';
import { log } from '@repo/shared/logger';

/**
 * Simple caching middleware that caches generated text based on parameters.
 * Useful for reducing API costs and improving response times for repeated queries.
 */
export const cachingMiddleware: LanguageModelV2Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    // Create a cache key from the parameters
    const cacheKey = JSON.stringify({
      ...params,
      // Exclude non-deterministic fields that might affect caching
      timestamp: undefined,
      requestId: undefined,
    });

    // Try to get from cache first (in-memory cache for this example)
    // In a production environment, you might use Redis or another distributed cache
    if (!globalThis.middlewareCache) {
      globalThis.middlewareCache = new Map<string, any>();
    }

    const cache = globalThis.middlewareCache;
    
    if (cache.has(cacheKey)) {
      log.info('Cache HIT for language model request', {
        cacheKey: cacheKey.substring(0, 50) + '...',
      });
      return cache.get(cacheKey);
    }

    log.info('Cache MISS for language model request', {
      cacheKey: cacheKey.substring(0, 50) + '...',
    });

    // Generate the result if not in cache
    const result = await doGenerate();

    // Store in cache
    cache.set(cacheKey, result);
    log.info('Stored result in cache', {
      cacheKey: cacheKey.substring(0, 50) + '...',
    });

    return result;
  },

  // Note: Streaming caching is more complex and would require buffering the entire stream
  // For now, we'll just pass through the stream without caching
  wrapStream: async ({ doStream, params }) => {
    log.info('Streaming request bypassing cache (not implemented)', {
      params: JSON.stringify(params, null, 2),
    });
    
    return doStream();
  },
};

// Extend globalThis to add our cache
declare global {
  var middlewareCache: Map<string, any> | undefined;
}