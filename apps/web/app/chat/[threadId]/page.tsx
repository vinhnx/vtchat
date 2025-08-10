"use client";
import { Footer, InlineLoader, TableOfMessages, Thread } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
import { log } from "@repo/shared/logger";
import { Button } from "@repo/ui";
import { ArrowLeft, Home } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { E2BSandboxPanel } from "@/components/E2BSandboxPanel";
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
        stiffness: 1, // Instant scrolling for streaming
        damping: 0, // No damping for immediate response
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

                    // Check if we already have thread items in memory (optimistic items)
                    const currentThreadItems = useChatStore
                        .getState()
                        .threadItems.filter((item) => item.threadId === threadId);

                    if (currentThreadItems.length > 0) {
                        log.info(
                            { threadId, itemsCount: currentThreadItems.length },
                            "Using existing thread items from store (optimistic items)",
                        );
                        // Don't call loadThreadItems - use what's already in store
                    } else {
                        // Only load from database if no items in store
                        const items = await loadThreadItems(threadId);
                        log.info(
                            { threadId, itemsCount: items.length },
                            "Loaded thread items from database",
                        );
                    }

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

    // Derive sandbox artifacts from the current thread item's tool results
    const currentThreadItem = useChatStore((state) => state.getCurrentThreadItem)(threadId);
    const [stoppedSandboxId, setStoppedSandboxId] = useState<string | null>(null);
    const [isStopping, setIsStopping] = useState(false);

    const { clientArtifact, serverArtifact } = useMemo(() => {
        const init = {
            clientArtifact: null as null | {
                lang: "js" | "html" | "python";
                files: Record<string, string>;
                title?: string;
            },
            serverArtifact: null as null | { 
                sandboxId: string; 
                host: string | null;
                files?: Record<string, string>;
                cmd?: string;
                port?: number;
            },
        };
        if (!currentThreadItem?.toolResults) return init;
        const results = Object.values(currentThreadItem.toolResults);
        // Prefer the latest sandbox-related result
        for (let i = results.length - 1; i >= 0; i--) {
            const r = results[i];
            if (r.toolName === "openSandbox" && r.result && r.result.files) {
                const { lang, files, title } = r.result || {};
                if (lang && files)
                    return { clientArtifact: { lang, files, title }, serverArtifact: null };
            }
            if (r.toolName === "startSandbox" && r.result && "sandboxId" in r.result) {
                const { sandboxId, host, files, cmd, port } = r.result as any;
                if (stoppedSandboxId && sandboxId === stoppedSandboxId) {
                    return init;
                }
                return { 
                    clientArtifact: null, 
                    serverArtifact: { 
                        sandboxId, 
                        host: host ?? null,
                        files: files ?? undefined,
                        cmd: cmd ?? undefined,
                        port: port ?? undefined
                    } 
                };
            }
        }
        return init;
    }, [currentThreadItem, stoppedSandboxId, threadItems]);

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

    // Auto-scroll when new messages are added (not just initial load)
    useEffect(() => {
        if (threadItems.length > 0 && hasScrolledToBottom.current && isThreadLoaded) {
            // Use a small delay to ensure DOM has updated
            const timeoutId = setTimeout(() => {
                scrollToBottom();
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [threadItems.length, scrollToBottom, isThreadLoaded]);

    // Non-blocking auto-scroll during streaming with user scroll detection
    useEffect(() => {
        if (isGenerating && scrollRef.current) {
            let lastScrollHeight = 0;
            let userScrolling = false;
            let scrollTimeout: NodeJS.Timeout;
            let contentCheckInterval: NodeJS.Timeout;

            const handleUserScroll = () => {
                userScrolling = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    userScrolling = false;
                }, 1000); // Allow auto-scroll to resume after 1 second of no user interaction
            };

            const checkContentAndScroll = () => {
                if (scrollRef.current && !userScrolling) {
                    const currentScrollHeight = scrollRef.current.scrollHeight;
                    const scrollTop = scrollRef.current.scrollTop;
                    const clientHeight = scrollRef.current.clientHeight;

                    // Only auto-scroll if user is near the bottom and content has changed
                    const isNearBottom = scrollTop + clientHeight >= currentScrollHeight - 100;

                    if (currentScrollHeight !== lastScrollHeight && isNearBottom) {
                        scrollRef.current.scrollTo({
                            top: currentScrollHeight,
                            behavior: "smooth",
                        });
                        lastScrollHeight = currentScrollHeight;
                    }
                }
            };

            // Add passive scroll listener to detect user scrolling
            const scrollElement = scrollRef.current;
            scrollElement.addEventListener("scroll", handleUserScroll, { passive: true });

            // Check for content changes periodically (less aggressive than requestAnimationFrame)
            contentCheckInterval = setInterval(checkContentAndScroll, 100);

            return () => {
                if (scrollElement) {
                    scrollElement.removeEventListener("scroll", handleUserScroll);
                }
                clearTimeout(scrollTimeout);
                clearInterval(contentCheckInterval);
            };
        }
    }, [isGenerating, scrollRef]);

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

            {/* Header Navigation with Back to Home Button */}
            <div className="thread-header flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-3 md:px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/")}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">VT</span>
                        <Home size={16} className="sm:hidden" />
                    </Button>

                    {/* Thread title or status */}
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                            {isGenerating ? "Generating..." : ""}
                        </span>
                    </div>
                </div>
            </div>

            <div className="thread-content-with-header flex-1 overflow-hidden">
                <div
                    className={
                        clientArtifact || serverArtifact
                            ? "grid h-full grid-cols-1 gap-4 px-4 md:px-8 lg:grid-cols-[1fr_520px]"
                            : "px-4 md:px-8"
                    }
                >
                    {/* Left: chat */}
                    <div className="col-span-1">
                        <div
                            className="scrollbar-default chat-scroll-container flex h-full w-full flex-1 flex-col items-center overflow-y-auto"
                            ref={scrollRef}
                            style={{ contain: "layout", overflowAnchor: "auto" }}
                        >
                            <div
                                className="pb-18 mx-auto w-[95%] max-w-3xl px-4 pt-2 md:w-full"
                                ref={contentRef}
                                style={{ contain: "none", isolation: "isolate" }}
                            >
                                <Thread />
                            </div>

                            {/* Footer inside the white container for non-logged users */}
                            {!(isPending || session) && (
                                <div className="mx-auto w-[95%] max-w-3xl px-4 pb-[240px] md:w-full">
                                    <Footer />
                                </div>
                            )}

                            <TableOfMessages />
                        </div>
                        <div className="pb-safe-area-inset-bottom flex-shrink-0">
                            <ChatInput />
                        </div>
                    </div>

                    {/* Right: sandbox preview panel */}
                    {(clientArtifact || serverArtifact) && (
                        <div className="border-muted/40 bg-background sticky top-0 hidden h-[calc(100dvh-110px)] overflow-hidden rounded-xl border lg:block">
                            {serverArtifact ? (
                                serverArtifact.host ? (
                                    // Prioritize iframe when host is available
                                    <div className="flex h-full flex-col">
                                        <iframe src={serverArtifact.host} className="w-full flex-1" />
                                        <div className="border-muted/40 flex items-center gap-2 border-t p-2">
                                            <a
                                                href={serverArtifact.host}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-foreground text-xs underline"
                                            >
                                                Open in new tab
                                            </a>
                                            <div className="flex-1" />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isStopping}
                                                onClick={async () => {
                                                    if (!serverArtifact?.sandboxId) return;
                                                    setIsStopping(true);
                                                    try {
                                                        const res = await fetch("/api/sandbox/stop", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                sandboxId: serverArtifact.sandboxId,
                                                            }),
                                                        });
                                                        if (res.ok) {
                                                            setStoppedSandboxId(
                                                                serverArtifact.sandboxId,
                                                            );
                                                        }
                                                    } finally {
                                                        setIsStopping(false);
                                                    }
                                                }}
                                            >
                                                {isStopping ? "Stopping…" : "Stop sandbox"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : serverArtifact.files ? (
                                    // Show files when no host is available
                                    <div className="flex h-full flex-col">
                                        <div className="p-2 flex-1 overflow-auto">
                                            <E2BSandboxPanel
                                                toolResult={{
                                                    toolName: "startSandbox",
                                                    result: {
                                                        sandboxId: serverArtifact.sandboxId,
                                                        files: serverArtifact.files
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-sm text-muted-foreground">
                                        Server sandbox started but no preview available.
                                    </div>
                                )
                            ) : clientArtifact ? (
                                <div className="p-2">
                                    <E2BSandboxPanel
                                        toolResult={{
                                            toolName: "openSandbox",
                                            result: {
                                                files: clientArtifact.files,
                                                language: "javascript"
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="p-6 text-sm text-muted-foreground">
                                    Sandboxes will appear here.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatSessionPage;
