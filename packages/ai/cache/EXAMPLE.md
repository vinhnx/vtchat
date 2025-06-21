# Gemini Caching Usage Example

This example demonstrates how the TTL configuration works with user preferences.

## User Configures TTL in Settings

When a VT+ user adjusts the cache duration in settings:

```typescript
// User sets cache duration to 10 minutes via the UI slider
const userTTLMinutes = 10;
const userTTLSeconds = userTTLMinutes * 60; // 600 seconds

// This gets stored in the chat store
setGeminiCaching({
    enabled: true,
    ttlSeconds: userTTLSeconds, // 600 seconds
    maxCaches: 15,
});
```

## Cache Creation Uses User's TTL

When creating a cache, the user's configured TTL is used:

```typescript
import { GeminiCacheManager } from '@repo/ai/cache';
import { useChatStore } from '@repo/common/store';

// Get user's TTL preference from store
const geminiCaching = useChatStore.getState().geminiCaching;
const userTTL = geminiCaching.ttlSeconds; // 600 seconds (10 minutes)

// Create cache with user's preferred TTL
const cacheManager = GeminiCacheManager.getInstance(apiKey);
const cacheConfig = {
    model: 'models/gemini-2.5-pro',
    contents: [
        {
            role: 'user',
            parts: [{ text: 'Long conversation context that should be cached...' }],
        },
    ],
    ttlSeconds: userTTL, // Uses user's configured 600 seconds
};

const cachedContentName = await cacheManager.createCache(cacheConfig);
```

## Default Values

- **Default TTL**: 300 seconds (5 minutes)
- **Minimum TTL**: 60 seconds (1 minute)
- **Maximum TTL**: 3600 seconds (60 minutes)
- **Default Max Caches**: 10 conversations

## UI Configuration

The slider in VT+ settings converts minutes to seconds:

```typescript
// UI shows: "Cache Duration: 10 minutes"
// Stored value: 600 seconds
// Formula: minutes * 60 = seconds

<Slider
    value={[geminiCaching.ttlSeconds]}
    onValueChange={([value]) =>
        setGeminiCaching({
            enabled: geminiCaching.enabled,
            ttlSeconds: value, // Direct seconds value
        })
    }
    min={60}    // 1 minute
    max={3600}  // 60 minutes
    step={60}   // 1 minute increments
/>

// Display conversion
const displayMinutes = Math.round(geminiCaching.ttlSeconds / 60);
// "Cache Duration: {displayMinutes} minutes"
```

This ensures that user preferences are properly stored and used throughout the caching system.
