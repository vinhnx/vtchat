import { Suspense } from 'react';

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
                crossOrigin='anonymous'
                referrerPolicy='strict-origin-when-cross-origin'
            />

            {/* Make the full CSS dictionary available for compression-dictionary capable browsers */}
            <link
                href='/_next/static/css/full.css'
                rel='compression-dictionary'
                as='fetch'
                type='text/css'
                crossOrigin='anonymous'
            />

            {/* Optimize viewport for mobile */}
            <meta content='#000000' name='theme-color' />
            <meta content='dark light' name='color-scheme' />

            {/* Performance optimization meta tags */}
            <meta content='on' httpEquiv='x-dns-prefetch-control' />
        </>
    );
}

// Wrap components that might cause loading delays
export function LazyComponentWrapper({
    children,
    fallback,
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <Suspense fallback={fallback || <div className='bg-muted h-20 animate-pulse rounded' />}>
            {children}
        </Suspense>
    );
}
