import { Suspense } from 'react';

// Critical resource preloading component
export function PerformanceOptimizations() {
  return (
    <>
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/InterVariable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/ClashGrotesk-Variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google.com" />
      
      {/* Preconnect for faster resource loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Resource hints for better performance */}
      <link rel="prefetch" href="/api/health" />
      
      {/* Optimize viewport for mobile */}
      <meta name="theme-color" content="#000000" />
      <meta name="color-scheme" content="dark light" />
      
      {/* Performance optimization meta tags */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
    </>
  );
}

// Wrap components that might cause loading delays
export function LazyComponentWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-muted h-20 rounded" />}>
      {children}
    </Suspense>
  );
}
