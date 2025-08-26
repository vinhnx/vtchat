// Simple test to verify preload directives
export async function testPreloadDirectives() {
    // This would typically run in a browser environment
    const links = document.querySelectorAll('link[rel="preload"]');
    const preloadHrefs = Array.from(links).map(link => link.getAttribute('href'));

    // Check for critical resources
    const hasVTLogo = preloadHrefs.includes('/icon-192x192.png');
    const hasPeerlistBadge = preloadHrefs.includes('/icons/peerlist_badge.svg');
    const hasFavicon = preloadHrefs.includes('/favicon.ico');

    return {
        hasVTLogo,
        hasPeerlistBadge,
        hasFavicon,
        totalPreloads: preloadHrefs.length,
    };
}

// Export for testing
if (typeof window !== 'undefined') {
    (window as any).testPreloadDirectives = testPreloadDirectives;
}
