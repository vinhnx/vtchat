"use client";

import { useSession } from "@repo/shared/lib/auth-client";
import NextDynamic from "next/dynamic";

// This page needs dynamic rendering due to real-time chat functionality
export const dynamic = "force-dynamic";

// Dynamically import components that use agent hooks with no SSR
const ThreadWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.ThreadWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <div className="animate-pulse">Loading chat...</div>
            </div>
        ),
    },
);

const ChatInputWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.ChatInputWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-16 items-center justify-center">
                <div className="animate-pulse">Loading input...</div>
            </div>
        ),
    },
);

const FooterWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.FooterWithSuspense,
        })),
    {
        ssr: false,
        loading: () => <div className="bg-muted h-16 animate-pulse rounded" />,
    },
);

export default function HomePage() {
    const { data: session, isPending } = useSession();

    return (
        <div className="relative flex h-dvh w-full flex-col">
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
                VT - Minimal AI Chat with Deep Research Features
            </h1>
            <main id="main-content" className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <ThreadWithSuspense />
                    </div>
                </div>
            </main>
            <div className="pb-safe-area-inset-bottom flex-shrink-0">
                <ChatInputWithSuspense showGreeting={true} />
            </div>

            {/* Footer pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="homepage-footer pointer-events-none p-2 md:p-4">
                    <div className="pointer-events-auto">
                        <FooterWithSuspense />
                    </div>
                </div>
            )}
        </div>
    );
}
