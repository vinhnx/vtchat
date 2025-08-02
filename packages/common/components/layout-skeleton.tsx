"use client";

import { motion } from "framer-motion";

interface LayoutSkeletonProps {
    showSidebar?: boolean;
    sidebarPlacement?: "left" | "right";
}

/**
 * Immediate layout skeleton that shows the basic structure
 * Consistent between SSR and client-side rendering
 */
export function LayoutSkeleton({
    showSidebar = true,
    sidebarPlacement = "left",
}: LayoutSkeletonProps) {
    const containerClass =
        "relative flex flex-1 flex-row h-[100dvh] border border-border rounded-sm bg-secondary w-full overflow-hidden shadow-sm";

    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            {/* Left Sidebar Skeleton */}
            {showSidebar && sidebarPlacement === "left" && (
                <div className="hidden md:flex">
                    <div className="w-[300px] max-w-[300px] flex-none">
                        <SidebarSkeleton />
                    </div>
                </div>
            )}

            {/* Main Content Skeleton */}
            <div className="flex h-[100dvh] flex-1 overflow-hidden">
                <motion.div
                    className={`flex h-full w-full md:py-1 ${sidebarPlacement === "left" ? "md:pr-1" : "md:pl-1"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className={containerClass}>
                        <div className="relative flex h-full w-full flex-row">
                            <div className="flex flex-1 min-w-0 flex-col gap-2 overflow-y-auto">
                                <ChatInterfaceSkeleton />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Sidebar Skeleton */}
            {showSidebar && sidebarPlacement === "right" && (
                <div className="hidden md:flex">
                    <div className="w-[300px] max-w-[300px] flex-none">
                        <SidebarSkeleton />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Minimal sidebar loading skeleton
 * Follows design principles: clean, minimal, compact
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

/**
 * Chat interface loading skeleton
 */
function ChatInterfaceSkeleton() {
    return (
        <div className="flex h-full flex-col">
            {/* Chat Header Skeleton */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            </div>

            {/* Chat Messages Area Skeleton */}
            <div className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }, () => (
                        <div key={crypto.randomUUID()} className="flex flex-col gap-2">
                            <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                            <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Input Skeleton */}
            <div className="border-t border-border p-4">
                <div className="flex gap-2">
                    <div className="h-12 flex-1 rounded-lg bg-muted animate-pulse" />
                    <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    );
}
