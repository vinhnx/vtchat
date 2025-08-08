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
        <div className="bg-background flex h-full w-full flex-col gap-2 p-3">
            {/* Minimal header */}
            <div className="flex h-8 items-center gap-2">
                <div className="bg-muted/50 h-4 w-4 rounded" />
                <div className="bg-muted/50 h-3 w-12 rounded" />
            </div>

            {/* Compact search placeholder */}
            <div className="bg-muted/30 h-8 w-full rounded" />

            {/* Minimal thread placeholders */}
            <div className="mt-2 flex flex-col gap-1">
                {Array.from({ length: 3 }).map(() => (
                    <div key={crypto.randomUUID()} className="bg-muted/40 h-6 w-full rounded" />
                ))}
            </div>
        </div>
    );
}
