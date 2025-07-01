'use client';

import { InlineLoader, ChatFooter } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import dynamic from 'next/dynamic';

// Dynamically import ChatInput to avoid SSR issues
const ChatInput = dynamic(
    () => import('@repo/common/components').then(mod => ({ default: mod.ChatInput })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        ),
    }
);

export default function ChatPageLayout({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    return (
        <div className="relative flex h-dvh w-full flex-col">
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
            <div className="flex-shrink-0">
                <ChatInput />
            </div>
            
            {/* ChatFooter pinned to bottom with padding for non-logged users */}
            {!isPending && !session && (
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                    <div className="pointer-events-auto">
                        <ChatFooter />
                    </div>
                </div>
            )}
        </div>
    );
}
