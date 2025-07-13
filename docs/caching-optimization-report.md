# Caching Optimization Report

## Overview

This document outlines the improvements made to the service worker (sw.js) and Next.js configuration for optimal (non-aggressive) caching strategy. The goal was to balance performance with content freshness and avoid cache-related issues.

## Service Worker Improvements (sw.js)

### 1. Multi-Layer Caching Strategy

Implemented separate cache layers for different content types:

- **Static Cache**: Long-term storage for app shell assets (icons, manifest)
- **Dynamic Cache**: Medium-term storage for HTML pages and API responses
- **Image Cache**: Optimized storage for images with size limits

### 2. Intelligent Cache Strategies

Different caching strategies based on content type:

#### Cache-First Strategy

- **Usage**: Static assets, images
- **TTL**: 1 year for static assets, 1 week for images
- **Benefit**: Fastest loading for unchanging content

#### Network-First Strategy

- **Usage**: HTML pages, dynamic content
- **TTL**: 5 minutes for HTML, 1 minute for general content
- **Benefit**: Always fresh content with offline fallback

#### Stale-While-Revalidate Strategy

- **Usage**: CSS/JS files, fonts
- **TTL**: 1 day
- **Benefit**: Instant loading with background updates

#### Network-Only Strategy

- **Usage**: API endpoints
- **Benefit**: No caching for sensitive/dynamic data

### 3. Cache Management Features

- **Size Limits**: 50 dynamic pages, 100 images maximum
- **LRU Cleanup**: Automatic removal of old entries when limits exceeded
- **Version-Based Invalidation**: Old cache versions automatically deleted
- **Metadata Tracking**: Cache timestamps for freshness validation

### 4. Enhanced Error Handling

- Silent failures to prevent blocking
- Graceful degradation for offline scenarios
- Improved offline page with better UX

## Next.js Configuration Improvements

### 1. Optimized HTTP Headers

#### Static Assets

- **Hashed Assets**: 1 year cache with `immutable` flag
- **Dynamic Assets**: 1 day cache with `stale-while-revalidate=1year`
- **Fonts**: 1 year cache for web fonts

#### Dynamic Content

- **HTML Pages**: 5 minutes cache with stale-while-revalidate
- **API Routes**: No cache with explicit headers
- **Service Worker**: Never cached to ensure updates

### 2. Image Optimization

- Reduced cache TTL from 31 days to 1 day for better invalidation
- Added security headers for SVG content
- Optimized formats: WebP and AVIF support

### 3. Bundle Splitting Optimization

#### Framework Separation

- **Framework**: React core (high priority, enforce)
- **Next.js**: Next.js specific code
- **Forms**: React Hook Form + Zod (critical path)

#### Lazy Loading

- **AI Libraries**: Async loading (150KB max chunks)
- **Charts**: Async loading for better initial performance

#### Size Constraints

- Reduced maximum chunk sizes for better loading:
    - UI libs: 100KB (was 200KB)
    - Utils: 100KB (was 150KB)
    - Vendors: 100KB (was 150KB)
    - Common: 150KB (was 200KB)

### 4. Development Optimizations

- Memory cache with generation limits
- Reduced split chunks complexity in dev mode
- Faster rebuild optimizations

### 5. Performance Features

- **SWC Minification**: Enabled for faster builds
- **Compression**: Enabled for smaller bundles
- **Tree Shaking**: Enhanced dead code elimination
- **On-Demand Entries**: Optimized for memory usage

## Performance Benefits

### Loading Performance

- **Initial Page Load**: Faster due to smaller, focused chunks
- **Subsequent Pages**: Instant loading with smart caching
- **Offline Experience**: Graceful degradation with cached content

### Development Experience

- **Build Speed**: Faster compilation with optimized webpack config
- **Memory Usage**: Controlled with cache generation limits
- **Hot Reload**: Improved with optimized chunk splitting

### Production Efficiency

- **Bandwidth**: Reduced with optimal cache headers and compression
- **CDN Efficiency**: Better cache hit rates with appropriate TTLs
- **User Experience**: Faster loading with stale-while-revalidate strategy

## Cache Validation Strategy

### Freshness Checks

- Timestamp-based validation for all cached content
- Automatic background updates for stale content
- Version-based cache invalidation on deployments

### Storage Management

- Automatic cleanup of oversized caches
- LRU eviction for optimal memory usage
- Cross-browser compatibility considerations

## Monitoring & Maintenance

### Recommended Monitoring

- Cache hit rates per content type
- Storage usage across different cache layers
- Performance metrics for different loading strategies

### Maintenance Tasks

- Regular cache size monitoring
- Performance testing with different network conditions
- Cache strategy adjustments based on usage patterns

## Implementation Notes

### Breaking Changes

- Service worker version bumped to 3.0.0 (forces cache refresh)
- New cache naming scheme requires one-time cache recreation
- Updated HTTP headers may affect CDN configurations

