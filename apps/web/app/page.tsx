'use client';

import {
    ChatFooter,
    InlineLoader,
    PersonalizedGreeting,
    Thread,
    UserTierBadge,
} from '@repo/common/components';
import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useSession } from '@repo/shared/lib/auth-client';
import { motion } from 'framer-motion';
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
    const isPlusTier = useVtPlusAccess();

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
                <div
                    className="mx-auto flex w-full max-w-3xl flex-col items-start justify-start px-2
                    md:px-0"
                >
                    <motion.div
                        animate={{ opacity: 1 }}
                        className="mb-2 flex w-full flex-col items-center gap-2"
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {!isPlusTier && <UserTierBadge showUpgradePrompt={true} />}
                        <PersonalizedGreeting session={session} />
                    </motion.div>
                </div>
                <ChatInput showGreeting={false} />
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
            {/* {process.env.NODE_ENV === 'development' && <SemanticRouterDebug />} */}
        </div>
    );
}
