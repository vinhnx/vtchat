'use client';

import dynamic from 'next/dynamic';

// Dynamically import ChatInput to avoid SSR issues
const ChatInput = dynamic(
    () => import('@repo/common/components').then(mod => ({ default: mod.ChatInput })),
    {
        ssr: false,
        loading: () => <p className="text-muted-foreground text-sm">Loading...</p>,
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
