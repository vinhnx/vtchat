"use client";

import { useSession } from "@repo/shared/lib/auth-client";
import { motion } from "framer-motion";
import NextDynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

// SSR-safe animation properties hook
function useAnimationProperties() {
    const [animProps, setAnimProps] = useState({
        reducedMotion: false,
        isMobile: false,
    });

    useEffect(() => {
        setAnimProps({
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            isMobile: window.innerWidth < 768,
        });
    }, []);

    return animProps;
}

export default function HomePage() {
    const { data: session, isPending } = useSession();
    const { reducedMotion, isMobile } = useAnimationProperties();

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
            <motion.main
                id="main-content"
                className="flex-1 overflow-hidden transform-gpu will-change-transform"
                initial={{
                    opacity: 0,
                    y: reducedMotion ? 0 : isMobile ? 10 : 20,
                }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: reducedMotion ? 0 : isMobile ? 0.2 : 0.3,
                }}
            >
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <ThreadWithSuspense />
                    </div>
                </div>
            </motion.main>
            <motion.div
                className="pb-safe-area-inset-bottom flex-shrink-0 transform-gpu will-change-transform"
                initial={{
                    opacity: 0,
                    y: reducedMotion ? 0 : isMobile ? 10 : 20,
                }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: reducedMotion ? 0 : isMobile ? 0.2 : 0.3,
                    delay: isMobile ? 0.1 : 0.2,
                }}
            >
                <ChatInputWithSuspense showGreeting={true} />
            </motion.div>

            {/* Footer pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <motion.div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 mobile-footer-spacing md:pb-4 transform-gpu will-change-transform"
                    initial={{
                        opacity: 0,
                        y: reducedMotion ? 0 : isMobile ? 10 : 20,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: reducedMotion ? 0 : isMobile ? 0.2 : 0.3,
                        delay: isMobile ? 0.2 : 0.4,
                    }}
                >
                    <div className="pointer-events-auto">
                        <FooterWithSuspense />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
