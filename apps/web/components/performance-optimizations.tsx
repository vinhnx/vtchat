import { Suspense } from "react";

// Critical resource preloading component
export function PerformanceOptimizations() {
    return (
        <>
            {/* DNS prefetch for external domains */}
            <link href="//www.google.com" rel="dns-prefetch" />

            {/* Resource hints for better performance */}
            <link href="/api/health" rel="prefetch" />

            {/* Optimize viewport for mobile */}
            <meta content="#000000" name="theme-color" />
            <meta content="dark light" name="color-scheme" />

            {/* Performance optimization meta tags */}
            <meta content="on" httpEquiv="x-dns-prefetch-control" />
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
