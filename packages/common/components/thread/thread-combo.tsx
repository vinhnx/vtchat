"use client";

import { ThreadItem } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

export function Thread() {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? "";

    // Only call getPreviousThreadItems if we have a valid threadId
    const previousThreadItems = useChatStore(
        useShallow((state) =>
            currentThreadId ? state.getPreviousThreadItems(currentThreadId) : [],
        ),
    );
    const currentThreadItem = useChatStore(
        useShallow((state) =>
            currentThreadId ? state.getCurrentThreadItem(currentThreadId) : null,
        ),
    );
    const isGenerating = useChatStore(useShallow((state) => state.isGenerating));
    const memoizedPreviousThreadItems = useMemo(() => {
        return previousThreadItems.map((threadItem) => (
            <div
                key={threadItem.id}
                className="message-container pb-2"
                style={{
                    contain: "layout style",
                    contentVisibility: "auto",
                    containIntrinsicSize: "0 300px",
                }}
            >
                <ThreadItem
                    key={threadItem.id}
                    threadItem={threadItem}
                    isAnimated={false}
                    isGenerating={false}
                    isLast={false}
                />
            </div>
        ));
    }, [previousThreadItems]);

    // Memoize current thread item to prevent unnecessary re-renders
    const memoizedCurrentThreadItem = useMemo(() => {
        if (!currentThreadItem) return null;

        return (
            <div
                key={currentThreadItem.id}
                className="message-container streaming-content min-h-[calc(100dvh-16rem)] pb-2"
                style={{
                    contain: "layout style",
                    contentVisibility: "visible", // Always visible for current item
                }}
            >
                <ThreadItem
                    key={currentThreadItem.id}
                    threadItem={currentThreadItem}
                    isAnimated={true}
                    isGenerating={isGenerating}
                    isLast={true}
                />
            </div>
        );
    }, [currentThreadItem, isGenerating]);

    // Show loading indicator for new threads when generating but no current thread item exists yet
    const showNewThreadLoadingIndicator = isGenerating && !currentThreadItem && currentThreadId;

    return (
        <div className="relative" id="thread-container">
            <div className="flex min-w-full flex-col gap-6 px-2 py-4 pt-6">
                {" "}
                {/* Reduced gap between thread items to prevent overlap */}
                {memoizedPreviousThreadItems}
                {memoizedCurrentThreadItem}
                {showNewThreadLoadingIndicator && (
                    <div className="min-h-[calc(100dvh-16rem)]">
                        <div className="flex w-full items-start gap-2 pt-4 md:gap-3">
                            {/* Avatar with VT icon */}
                            <div className="bg-muted border-muted-foreground/20 relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm md:h-10 md:w-10">
                                <img
                                    src="/icon-192x192.png"
                                    alt="VT"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                                {/* Status indicator */}
                                <div className="bg-muted-foreground/40 absolute -right-1 -top-1 h-4 w-4 rounded-full">
                                    <div className="bg-background/60 h-full w-full rounded-full" />
                                </div>
                            </div>

                            {/* Loading content */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                                        <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                                        <div className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full"></div>
                                    </div>
                                    <span className="text-muted-foreground text-sm">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
