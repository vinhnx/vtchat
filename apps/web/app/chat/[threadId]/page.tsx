'use client';
import { TableOfMessages, Thread } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const ChatSessionPage = ({ params }: { params: Promise<{ threadId: string }> }) => {
    const router = useRouter();
    const isGenerating = useChatStore(state => state.isGenerating);
    const [shouldScroll, setShouldScroll] = useState(isGenerating);
    const [threadId, setThreadId] = useState<string | null>(null);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
    });
    const switchThread = useChatStore(state => state.switchThread);
    const getThread = useChatStore(state => state.getThread);

    // Handle the async params
    useEffect(() => {
        params.then(({ threadId }) => {
            setThreadId(threadId);
        });
    }, [params]);

    useEffect(() => {
        if (isGenerating) {
            setShouldScroll(true);
        } else {
            const timer = setTimeout(() => {
                setShouldScroll(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isGenerating]);

    useEffect(() => {
        if (!threadId) {
            return;
        }
        getThread(threadId).then(thread => {
            if (thread?.id) {
                switchThread(thread.id);
            } else {
                router.push('/chat');
            }
        });
    }, [threadId, getThread, switchThread, router]);

    return (
        <>
            {threadId ? (
                <div
                    className="no-scrollbar flex w-full flex-1 flex-col items-center overflow-y-auto px-8"
                    ref={shouldScroll ? scrollRef : undefined}
                >
                    <div className="mx-auto w-full max-w-3xl px-4 pb-[200px] pt-2" ref={contentRef}>
                        <Thread />
                    </div>

                    <TableOfMessages />
                </div>
            ) : (
                <div className="flex w-full flex-1 items-center justify-center">
                    <div>Loading...</div>
                </div>
            )}
        </>
    );
};

export default ChatSessionPage;
