"use client";

import { useRootContext } from "@repo/common/context";
import { useChatStore } from "@repo/common/store";
import { getFormatDistanceToNow } from "@repo/shared/utils";
import { Button } from "@repo/ui";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const RecentThreads = () => {
    const { setIsCommandSearchOpen } = useRootContext();
    const threads = useChatStore((state) => state.threads.slice(0, 4));
    const router = useRouter();

    useEffect(() => {
        threads.forEach((thread) => {
            router.prefetch(`/chat/${thread.id}`);
        });
    }, [threads, router]);

    if (threads.length === 0) {
        return null;
    }
    return (
        <div className="flex w-full flex-col px-1.5">
            <div className="flex flex-row items-center gap-2 px-1 py-2">
                <p className="text-muted-foreground text-sm font-medium">Recent Messages</p>
                <div className="flex-1" />
                <Button
                    className="text-muted-foreground"
                    onClick={() => setIsCommandSearchOpen(true)}
                    roundedSm="full"
                    size="xs"
                    variant="ghost"
                >
                    View all <ArrowRight size={14} strokeWidth={1.5} />
                </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {threads
                    ?.sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime())
                    .map((thread) => (
                        <button
                            type="button"
                            className="border-border bg-background flex w-full flex-col gap-1 rounded-2xl border p-4 text-sm transition-all duration-200 hover:border-yellow-900/20 hover:bg-yellow-700/5 hover:shadow-sm"
                            key={thread.id}
                            onClick={() => router.push(`/chat/${thread.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    router.push(`/chat/${thread.id}`);
                                }
                            }}
                        >
                            <MessageCircle
                                className="text-muted-foreground/50"
                                size={16}
                                strokeWidth={2}
                            />
                            <div className="min-h-2 flex-1" />
                            <p className="line-clamp-2 text-sm font-medium leading-tight">
                                {thread.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {getFormatDistanceToNow(new Date(thread.createdAt), {
                                    addSuffix: true,
                                })}
                            </p>
                        </button>
                    ))}
            </div>
        </div>
    );
};
