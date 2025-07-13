"use client";
import { ChatModeOptions } from "@repo/common/components";
import { useAgentStream, useCopyText } from "@repo/common/hooks";
import { useChatStore } from "@repo/common/store";
import { type ChatMode, getChatModeName } from "@repo/shared/config";
import type { ThreadItem } from "@repo/shared/types";
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
} from "@repo/ui";
import { AlertCircle, Check, Copy, FileText, RotateCcw, Trash } from "lucide-react";
import React, { forwardRef, useState } from "react";

type MessageActionsProps = {
    threadItem: ThreadItem;
    isLast: boolean;
};

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
    ({ threadItem, isLast }, ref) => {
        const { handleSubmit } = useAgentStream();
        const removeThreadItem = useChatStore((state) => state.deleteThreadItem);
        const getThreadItems = useChatStore((state) => state.getThreadItems);
        const useWebSearch = useChatStore((state) => state.useWebSearch);
        const [chatMode, setChatMode] = useState<ChatMode>(threadItem.mode);
        const { copyToClipboard, status, copyMarkdown, markdownCopyStatus } = useCopyText();
        const [gatedFeatureAlert, setGatedFeatureAlert] = useState<{
            feature?: string;
            plan?: string;
            title: string;
            message: string;
        } | null>(null);

        const handleGatedFeature = React.useCallback(
            (gateInfo: { feature?: string; plan?: string; title: string; message: string }) => {
                setGatedFeatureAlert(gateInfo);
            },
            [],
        );
        return (
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-1 py-2">
                    {threadItem?.answer?.text && (
                        <Button
                            onClick={() => {
                                if (ref && "current" in ref && ref.current) {
                                    copyToClipboard(ref.current);
                                }
                            }}
                            size="icon-sm"
                            tooltip="Copy"
                            variant="ghost-bordered"
                        >
                            {status === "copied" ? (
                                <Check size={16} strokeWidth={2} />
                            ) : (
                                <Copy size={16} strokeWidth={2} />
                            )}
                        </Button>
                    )}

                    {threadItem?.answer?.text && (
                        <Button
                            onClick={() => {
                                // Get text content from the DOM element (same as regular copy)
                                let textContent = "";
                                if (ref && "current" in ref && ref.current) {
                                    textContent =
                                        ref.current.innerText || ref.current.textContent || "";
                                }

                                // Build references section
                                const referencesSection = threadItem?.sources?.length
                                    ? `\n\n## References\n${threadItem.sources
                                          .map((source) => `[${source.index}] ${source.link}`)
                                          .join("\n")}`
                                    : "";

                                copyMarkdown(`${textContent}${referencesSection}`);
                            }}
                            size="icon-sm"
                            tooltip="Copy Markdown"
                            variant="ghost-bordered"
                        >
                            {markdownCopyStatus === "copied" ? (
                                <Check size={16} strokeWidth={2} />
                            ) : (
                                <FileText size={16} strokeWidth={2} />
                            )}
                        </Button>
                    )}
                    {threadItem.status !== "ERROR" &&
                        threadItem.answer?.status !== "HUMAN_REVIEW" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon-sm"
                                        tooltip="Rewrite"
                                        variant="ghost-bordered"
                                    >
                                        <RotateCcw size={16} strokeWidth={2} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <ChatModeOptions
                                    chatMode={chatMode}
                                    onGatedFeature={handleGatedFeature}
                                    setChatMode={async (mode) => {
                                        setChatMode(mode);
                                        const formData = new FormData();
                                        formData.append("query", threadItem.query || "");
                                        const threadItems = await getThreadItems(
                                            threadItem.threadId,
                                        );
                                        handleSubmit({
                                            formData,
                                            existingThreadItemId: threadItem.id,
                                            newChatMode: mode as any,
                                            messages: threadItems,
                                            useWebSearch,
                                        });
                                    }}
                                />
                            </DropdownMenu>
                        )}

                    {isLast && (
                        <Button
                            onClick={() => {
                                removeThreadItem(threadItem.id);
                            }}
                            size="icon-sm"
                            tooltip="Remove"
                            variant="ghost-bordered"
                        >
                            <Trash size={16} strokeWidth={2} />
                        </Button>
                    )}
                    {threadItem.mode && (
                        <p className="text-muted-foreground px-2 text-xs">
                            Generated with {getChatModeName(threadItem.mode)}
                        </p>
                    )}
                </div>

                {/* Gated Feature Alert */}
                {gatedFeatureAlert && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{gatedFeatureAlert.title}</AlertTitle>
                        <AlertDescription>{gatedFeatureAlert.message}</AlertDescription>
                    </Alert>
                )}
            </div>
        );
    },
);

MessageActions.displayName = "MessageActions";