### Rollback Plan

- Previous sw.js version preserved in git history
- Next.js config changes are non-breaking
- Can revert individual optimizations if needed

## Conclusion

The implemented caching strategy provides optimal performance while maintaining content freshness. The multi-layered approach ensures different content types are cached appropriately, reducing bandwidth usage and improving user experience without the pitfalls of aggressive caching.

Key achievements:

- ✅ Balanced performance vs. freshness
- ✅ Reduced bundle sizes
- ✅ Improved offline experience
- ✅ Enhanced cache management
- ✅ Better development experience

## Latest Updates

### Remote Image & Avatar Support

#### Next.js Configuration Updates

- **Added Remote Patterns**: Extended `images.remotePatterns` to support:
    - Avatar services: Google, GitHub, Discord, Facebook, Twitter
    - CDN services: jsDelivr, unpkg, Unsplash, placeholder services
    - User-uploaded content: Cloudinary, Imgur
- **SVG Support**: Enabled `dangerouslyAllowSVG: true` for icon and avatar support
- **Cache Headers**: Added optimized headers for `/_next/image` endpoint

#### Service Worker Updates

- **Remote Image Caching**: Extended image detection to include remote hostnames
- **Improved Cache Strategy**: Remote images now use cache-first strategy with 1-week TTL
- **Avatar-Specific Domains**: Added hostname detection for major avatar providers

### Offline Experience Enhancement

#### Offline.html Integration

- **Static Asset Caching**: Added `/offline.html` to STATIC_ASSETS for immediate availability
- **Fallback Strategy**: Updated `createOfflineResponse()` to:
    1. First try cached `/offline.html`
    2. Attempt to fetch `/offline.html` if not cached
    3. Fall back to inline HTML if all else fails
- **Cache Headers**: Added specific headers for offline.html with 1-day cache

#### Service Worker Improvements

- **Better Error Handling**: Removed unused error parameters and improved catch blocks
- **Graceful Degradation**: Multiple fallback levels ensure offline functionality
- **Performance**: Offline page loads instantly from cache when available

### Technical Benefits

#### Image Loading Performance

- **Remote Avatar Caching**: User avatars cached for 1 week, reducing API calls
- **CDN Optimization**: Popular CDN resources cached locally
- **Next.js Image Optimization**: Remote images benefit from Next.js optimization pipeline

#### Offline Robustness

- **Branded Experience**: Users see consistent VT branding when offline
- **Better UX**: Custom offline page with retry functionality
- **PWA Compliance**: Improved offline experience for PWA requirements

### Configuration Summary

```javascript
// Remote domains now supported:
- lh3.googleusercontent.com (Google avatars)
- avatars.githubusercontent.com (GitHub avatars)
- cdn.discordapp.com (Discord avatars)
- graph.facebook.com (Facebook avatars)
- pbs.twimg.com (Twitter avatars)
- images.unsplash.com (Stock photos)
- *.cloudinary.com (User uploads)
- i.imgur.com (Image hosting)
```

These updates ensure that remote images and avatars load reliably while maintaining optimal caching strategies and providing a polished offline experience.

### AI Provider Image Support

#### Added Support for AI/LLM Generated Images

- **OpenAI DALL-E**: `oaidalleapiprodscus.blob.core.windows.net`, `cdn.openai.com`, `images.openai.com`
- **Google AI/Gemini**: `storage.googleapis.com`, `generativelanguage.googleapis.com`
- **Anthropic Claude**: `claude.ai`, `cdn.anthropic.com`, `images.anthropic.com`
- **Stability AI**: `api.stability.ai`, `cdn.stability.ai`
- **Groq**: `images.groq.com`, `api.groq.com`
- **Replicate**: `replicate.delivery`, `pbxt.replicate.delivery`, `cdn.replicate.com`
- **Hugging Face**: `huggingface.co`, `cdn-uploads.huggingface.co`
- **Cohere**: `images.cohere.ai`, `api.cohere.ai`
- **Perplexity**: `images.perplexity.ai`, `api.perplexity.ai`

#### Intelligent Caching Strategy for AI Images

- **AI-Generated Images**: 1-day cache (shorter due to dynamic nature)
- **Static Images/Avatars**: 1-week cache (longer for stable content)
- **Auto-Detection**: Service worker automatically detects AI provider domains

#### CORS Support for Image Proxying

- Added `/api/proxy/image/:path*` endpoint headers for cross-origin image requests
- Specific cache headers for AI-generated content: 1 day with 1-week stale-while-revalidate
- Wildcard CORS for image proxy endpoints

#### Benefits

- **Performance**: AI-generated images cached locally to reduce API calls
- **Reliability**: Cached images available even when AI providers are slow/unavailable
- **Cost Optimization**: Reduces repeated requests to expensive AI image generation APIs
- **User Experience**: Faster loading of chat messages with AI-generated images
