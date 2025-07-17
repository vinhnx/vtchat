import { Suspense, lazy } from "react";
import { InlineLoader } from "@repo/common/components";

// Lazy load heavy components for better performance
export const LazyThread = lazy(() =>
    import("@repo/common/components").then((mod) => ({
        default: mod.Thread,
    }))
);

export const LazyChatInput = lazy(() =>
    import("@repo/common/components").then((mod) => ({
        default: mod.ChatInput,
    }))
);

export const LazyFooter = lazy(() =>
    import("@repo/common/components").then((mod) => ({
        default: mod.Footer,
    }))
);

// Wrapper components with suspense boundaries
export function ThreadWithSuspense() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center">
                    <InlineLoader />
                </div>
            }
        >
            <LazyThread />
        </Suspense>
    );
}

export function ChatInputWithSuspense({ showGreeting = false }: { showGreeting?: boolean }) {
    return (
        <Suspense
            fallback={
                <div className="flex h-16 items-center justify-center">
                    <InlineLoader />
                </div>
            }
        >
            <LazyChatInput showGreeting={showGreeting} />
        </Suspense>
    );
}

export function FooterWithSuspense() {
    return (
        <Suspense
            fallback={
                <div className="h-16 bg-muted animate-pulse rounded" />
            }
        >
            <LazyFooter />
        </Suspense>
    );
}

