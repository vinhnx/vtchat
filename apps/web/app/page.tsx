"use client";

// This page needs dynamic rendering due to real-time chat functionality
export const dynamic = "force-dynamic";

import { useSession } from "@repo/shared/lib/auth-client";
import {
    ChatInputWithSuspense,
    FooterWithSuspense,
    ThreadWithSuspense,
} from "../components/lazy-components";

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
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 pb-20 md:pb-4">
                    <div className="pointer-events-auto">
                        <FooterWithSuspense />
                    </div>
                </div>
            )}
        </div>
    );
}
