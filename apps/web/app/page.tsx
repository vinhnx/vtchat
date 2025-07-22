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
            <h1 className="sr-only">VT - Privacy-First AI Chat</h1>
            <main id="main-content" className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <ThreadWithSuspense />
                    </div>
                </div>
            </main>
            <div className="flex-shrink-0">
                <ChatInputWithSuspense showGreeting={true} />
            </div>

            {/* Footer pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                    <div className="pointer-events-auto">
                        <FooterWithSuspense />
                    </div>
                </div>
            )}
        </div>
    );
}
