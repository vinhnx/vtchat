'use client';

import { TypographySmall } from '@repo/ui';
import NextDynamic from 'next/dynamic';

// Dynamically import components that use agent hooks with no SSR
const ThreadWithSuspense = NextDynamic(
    () =>
        import('../components/lazy-components').then((mod) => ({
            default: mod.ThreadWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className='flex h-full items-center justify-center'>
                <div className='animate-pulse'>
                    <TypographySmall>Loading AI chat...</TypographySmall>
                </div>
            </div>
        ),
    },
);

const ChatInputWithSuspense = NextDynamic(
    () =>
        import('../components/lazy-components').then((mod) => ({
            default: mod.ChatInputWithSuspense,
        })),
    {
        ssr: false,
    },
);

import { useChatStore } from '@repo/common/store';

export default function ClientHome() {
    const threadId = useChatStore((state) => state.currentThreadId);

    return (
        <div className='flex h-full w-full flex-1 flex-col overflow-hidden'>
            {threadId ? <ThreadWithSuspense /> : (
                // Minimal welcome placeholder when no thread is selected. The full
                // WelcomeScreen can be rendered client-side similarly if needed.
                <div className='flex h-full items-center justify-center p-8'>
                    <div className='text-center text-muted-foreground'>
                        Welcome to VT — start a new conversation to begin.
                    </div>
                </div>
            )}
            <ChatInputWithSuspense showGreeting={!threadId} />
        </div>
    );
}
