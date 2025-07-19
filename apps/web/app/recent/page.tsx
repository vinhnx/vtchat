"use client";
import { LoginRequiredDialog, useLoginRequired } from "@repo/common/components";
import { useChatStore } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
import { getFormatDistanceToNow } from "@repo/shared/utils";
import {
    Button,
    Command,
    CommandInput,
    CommandList,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    TypographyH3,
    TypographyMuted,
    TypographyP,
} from "@repo/ui";
import { CommandItem } from "cmdk";
import { Clock, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Create a wrapper component for Trash2 to match expected icon prop type
const TrashIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <Trash2 className={className} size={size} />;

export default function ThreadsPage() {
    const threads = useChatStore((state) => state.threads);
    const updateThread = useChatStore((state) => state.updateThread);
    const deleteThread = useChatStore((state) => state.deleteThread);
    const switchThread = useChatStore((state) => state.switchThread);
    const { push } = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    const handleEditClick = (threadId: string, threadTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(threadId);
        setTitle(threadTitle);
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleInputBlur = () => {
        if (editingId) {
            updateThread({
                id: editingId,
                title: title?.trim() || "Untitled",
            });
            setEditingId(null);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && editingId) {
            updateThread({
                id: editingId,
                title: title?.trim() || "Untitled",
            });
            setEditingId(null);
        }
    };

    const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isSignedIn) {
            requireLogin();
            return;
        }

        deleteThread(threadId);
    };

    const handleThreadClick = (threadId: string) => {
        push(`/chat/${threadId}`);
        switchThread(threadId);
    };

    return (
        <div className="flex w-full flex-col gap-2">
            <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-2 px-4 pt-16 md:px-0">
                <TypographyH3 className="font-clash text-brand tracking-wide">
                    Chat History
                </TypographyH3>
                <Command className="!max-h-auto bg-secondary w-full">
                    <CommandInput
                        className="bg-tertiary h-8 w-full rounded-sm"
                        placeholder="Search"
                    />

                    <CommandList className="bg-secondary mt-2 !max-h-none gap-2">
                        {threads?.length > 0 ? (
                            threads.map((thread) => (
                                <CommandItem className="mb-2" key={thread.id}>
                                    <div
                                        className="bg-tertiary hover:bg-quaternary group relative flex w-full cursor-pointer flex-col items-start rounded-md p-4 transition-all duration-200"
                                        onClick={() => handleThreadClick(thread.id)}
                                    >
                                        <div className="flex w-full justify-between">
                                            <div className="flex flex-col items-start gap-1">
                                                {editingId === thread.id ? (
                                                    <input
                                                        className="bg-quaternary rounded px-2 py-1 text-sm"
                                                        onBlur={handleInputBlur}
                                                        onChange={handleInputChange}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={handleInputKeyDown}
                                                        ref={inputRef}
                                                        value={title}
                                                    />
                                                ) : (
                                                    <TypographyP className="!mt-0 line-clamp-2 w-full text-sm font-medium">
                                                        {thread.title}
                                                    </TypographyP>
                                                )}
                                                <TypographyMuted className="!mt-0 flex flex-row items-center gap-1 opacity-50">
                                                    <Clock size={12} strokeWidth={2} />
                                                    {getFormatDistanceToNow(
                                                        new Date(thread.createdAt),
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                </TypographyMuted>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        className="shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                        size="icon-xs"
                                                        variant="ghost"
                                                    >
                                                        <MoreHorizontal
                                                            className="text-muted-foreground/50"
                                                            size={14}
                                                            strokeWidth="2"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" side="right">
                                                    <DropdownMenuItem
                                                        onClick={(e: any) =>
                                                            handleEditClick(
                                                                thread.id,
                                                                thread.title,
                                                                e,
                                                            )
                                                        }
                                                    >
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e: any) =>
                                                            handleDeleteThread(thread.id, e)
                                                        }
                                                    >
                                                        Delete Thread
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))
                        ) : (
                            <div className="border-hard mt-2 flex w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed p-4">
                                <div className="flex flex-col items-center gap-0">
                                    <TypographyMuted className="!mt-0">
                                        No threads found
                                    </TypographyMuted>
                                    <TypographyMuted className="!mt-1 text-xs opacity-70">
                                        Start a new conversation to create a thread
                                    </TypographyMuted>
                                </div>
                                <Button onClick={() => push("/")} size="sm" variant="default">
                                    <Plus size={14} strokeWidth={2} />
                                    New Thread
                                </Button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </div>

            <LoginRequiredDialog
                description="Please sign in to delete chat threads."
                icon={TrashIcon}
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title="Login Required"
            />
        </div>
    );
}
