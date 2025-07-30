"use client";
import { Footer, InlineLoader, TableOfMessages, Thread } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
import { log } from "@repo/shared/logger";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useStickToBottom } from "use-stick-to-bottom";

// Dynamically import ChatInput to avoid SSR issues
const ChatInput = dynamic(
    () =>
        import("@repo/common/components").then((mod) => ({
            default: mod.ChatInput,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        ),
    },
);

const ChatSessionPage = (props: { params: Promise<{ threadId: string }> }) => {
    const params = use(props.params);
    const threadId = params.threadId;
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const isGenerating = useChatStore((state) => state.isGenerating);
    const isStoreInitialized = useChatStore((state) => state.isStoreInitialized);
    const hasScrolledToBottom = useRef(false);
    const [isThreadLoaded, setIsThreadLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 0.8, // Reduced for smoother scrolling
        damping: 0.2, // Added damping for smoother animation
    });
    const switchThread = useChatStore((state) => state.switchThread);
    const getThread = useChatStore((state) => state.getThread);
    const currentThreadId = useChatStore((state) => state.currentThreadId);
    const loadThreadItems = useChatStore((state) => state.loadThreadItems);
    const threads = useChatStore((state) => state.threads);

    // Smooth scroll to bottom when thread loads or content changes
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [scrollRef]);

    // Force load thread items when the component mounts
    useEffect(() => {
        if (!threadId) return;

        const loadThread = async () => {
            try {
                setIsLoading(true);
                // Log for debugging
                log.info({ threadId, currentThreadId }, "Loading thread from URL");

                // Check if the store initialization is already handling this thread ID
                let isHandledByStore = false;
                try {
                    const handlingThreadId = sessionStorage.getItem("handling_thread_id");
                    if (handlingThreadId === threadId) {
                        log.info({ threadId }, "Thread is being handled by store initialization");
                        isHandledByStore = true;
                        // Clear the flag so we don't rely on it for future navigations
                        sessionStorage.removeItem("handling_thread_id");
                    }
                } catch (error) {
                    // Ignore sessionStorage errors
                }

                // If the thread is already being handled by store initialization and matches current thread
                if (isHandledByStore && currentThreadId === threadId) {
                    log.info({ threadId }, "Using store-initialized thread");

                    // Just make sure thread items are loaded
                    const items = await loadThreadItems(threadId);
                    log.info({ threadId, itemsCount: items.length }, "Verified thread items");

                    // Mark thread as loaded
                    setIsThreadLoaded(true);

                    // Reset scroll flag
                    hasScrolledToBottom.current = false;

                    // Scroll to bottom after a short delay
                    setTimeout(() => {
                        scrollToBottom();
                        hasScrolledToBottom.current = true;
                    }, 100);

                    setIsLoading(false);
                    return;
                }

                // Also check if we already have the thread loaded in the current state
                // This helps with navigation between threads and page reloads
                if (currentThreadId === threadId && threads.some((t) => t.id === threadId)) {
                    log.info({ threadId }, "Thread already loaded in current state");

                    // Just make sure thread items are loaded
                    const items = await loadThreadItems(threadId);
                    log.info(
                        { threadId, itemsCount: items.length },
                        "Verified thread items for already loaded thread",
                    );

                    // Mark thread as loaded
                    setIsThreadLoaded(true);

                    // Reset scroll flag
                    hasScrolledToBottom.current = false;

                    // Scroll to bottom after a short delay
                    setTimeout(() => {
                        scrollToBottom();
                        hasScrolledToBottom.current = true;
                    }, 100);

                    setIsLoading(false);
                    return;
                }

                // Wait for store initialization and thread loading with improved retry logic
                // After server restart, IndexedDB needs more time to initialize
                let retryCount = 0;
                const maxRetries = 20; // Increased from 5 to 20 for better reliability after server restart
                let thread = null;

                while (!thread && retryCount < maxRetries) {
                    // Check if thread exists in the store
                    thread = await getThread(threadId);

                    // If thread doesn't exist in the store but we have threads loaded
                    if (!thread && threads.length > 0) {
                        // Try to find the thread in the loaded threads
                        thread = threads.find((t) => t.id === threadId);
                        log.info(
                            { threadId, foundInThreads: !!thread },
                            "Searched for thread in loaded threads",
                        );
                    }

                    if (!thread) {
                        retryCount++;
                        if (retryCount < maxRetries) {
                            // Exponential backoff: start with 100ms, increase to max 1000ms
                            const delay = Math.min(100 * 1.5 ** retryCount, 1000);
                            log.info(
                                {
                                    threadId,
                                    retryCount,
                                    delay,
                                    maxRetries,
                                    isStoreInitialized,
                                    threadsCount: threads.length,
                                },
                                "Thread not found, retrying with exponential backoff...",
                            );
                            await new Promise((resolve) => setTimeout(resolve, delay));
                        } else {
                            // On final retry, give extra time for IndexedDB initialization
                            log.warn(
                                {
                                    threadId,
                                    retryCount,
                                    isStoreInitialized,
                                    threadsCount: threads.length,
                                },
                                "Final retry attempt, waiting longer for IndexedDB initialization...",
                            );
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                        }
                    }
                }

                if (thread?.id) {
                    // Only switch thread if it's different from current
                    if (currentThreadId !== thread.id) {
                        log.info({ threadId, currentThreadId }, "Switching to thread");
                        switchThread(thread.id);
                    }

                    // Force load thread items
                    const items = await loadThreadItems(thread.id);

                    log.info({ threadId, itemsCount: items.length }, "Loaded thread items");

                    // Mark thread as loaded even if there are no items
                    setIsThreadLoaded(true);

                    // Reset scroll flag
                    hasScrolledToBottom.current = false;

                    // Scroll to bottom after a short delay
                    setTimeout(() => {
                        scrollToBottom();
                        hasScrolledToBottom.current = true;
                    }, 100);

                    log.info({ threadId }, "Successfully loaded thread");
                } else {
                    // Thread doesn't exist after extensive retry attempts
                    // This could be due to:
                    // 1. Thread was deleted
                    // 2. User doesn't have access to this thread
                    // 3. Database corruption or migration issues
                    log.warn(
                        { threadId, retryCount, maxRetries },
                        "Thread not found after extensive retry attempts, redirecting to home",
                    );
                    router.push("/");
                }
            } catch (error) {
                log.error({ threadId, error }, "Error loading thread");
                // Don't redirect on error, just show the error state
                setIsThreadLoaded(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadThread();
    }, [
        threadId,
        getThread,
        switchThread,
        loadThreadItems,
        router,
        scrollToBottom,
        threads,
        currentThreadId,
        isStoreInitialized,
    ]);

    // Get thread items to trigger scroll when content changes
    const threadItems = useChatStore((state) => state.threadItems);

    // Scroll to bottom when thread items change (for initial load)
    useEffect(() => {
        if (threadItems.length > 0 && !hasScrolledToBottom.current && isThreadLoaded) {
            // Use requestAnimationFrame for better timing with DOM updates
            requestAnimationFrame(() => {
                scrollToBottom();
                hasScrolledToBottom.current = true;
            });
        }
    }, [threadItems, scrollToBottom, isThreadLoaded]);

    // Ensure thread items are loaded when currentThreadId changes
    useEffect(() => {
        if (currentThreadId && currentThreadId === threadId && isThreadLoaded) {
            // Check if we need to load thread items
            if (threadItems.length === 0) {
                log.info(
                    { threadId: currentThreadId },
                    "Loading thread items after thread ID change",
                );
                loadThreadItems(currentThreadId).catch((error) => {
                    log.error(
                        { threadId: currentThreadId, error },
                        "Failed to load thread items after thread ID change",
                    );
                });
            }
        }
    }, [currentThreadId, threadId, threadItems.length, loadThreadItems, isThreadLoaded]);

    // Clear thread items when unmounting the component (e.g., navigating to a new chat)
    useEffect(() => {
        return () => {
            // Only clear thread items if we're navigating to a different thread
            // This prevents flashing when the component re-renders
            const currentPath = window.location.pathname;
            if (!currentPath.includes(`/chat/${threadId}`)) {
                useChatStore.setState((state) => ({
                    ...state,
                    threadItems: [],
                    currentThreadItem: null,
                }));
            }
        };
    }, [threadId]);

    // Show loading while threadId is being resolved
    if (!threadId || isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        );
    }

    return (
        <div className="bg-muted/50 relative flex h-dvh w-full flex-col">
            <h1
                style={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                }}
            >
                VT AI Chat Thread - Minimal Chat with Deep Research
            </h1>
            <div className="flex-1 overflow-hidden">
                <div
                    className="scrollbar-default flex h-full w-full flex-1 flex-col items-center overflow-y-auto px-4 md:px-8"
                    ref={scrollRef}
                >
                    <div
                        className="mx-auto w-[95%] max-w-3xl px-4 pb-[240px] pt-2 md:w-full"
                        ref={contentRef}
                    >
                        <Thread />
                    </div>

                    <TableOfMessages />
                </div>
            </div>
            <div className="pb-safe-area-inset-bottom flex-shrink-0">
                <ChatInput />
            </div>

            {/* ChatFooter pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 pb-20 md:pb-4">
                    <div className="pointer-events-auto">
                        <Footer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSessionPage;
