'use client';
import { TableOfMessages, Thread } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({ params }: { params: Promise<{ threadId: string }> }) => {
    const router = useRouter();
    const isGenerating = useChatStore(state => state.isGenerating);
    const hasScrolledToBottom = useRef(false);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
        enabled: isGenerating, // Only auto-scroll when generating
    });
    const switchThread = useChatStore(state => state.switchThread);
    const getThread = useChatStore(state => state.getThread);

    // Handle the async params with React.use()
    const { threadId } = use(params);

    // Scroll to bottom when thread loads or content changes
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        getThread(threadId).then(thread => {
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
                router.push('/chat');
            }
        });
    }, [threadId, getThread, switchThread, router, scrollToBottom]);

    // Get thread items to trigger scroll when content changes
    const threadItems = useChatStore(state => state.threadItems);

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

    return (
        <div
            className="scrollbar-default flex h-full w-full flex-1 flex-col items-center overflow-y-auto px-4 md:px-8"
            ref={scrollRef}
        >
            <div className="mx-auto w-[95%] max-w-3xl px-4 pb-[200px] pt-2 md:w-full" ref={contentRef}>
                <Thread />
            </div>

            <TableOfMessages />
        </div>
    );
};

export default ChatSessionPage;
