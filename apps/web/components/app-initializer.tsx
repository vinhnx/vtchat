"use client";

import { useEffect } from "react";

/**
 * Client-side app initialization component
 * Handles runtime-only services like Redis cache invalidation
 */
export function AppInitializer() {
    useEffect(() => {
        // Only run on client side to avoid build-time initialization
        if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
            // Dynamic import to avoid bundling during SSR/build
            import("../lib/startup")
                .then(({ initializeApp }) => {
                    initializeApp();
                })
                .catch((error) => {
                    // Silent fallback if Redis services aren't available
                    console.debug("App services initialization skipped:", error?.message);
                });
        }
    }, []);

    // This component doesn't render anything
    return null;
}
