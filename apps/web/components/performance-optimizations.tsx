import { Suspense } from "react";

// Critical resource preloading component
export function PerformanceOptimizations() {
    return (
        <>
            {/* DNS prefetch for external domains */}
            <link href="//fonts.googleapis.com" rel="preconnect" />
            <link href="//fonts.gstatic.com" rel="preconnect" crossOrigin="" />
            <link href="//www.google.com" rel="dns-prefetch" />

            {/* Preload critical fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                rel="preload"
                as="style"
                onLoad="this.onload=null;this.rel='stylesheet'"
            />
            <noscript>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </noscript>

            {/* Resource hints for better performance */}
            <link href="/api/health" rel="prefetch" />
            <link href="/favicon.ico" rel="preload" as="image" />

            {/* Optimize viewport for mobile */}
            <meta content="#000000" name="theme-color" />
            <meta content="dark light" name="color-scheme" />

            {/* Performance optimization meta tags */}
            <meta content="on" httpEquiv="x-dns-prefetch-control" />
            
            {/* Reduce font loading to essential weights only */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* Optimize font loading performance */
                    @font-face {
                        font-family: 'Inter';
                        font-style: normal;
                        font-weight: 400;
                        font-display: swap;
                        src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
                        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
                    }
                `
            }} />
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
        <Suspense fallback={fallback || <div className="bg-muted h-20 animate-pulse rounded" />}>
            {children}
        </Suspense>
    );
}
