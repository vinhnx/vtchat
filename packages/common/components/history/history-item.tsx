"use client";

import { LoginRequiredDialog, useLoginRequired } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
import type { Thread } from "@repo/shared/types";
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export const HistoryItem = ({
    thread,
    dismiss: _dismiss,
    isActive,
    isPinned,
    pinThread,
    unpinThread,
}: {
    thread: Thread;
    dismiss: () => void;
    isActive?: boolean;
    isPinned?: boolean;
    pinThread: (threadId: string) => void;
    unpinThread: (threadId: string) => void;
}) => {
    const { push } = useRouter();
    const { threadId: currentThreadId } = useParams();
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    const deleteThread = useChatStore((state) => state.deleteThread);
    const switchThread = useChatStore((state) => state.switchThread);
    const [openOptions, setOpenOptions] = useState(false);

    const containerClasses = cn(
        "group relative flex w-full flex-row items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-accent/70",
        // Removed border for borderless look
        isActive ? "bg-accent shadow-sm" : "",
        isPinned && "border-l-2 border-l-amber-400 dark:border-l-amber-500",
    );

    const handleDeleteConfirm = () => {
        if (!isSignedIn) {
            requireLogin();
            return;
        }

        deleteThread(thread.id);
        if (currentThreadId === thread.id) {
            push("/");
        }
    };

    return (
        <div className={containerClasses} key={thread.id}>
            <Link
                className="flex min-w-0 flex-1 items-center"
                href={`/chat/${thread.id}`}
                onClick={() => switchThread(thread.id)}
            >
                <div className="flex-1 overflow-hidden">
                    <p
                        className={cn(
                            "w-full truncate text-sm font-medium leading-relaxed transition-colors",
                            isActive
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {thread.title}
                    </p>
                </div>
            </Link>
            <DropdownMenu onOpenChange={setOpenOptions} open={openOptions}>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={cn(
                            "shrink-0 transition-all duration-200",
                            "opacity-0 group-hover:opacity-100",
                            "border-border/30 bg-background/80 hover:bg-accent absolute right-2 border",
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenOptions(!openOptions);
                        }} // fixed from icon-xs
                        size="icon-sm"
                        variant="ghost"
                    >
                        <MoreHorizontal
                            className="text-muted-foreground hover:text-foreground"
                            size={14}
                            strokeWidth="2"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConfirm();
                        }}
                    >
                        Delete Chat
                    </DropdownMenuItem>
                    {isPinned ? (
                        <DropdownMenuItem onClick={() => unpinThread(thread.id)}>
                            Unpin
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => pinThread(thread.id)}>
                            Pin
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <LoginRequiredDialog
                description="Please sign in to delete chat threads."
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title="Login Required"
            />
        </div>
    );
};
