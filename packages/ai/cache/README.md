# Gemini Explicit Caching

This module provides cost-effective caching for Gemini 2.5 and 2.0 models using Google's explicit caching feature. This feature is available to all logged-in users.

## Features

- **Cost Reduction**: Reuse conversation context across multiple queries to reduce API costs
- **Supported Models**: Gemini 2.5 Pro, Gemini 2.5 Flash and Gemini 2.5 Flash Lite Preview.
- **Configurable TTL**: Set cache duration from 1 minute to 1 hour
- **Cache Management**: Manage up to 20 cached conversations simultaneously
- **Authentication Integration**: Seamlessly integrated with VTChat's authentication system

## Usage

### Basic Setup

```typescript
import { GeminiCacheManager, DEFAULT_CACHE_SETTINGS } from '@repo/ai/cache';

// Initialize cache manager
const cacheManager = GeminiCacheManager.getInstance(apiKey);

// Create a cache for conversation context
const cacheConfig = {
    model: 'models/gemini-2.5-pro',
    contents: [
        {
            role: 'user',
            parts: [{ text: 'Long conversation context...' }],
        },
    ],
    ttlSeconds: DEFAULT_CACHE_SETTINGS.DEFAULT_TTL_SECONDS, // 5 minutes
};

const cachedContentName = await cacheManager.createCache(cacheConfig);
```

### Using Cached Content

```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { generateText } from 'ai';

// Use the cached content in subsequent queries
const model = getLanguageModel(
    'gemini-2.5-pro',
    undefined, // middleware
    undefined, // byokKeys
    false, // useSearchGrounding
    cachedContentName // cachedContent
);

const { text } = await generateText({
    model,
    prompt: 'New query that builds on cached context...',
});
```

### Authentication Integration

```typescript
import { useGeminiCaching } from '@repo/common/hooks';

function MyComponent() {
    const {
        hasAccess,
        isEnabled,
        settings,
        updateSettings,
        enable,
        disable,
        setTTL,
        setMaxCaches,
    } = useGeminiCaching();

    if (!hasAccess) {
        return <div>Please log in to access Gemini caching</div>;
    }

    return (
        <div>
            <button onClick={enable}>Enable Caching</button>
            <button onClick={() => setTTL(1800)}>Set 30min TTL</button>
        </div>
    );
}
```

## Configuration

### Default Settings

```typescript
export const DEFAULT_CACHE_SETTINGS = {
    DEFAULT_TTL_SECONDS: 300, // 5 minutes
    MAX_TTL_SECONDS: 3600, // 1 hour
    MIN_TTL_SECONDS: 60, // 1 minute
    MAX_CACHED_CONVERSATIONS: 10, // 10 conversations
};
```

### Supported Models

- `models/gemini-2.5-pro`
- `models/gemini-2.5-flash`
- `models/gemini-2.5-flash-lite`

## Cache Management

```typescript
// List all caches
const caches = await cacheManager.listCaches();

// Get specific cache
const cache = await cacheManager.getCache(cacheName);

// Delete cache
await cacheManager.deleteCache(cacheName);
```

## Error Handling

The cache manager includes comprehensive error handling:

```typescript
try {
    const cachedContent = await cacheManager.createCache(config);
} catch (error) {
    console.error('Cache creation failed:', error);
    // Fallback to non-cached request
}
```

## Best Practices

1. **Cache Long Contexts**: Use caching for conversations with substantial context that will be referenced multiple times
2. **Set Appropriate TTL**: Balance between cost savings and freshness requirements
3. **Monitor Cache Usage**: Keep track of active caches to stay within limits
4. **Cleanup Old Caches**: Remove unused caches to free up space for new ones
5. **Authentication Check**: Always check user access before enabling caching features

## Implementation Notes

- Caching is available for all logged-in users
- Cache settings are persisted in localStorage
- The cache manager uses a singleton pattern for efficient resource usage
- All caching operations are asynchronous and include proper error handling
