export function AccessibilityImprovements() {
    return (
        <>
            {/* Skip to main content link for screen readers */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
                Skip to main content
            </a>

            {/* Accessibility meta tags */}
            <meta name="color-scheme" content="dark light" />
            <meta name="theme-color" content="#000000" />
            
            {/* Improve focus visibility */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    /* Enhanced focus styles for better accessibility */
                    *:focus-visible {
                        outline: 2px solid hsl(var(--ring));
                        outline-offset: 2px;
                    }
                    
                    /* Ensure sufficient color contrast */
                    .text-muted-foreground {
                        color: hsl(var(--muted-foreground));
                    }
                    
                    /* Improve button accessibility */
                    button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    /* Better link accessibility */
                    a:focus-visible {
                        outline: 2px solid hsl(var(--ring));
                        outline-offset: 2px;
                        border-radius: 4px;
                    }
                    
                    /* Reduce motion for users who prefer it */
                    @media (prefers-reduced-motion: reduce) {
                        *, *::before, *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                        }
                    }
                    
                    /* High contrast mode support */
                    @media (prefers-contrast: high) {
                        .text-muted-foreground {
                            color: hsl(var(--foreground));
                        }
                    }
                `
            }} />
        </>
    );
}

