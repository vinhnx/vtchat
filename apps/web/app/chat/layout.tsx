'use client';

import { InlineLoader } from '@repo/common/components';
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
    return (
        <div className="relative flex h-full w-full flex-col">
            {children}
            <ChatInput />
        </div>
    );
}
