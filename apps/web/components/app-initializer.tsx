'use client';

let hasInitialized = false;

/**
 * Client-side app initialization component
 * Handles runtime-only services like Redis cache invalidation
 * Avoids useEffect by guarding a single initialization run.
 */
function startInitialization() {
    if (hasInitialized) {
        return;
    }
    hasInitialized = true;

    // Only run on client side to avoid build-time initialization
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        // Dynamic import to avoid bundling during SSR/build
        import('../lib/startup')
            .then(({ initializeApp }) => {
                initializeApp();
            })
            .catch(() => {
                // Silent fallback if Redis services aren't available
            });
    }
}

export function AppInitializer() {
    startInitialization();
    // This component doesn't render anything
    return null;
}
