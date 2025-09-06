# LCP Optimization Plan for VT Chat

## Current LCP Issues Identified

1. **Lighthouse Warning**: Image with src "/icons/peerlist_badge.svg" was detected as LCP
2. **Heavy Component Loading**: Thread component with dynamic imports causing delayed rendering
3. **Missing Critical Resource Preloading**: Several key assets not preloaded

## Optimization Strategies

### 1. Preload Critical Assets

Add preload directives for LCP elements in `performance-optimizations.tsx`:

```tsx
// Critical resource preloading component
export function PerformanceOptimizations() {
    return (
        <>
            {/* DNS prefetch for external domains */}
            <link href='//www.google.com' rel='dns-prefetch' />

            {/* Preload critical assets for LCP */}
            <link href='/icon-192x192.png' rel='preload' as='image' />
            <link href='/icons/peerlist_badge.svg' rel='preload' as='image' />
            <link href='/api/health' rel='prefetch' />
            <link href='/favicon.ico' rel='preload' as='image' />

            {/* Preload critical fonts */}
            <link
                href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
                rel='preload'
                as='style'
            />

            {/* Optimize viewport for mobile */}
            <meta content='#000000' name='theme-color' />
            <meta content='dark light' name='color-scheme' />

            {/* Performance optimization meta tags */}
            <meta content='on' httpEquiv='x-dns-prefetch-control' />
        </>
    );
}
```

### 2. Optimize Thread Component Loading

Modify the Thread component to render a minimal skeleton during initial load:

```tsx
// In packages/common/components/thread/thread-combo.tsx
export function Thread() {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? '';

    // Show skeleton on initial load
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Set initial load to false after first render
        const timer = setTimeout(() => setIsInitialLoad(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Rest of component logic...

    if (isInitialLoad) {
        return (
            <div className='flex min-w-full flex-col gap-6 px-2 py-4 pt-6'>
                {/* Skeleton for first message */}
                <div className='flex animate-pulse space-x-4'>
                    <div className='bg-muted-foreground/20 h-10 w-10 rounded-full' />
                    <div className='flex-1 space-y-2'>
                        <div className='bg-muted-foreground/20 h-4 w-3/4 rounded' />
                        <div className='bg-muted-foreground/20 h-4 rounded' />
                    </div>
                </div>
            </div>
        );
    }

    // Rest of existing component code...
}
```

### 3. Optimize Image Loading

In the ThreadItem component, add priority loading for key images:

```tsx
// In packages/common/components/thread/thread-item.tsx
<img
    src='/icon-192x192.png'
    alt='VT'
    width={20}
    height={20}
    className='object-contain'
    fetchPriority='high' // Add this for LCP optimization
    decoding='async'
/>;
```

### 4. Add Resource Hints to Next Config

In `next.config.mjs`, add additional resource hints:

```js
// Add to the headers array
{
    // Preload critical icons
    source: "/",
    headers: [
        {
            key: "Link",
            value: "</icon-192x192.png>; rel=preload; as=image, </icons/peerlist_badge.svg>; rel=preload; as=image"
        }
    ]
}
```

### 5. Optimize CSS Loading

Add critical CSS inlining in `next.config.mjs`:

```js
experimental: {
    // ... existing config
    optimizeCss: true,
    inlineCss: true,
}
```

### 6. Reduce Initial Bundle Size

Modify dynamic imports in `page.tsx` to prioritize critical components:

```tsx
// In apps/web/app/page.tsx, adjust the dynamic imports:
const ThreadWithSuspense = NextDynamic(
    () =>
        import('../components/lazy-components').then(mod => ({
            default: mod.ThreadWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className='flex h-full items-center justify-center'>
                <div className='animate-pulse'>Loading chat...</div>
            </div>
        ),
        // Add this to prioritize loading
        options: { suspense: true },
    },
);
```

## Implementation Priority

1. **High Priority** (Immediate):
   - Add preload directives for critical images
   - Optimize image loading attributes
   - Implement skeleton loading for Thread component

2. **Medium Priority** (Next release):
   - Add resource hints to Next config
   - Optimize CSS loading
   - Reduce initial bundle size

3. **Low Priority** (Future optimization):
   - Implement advanced code splitting
   - Add service worker caching for critical assets

## Expected Impact

These optimizations should improve LCP by:

- Reducing resource load times through preloading
- Eliminating render-blocking delays
- Providing immediate visual feedback with skeleton loading
- Prioritizing critical asset loading

## Testing Strategy

1. Run Lighthouse performance tests before and after implementation
2. Monitor LCP metrics in web vitals reporting
3. Verify no regressions in other core web vitals (CLS, FID)
4. Test on various network conditions (3G, 4G, WiFi)

## Rollout Plan

1. Implement preload directives and image optimizations (1 day)
2. Add skeleton loading to Thread component (1 day)
3. Update Next.js configuration (1 day)
4. Comprehensive testing and monitoring (2 days)
