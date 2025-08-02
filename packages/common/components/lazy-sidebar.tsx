"use client";

import { lazy, Suspense } from "react";

// Lazy load the sidebar content to improve initial loading performance
const SidebarContent = lazy(() =>
    import("./side-bar").then((module) => ({
        default: module.Sidebar,
    })),
);

interface LazySidebarProps {
    forceMobile?: boolean;
}

/**
 * Lazy-loaded sidebar that shows skeleton while loading content
 * Improves initial page load performance by deferring sidebar content
 */
export function LazySidebar({ forceMobile = false }: LazySidebarProps) {
    return (
        <div className="w-auto max-w-[300px]">
            <Suspense fallback={<SidebarSkeleton />}>
                <SidebarContent forceMobile={forceMobile} />
            </Suspense>
        </div>
    );
}

/**
 * Minimal sidebar loading skeleton component
 * Follows design principles: minimal, compact, no colors
 */
function SidebarSkeleton() {
    return (
        <div className="flex h-full w-full flex-col gap-2 bg-background p-3">
            {/* Minimal header */}
            <div className="flex items-center gap-2 h-8">
                <div className="h-4 w-4 rounded bg-muted/50" />
                <div className="h-3 w-12 rounded bg-muted/50" />
            </div>

            {/* Compact search placeholder */}
            <div className="h-8 w-full rounded bg-muted/30" />

            {/* Minimal thread placeholders */}
            <div className="flex flex-col gap-1 mt-2">
                {Array.from({ length: 3 }).map(() => (
                    <div key={crypto.randomUUID()} className="h-6 w-full rounded bg-muted/40" />
                ))}
            </div>
        </div>
    );
}
