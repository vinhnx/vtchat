'use client';

import { motion } from 'framer-motion';

interface LayoutSkeletonProps {
    showSidebar?: boolean;
    sidebarPlacement?: 'left' | 'right';
}

/**
 * Immediate layout skeleton that shows the basic structure
 * Consistent between SSR and client-side rendering
 */
export function LayoutSkeleton({
    showSidebar = true,
    sidebarPlacement = 'left',
}: LayoutSkeletonProps) {
    const containerClass =
        'relative flex flex-1 flex-row h-[100dvh] border border-border rounded-sm bg-secondary w-full overflow-hidden shadow-sm';

    return (
        <div className='bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden'>
            {/* Left Sidebar Skeleton */}
            {showSidebar && sidebarPlacement === 'left' && (
                <div className='hidden md:flex'>
                    <div className='w-[300px] max-w-[300px] flex-none'>
                        <SidebarSkeleton />
                    </div>
                </div>
            )}

            {/* Main Content Skeleton */}
            <div className='flex h-[100dvh] flex-1 overflow-hidden'>
                <motion.div
                    className={`flex h-full w-full md:py-1 ${
                        sidebarPlacement === 'left' ? 'md:pr-1' : 'md:pl-1'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className={containerClass}>
                        <div className='relative flex h-full w-full flex-row'>
                            <div className='flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto'>
                                <ChatInterfaceSkeleton />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Sidebar Skeleton */}
            {showSidebar && sidebarPlacement === 'right' && (
                <div className='hidden md:flex'>
                    <div className='w-[300px] max-w-[300px] flex-none'>
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
        <div className='bg-background flex h-full w-full flex-col gap-2 p-3'>
            {/* Minimal header */}
            <div className='flex h-8 items-center gap-2'>
                <div className='bg-muted/50 h-4 w-4 rounded' />
                <div className='bg-muted/50 h-3 w-12 rounded' />
            </div>

            {/* Compact search placeholder */}
            <div className='bg-muted/30 h-8 w-full rounded' />

            {/* Minimal thread placeholders */}
            <div className='mt-2 flex flex-col gap-1'>
                {Array.from({ length: 3 }).map(() => (
                    <div key={crypto.randomUUID()} className='bg-muted/40 h-6 w-full rounded' />
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
        <div className='flex h-full flex-col'>
            {/* Chat Header Skeleton */}
            <div className='border-border flex items-center justify-between border-b p-4'>
                <div className='flex items-center gap-2'>
                    <div className='bg-muted h-6 w-6 animate-pulse rounded' />
                    <div className='bg-muted h-5 w-32 animate-pulse rounded' />
                </div>
                <div className='bg-muted h-8 w-8 animate-pulse rounded' />
            </div>

            {/* Chat Messages Area Skeleton */}
            <div className='flex-1 p-4'>
                <div className='flex flex-col gap-4'>
                    {Array.from(
                        { length: 3 },
                        () => (
                            <div key={crypto.randomUUID()} className='flex flex-col gap-2'>
                                <div className='bg-muted h-4 w-1/4 animate-pulse rounded' />
                                <div className='bg-muted h-16 w-full animate-pulse rounded-lg' />
                            </div>
                        ),
                    )}
                </div>
            </div>

            {/* Chat Input Skeleton */}
            <div className='border-border border-t p-4'>
                <div className='flex gap-2'>
                    <div className='bg-muted h-12 flex-1 animate-pulse rounded-lg' />
                    <div className='bg-muted h-12 w-12 animate-pulse rounded-lg' />
                </div>
            </div>
        </div>
    );
}
