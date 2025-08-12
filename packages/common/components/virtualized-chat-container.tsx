'use client';

import { cn } from '@repo/ui';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface VirtualizedChatContainerProps {
    children: React.ReactNode[];
    className?: string;
    itemHeight?: number; // Average height of each message
    overscan?: number; // Number of items to render outside visible area
    onScroll?: (scrollTop: number) => void;
}

/**
 * Virtualized chat container that only renders visible messages
 * Improves performance for long conversations by reducing DOM nodes
 */
export const VirtualizedChatContainer = memo(
    ({
        children,
        className,
        itemHeight = 200, // Estimated average message height
        overscan = 5, // Render 5 extra items above and below viewport
        onScroll,
    }: VirtualizedChatContainerProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const [scrollTop, setScrollTop] = useState(0);
        const [containerHeight, setContainerHeight] = useState(0);
        const [isScrolling, setIsScrolling] = useState(false);
        const scrollTimeoutRef = useRef<NodeJS.Timeout>();

        // Calculate visible range
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            children.length - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
        );

        // Get visible items
        const visibleItems = children.slice(startIndex, endIndex + 1);

        // Handle scroll events with throttling
        const handleScroll = useCallback(
            (e: React.UIEvent<HTMLDivElement>) => {
                const target = e.target as HTMLDivElement;
                const newScrollTop = target.scrollTop;

                setScrollTop(newScrollTop);
                setIsScrolling(true);
                onScroll?.(newScrollTop);

                // Clear existing timeout
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }

                // Set scrolling to false after scroll ends
                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                }, 150);
            },
            [onScroll],
        );

        // Update container height on resize
        useEffect(() => {
            const updateHeight = () => {
                if (containerRef.current) {
                    setContainerHeight(containerRef.current.clientHeight);
                }
            };

            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }, []);

        // Auto-scroll to bottom for new messages
        const scrollToBottom = useCallback(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, []);

        // Expose scroll to bottom function
        useEffect(() => {
            // Auto-scroll to bottom when new messages are added
            const shouldAutoScroll =
                scrollTop + containerHeight >= children.length * itemHeight - itemHeight * 2; // Within 2 messages of bottom

            if (shouldAutoScroll) {
                scrollToBottom();
            }
        }, [children.length, scrollToBottom, scrollTop, containerHeight, itemHeight]);

        const totalHeight = children.length * itemHeight;
        const offsetY = startIndex * itemHeight;

        return (
            <div
                ref={containerRef}
                className={cn(
                    'relative overflow-y-auto overflow-x-hidden',
                    'scrollbar-default chat-scroll-container',
                    className,
                )}
                onScroll={handleScroll}
                style={{
                    height: '100%',
                    contain: 'layout style',
                }}
            >
                {/* Total height spacer */}
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {/* Visible items container */}
                    <div
                        style={{
                            transform: `translateY(${offsetY}px)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            contain: 'layout style',
                        }}
                    >
                        {visibleItems.map((child, index) => (
                            <div
                                key={startIndex + index}
                                className='message-container'
                                style={{
                                    minHeight: itemHeight,
                                    contain: 'layout style',
                                    contentVisibility: isScrolling ? 'auto' : 'visible',
                                }}
                            >
                                {child}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    },
);

VirtualizedChatContainer.displayName = 'VirtualizedChatContainer';

/**
 * Hook for managing virtualized chat state
 */
export function useVirtualizedChat(itemCount: number, itemHeight = 200) {
    const [scrollTop, setScrollTop] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const handleScroll = useCallback(
        (newScrollTop: number) => {
            setScrollTop(newScrollTop);

            // Check if user is at bottom (within one message height)
            const totalHeight = itemCount * itemHeight;
            const isNearBottom = newScrollTop + window.innerHeight >= totalHeight - itemHeight;
            setIsAtBottom(isNearBottom);
        },
        [itemCount, itemHeight],
    );

    return {
        scrollTop,
        isAtBottom,
        handleScroll,
    };
}
