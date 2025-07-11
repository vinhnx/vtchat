'use client';
import { ChatFooter, InlineLoader, TableOfMessages, Thread } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';


// Dynamically import ChatInput to avoid SSR issues
const ChatInput = dynamic(
    () =>
        import('@repo/common/components').then((mod) => ({
            default: mod.ChatInput,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        ),
    }
);

const ChatSessionPage = ({ params }: { params: Promise<{ threadId: string }> }) => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const isGenerating = useChatStore((state) => state.isGenerating);
    const hasScrolledToBottom = useRef(false);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
        enabled: isGenerating, // Only auto-scroll when generating
    });
    const switchThread = useChatStore((state) => state.switchThread);
    const getThread = useChatStore((state) => state.getThread);

    // Handle async params with React 18 pattern
    const [threadId, setThreadId] = useState<string | null>(null);

    useEffect(() => {
        params.then((resolvedParams) => {
            setThreadId(resolvedParams.threadId);
        });
    }, [params]);

    // Scroll to bottom when thread loads or content changes
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (!threadId) return;

        getThread(threadId).then((thread) => {
            if (thread?.id) {
                switchThread(thread.id);
                // Reset scroll flag when switching threads
                hasScrolledToBottom.current = false;
                // Scroll to bottom after a short delay to allow content to render
                setTimeout(() => {
                    scrollToBottom();
                    hasScrolledToBottom.current = true;
                }, 100);
            } else {
                router.push('/'); // Redirect to root instead of /chat
            }
        });
    }, [threadId, getThread, switchThread, router, scrollToBottom]);

    // Get thread items to trigger scroll when content changes
    const threadItems = useChatStore((state) => state.threadItems);

    // Scroll to bottom when thread items change (for initial load)
    useEffect(() => {
        if (threadItems.length > 0 && !hasScrolledToBottom.current) {
            // Use requestAnimationFrame for better timing with DOM updates
            requestAnimationFrame(() => {
                setTimeout(() => {
                    scrollToBottom();
                    hasScrolledToBottom.current = true;
                }, 50);
            });
        }
    }, [threadItems, scrollToBottom]);

    // Show loading while threadId is being resolved
    if (!threadId) {
        return (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        );
    }

    return (
        <div className="relative flex h-dvh w-full flex-col">
            <div className="flex-1 overflow-hidden">
                <div
                    className="scrollbar-default flex h-full w-full flex-1 flex-col items-center overflow-y-auto px-4 md:px-8"
                    ref={scrollRef}
                >
                    <div
                        className="mx-auto w-[95%] max-w-3xl px-4 pb-[200px] pt-2 md:w-full"
                        ref={contentRef}
                    >
                        <Thread />
                    </div>

                    <TableOfMessages />
                </div>
            </div>
            <div className="flex-shrink-0">
                <ChatInput />
            </div>

            {/* ChatFooter pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                    <div className="pointer-events-auto">
                        <ChatFooter />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSessionPage;
