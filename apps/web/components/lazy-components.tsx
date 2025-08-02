import { InlineLoader } from "@repo/common/components";
import dynamic from "next/dynamic";
import { lazy, Suspense } from "react";

// Client-only wrapper to prevent SSR issues with agent hooks
const ClientOnlyWrapper = dynamic(
    () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <InlineLoader />
            </div>
        ),
    },
);

// Lazy load heavy components for better performance with error boundaries
export const LazyThread = lazy(() =>
    import("@repo/common/components")
        .then((mod) => ({
            default: mod.Thread,
        }))
        .catch((error) => ({
            default: () => (
                <div className="text-destructive">
                    Failed to load Thread component: {error.message}
                </div>
            ),
        })),
);

export const LazyChatInput = lazy(() =>
    import("@repo/common/components")
        .then((mod) => ({
            default: mod.ChatInput,
        }))
        .catch(() => ({
            default: () => (
                <div className="text-destructive">Failed to load ChatInput component</div>
            ),
        })),
);

export const LazyFooter = lazy(() =>
    import("@repo/common/components")
        .then((mod) => ({
            default: mod.Footer,
        }))
        .catch(() => ({
            default: () => <div className="text-destructive">Failed to load Footer component</div>,
        })),
);

// Wrapper components with suspense boundaries
export function ThreadWithSuspense() {
    return (
        <ClientOnlyWrapper>
            <Suspense
                fallback={
                    <div className="flex h-full items-center justify-center">
                        <InlineLoader />
                    </div>
                }
            >
                <LazyThread />
            </Suspense>
        </ClientOnlyWrapper>
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
        <Suspense fallback={<div className="bg-muted h-16 animate-pulse rounded" />}>
            <LazyFooter />
        </Suspense>
    );
}
