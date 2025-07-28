"use client";

import { ThreadItem } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { log } from "@repo/shared/logger";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

export function Thread() {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? "";
    const storeThreadId = useChatStore(useShallow((state) => state.currentThreadId));
    const switchThread = useChatStore(useShallow((state) => state.switchThread));
    const getThread = useChatStore(useShallow((state) => state.getThread));
    const loadThreadItems = useChatStore(useShallow((state) => state.loadThreadItems));
    const [isLoading, setIsLoading] = useState(false);
    const hasTriedReload = useRef(false);
    const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Ensure the thread ID from URL is used in the store
    useEffect(() => {
        if (currentThreadId && currentThreadId !== storeThreadId) {
            log.info(
                { urlThreadId: currentThreadId, storeThreadId },
                "Thread component syncing thread ID from URL",
            );
            setIsLoading(true);

            // Check if thread exists and switch to it
            getThread(currentThreadId)
                .then((thread) => {
                    if (thread?.id) {
                        // Switch to this thread and load its items
                        switchThread(thread.id).then(() => {
                            loadThreadItems(thread.id)
                                .then((items) => {
                                    log.info(
                                        { threadId: thread.id, itemsCount: items.length },
                                        "Thread component loaded items",
                                    );
                                    setIsLoading(false);
                                    hasTriedReload.current = true;
                                })
                                .catch((error) => {
                                    log.error(
                                        { threadId: thread.id, error },
                                        "Failed to load thread items",
                                    );
                                    setIsLoading(false);
                                    hasTriedReload.current = true;
                                });
                        });
                    } else {
                        setIsLoading(false);
                        hasTriedReload.current = true;
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    hasTriedReload.current = true;
                });
        }
    }, [currentThreadId, storeThreadId, switchThread, getThread, loadThreadItems]);

    // Use the thread ID from URL or fall back to store's thread ID
    const effectiveThreadId = currentThreadId || storeThreadId;

    // Log the effective thread ID for debugging
    useEffect(() => {
        log.info(
            {
                effectiveThreadId,
                urlThreadId: currentThreadId,
                storeThreadId,
            },
            "Thread component using effective thread ID",
        );

        // Clear thread items when navigating away from a thread (e.g., to create a new chat)
        if (!effectiveThreadId) {
            // Use the store's methods to clear thread items
            useChatStore.setState((state) => ({
                ...state,
                threadItems: [],
                currentThreadItem: null,
            }));
        }
    }, [effectiveThreadId, currentThreadId, storeThreadId]);

    const previousThreadItems = useChatStore(
        useShallow((state) => state.getPreviousThreadItems(effectiveThreadId)),
    );
    const currentThreadItem = useChatStore(
        useShallow((state) => state.getCurrentThreadItem(effectiveThreadId)),
    );
    const isGenerating = useChatStore(useShallow((state) => state.isGenerating));

    // Force reload thread items if they're empty, but only once
    useEffect(() => {
        // Clear any existing timer to prevent multiple timers
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }

        if (
            effectiveThreadId &&
            previousThreadItems.length === 0 &&
            !currentThreadItem &&
            !isLoading &&
            !hasTriedReload.current
        ) {
            log.info(
                { effectiveThreadId },
                "Thread component forcing reload of empty thread items",
            );
            setIsLoading(true);

            // Set a flag to prevent infinite reloads
            hasTriedReload.current = true;

            // Add a small delay to prevent rapid consecutive calls
            loadingTimerRef.current = setTimeout(() => {
                loadThreadItems(effectiveThreadId)
                    .then((items) => {
                        log.info(
                            { threadId: effectiveThreadId, itemsCount: items.length },
                            "Thread component reloaded items",
                        );
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        log.error(
                            { threadId: effectiveThreadId, error },
                            "Failed to reload thread items",
                        );
                        setIsLoading(false);
                    });
            }, 500);
        }

        // Cleanup timer on unmount
        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        };
    }, [
        effectiveThreadId,
        previousThreadItems.length,
        currentThreadItem,
        loadThreadItems,
        isLoading,
    ]);

    const memoizedPreviousThreadItems = useMemo(() => {
        return previousThreadItems.map((threadItem) => (
            <div key={threadItem.id}>
                <ThreadItem
                    isAnimated={false}
                    isGenerating={false}
                    isLast={false}
                    key={threadItem.id}
                    threadItem={threadItem}
                />
            </div>
        ));
    }, [previousThreadItems]);

    // Log thread items for debugging
    useEffect(() => {
        log.info(
            {
                previousItemsCount: previousThreadItems.length,
                hasCurrentItem: !!currentThreadItem,
                effectiveThreadId,
            },
            "Thread component items",
        );
    }, [previousThreadItems.length, currentThreadItem, effectiveThreadId]);

    // Show empty state if no thread ID or no thread items and not loading
    if (
        !effectiveThreadId ||
        (previousThreadItems.length === 0 &&
            !currentThreadItem &&
            !isLoading &&
            hasTriedReload.current)
    ) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="text-muted-foreground text-center">
                    <p className="text-lg font-medium">No messages in this conversation</p>
                    <p className="text-sm">Start typing to begin a new conversation</p>
                </div>
            </div>
        );
    }

    // Show loading state - removed skeleton, just return null to show nothing while loading
    if (isLoading) {
        return null;
    }

    return (
        <div className="relative" id="thread-container">
            <div className="flex min-w-full flex-col gap-8 px-2 py-4 md:px-2">
                {memoizedPreviousThreadItems}
                {currentThreadItem && (
                    <div className="min-h-[calc(100dvh-16rem)]" key={currentThreadItem.id}>
                        <ThreadItem
                            isAnimated={true}
                            isGenerating={isGenerating}
                            isLast={true}
                            key={currentThreadItem.id}
                            threadItem={currentThreadItem}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
