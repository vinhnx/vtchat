'use client';

import { ChatFooter, InlineLoader, Thread } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import dynamic from 'next/dynamic';

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

export default function HomePage() {
    const { data: session, isPending } = useSession();

    return (
        <div className="relative flex h-dvh w-full flex-col">
            <div className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <Thread />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <ChatInput showGreeting={true} />
            </div>

            {/* ChatFooter pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                    <div className="pointer-events-auto">
                        <ChatFooter />
                    </div>
                </div>
            )}

            {/* Debug component for development */}
            
        </div>
    );
}
