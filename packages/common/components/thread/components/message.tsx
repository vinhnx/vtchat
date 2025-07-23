"use client";

import { ChatEditor, markdownStyles } from "@repo/common/components";
import { useAgentStream, useChatEditor, useCopyText } from "@repo/common/hooks";
import { useChatStore } from "@repo/common/store";
import type { ThreadItem } from "@repo/shared/types";
import { Button, cn, useToast } from "@repo/ui";
import { Check, Copy, Pencil } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AttachmentDisplay } from "./attachment-display";
import { DocumentDisplay } from "./document-display";
import { ImageMessage } from "./image-message";

type MessageProps = {
    message: string;
    imageAttachment?: string;
    threadItem: ThreadItem;
};

export const Message = memo(({ message, imageAttachment, threadItem }: MessageProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const { copyToClipboard, status } = useCopyText();
    const maxHeight = 120;
    const isGenerating = useChatStore((state) => state.isGenerating);
    useEffect(() => {
        if (messageRef.current) {
            setShowExpandButton(messageRef.current.scrollHeight > maxHeight);
        }
    }, [message]);

    const handleCopy = useCallback(() => {
        if (messageRef.current) {
            copyToClipboard(messageRef.current);
        }
    }, [copyToClipboard]);

    const toggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);

    return (
        <div className="flex w-full flex-col items-end gap-2 pt-4">
            {imageAttachment && <ImageMessage imageAttachment={imageAttachment} />}
            {threadItem.documentAttachment && (
                <DocumentDisplay documentAttachment={threadItem.documentAttachment} />
            )}
            {threadItem.attachments && threadItem.attachments.length > 0 && (
                <AttachmentDisplay attachments={threadItem.attachments} />
            )}
            <div
                className={cn(
                    "bg-tertiary text-foreground group relative max-w-[90%] overflow-hidden rounded-lg sm:max-w-[80%]",
                    isEditing && "border-hard",
                )}
            >
                {!isEditing && (
                    <>
                        <div
                            className={cn(
                                "prose-base markdown-text relative px-4 py-2.5 font-normal",
                                {
                                    "pb-14": isExpanded,
                                    markdownStyles,
                                },
                            )}
                            ref={messageRef}
                            id="message-content"
                            style={{
                                maxHeight: isExpanded ? "none" : maxHeight,
                                transition: "max-height 0.3s ease-in-out",
                            }}
                            tabIndex={0}
                            aria-label="Message content"
                        >
                            {message}
                        </div>
                        <div
                            className={cn(
                                "absolute bottom-0 left-0 right-0 hidden flex-col items-center group-hover:flex",
                                showExpandButton && "flex",
                            )}
                        >
                            <div className="via-tertiary/85 to-tertiary flex w-full items-center justify-end gap-1 bg-gradient-to-b from-transparent p-1.5">
                                {showExpandButton && (
                                    <Button
                                        className="pointer-events-auto relative z-10 px-4"
                                        onClick={toggleExpand}
                                        rounded="full"
                                        size="xs"
                                        variant="secondary"
                                        aria-expanded={isExpanded}
                                        aria-controls="message-content"
                                    >
                                        {isExpanded ? "Show less" : "Show more"}
                                    </Button>
                                )}
                                <Button
                                    onClick={handleCopy}
                                    size="icon-sm"
                                    tooltip={status === "copied" ? "Copied" : "Copy"}
                                    variant="bordered"
                                >
                                    {status === "copied" ? (
                                        <Check size={14} strokeWidth={2} />
                                    ) : (
                                        <Copy size={14} strokeWidth={2} />
                                    )}
                                </Button>
                                <Button
                                    disabled={
                                        isGenerating ||
                                        threadItem.status === "QUEUED" ||
                                        threadItem.status === "PENDING"
                                    }
                                    onClick={() => setIsEditing(true)}
                                    size="icon-sm"
                                    tooltip="Edit"
                                    variant="bordered"
                                >
                                    <Pencil size={14} strokeWidth={2} />
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {isEditing && (
                    <EditMessage
                        message={message}
                        onCancel={() => {
                            setIsEditing(false);
                        }}
                        threadItem={threadItem}
                        width={messageRef.current?.offsetWidth}
                    />
                )}
            </div>
        </div>
    );
});

export type TEditMessage = {
    message: string;
    onCancel: () => void;
    threadItem: ThreadItem;
    width?: number;
};

export const EditMessage = memo(({ message, onCancel, threadItem, width }: TEditMessage) => {
    const { handleSubmit } = useAgentStream();
    const removeFollowupThreadItems = useChatStore((state) => state.removeFollowupThreadItems);
    const getThreadItems = useChatStore((state) => state.getThreadItems);

    const { editor } = useChatEditor({
        defaultContent: message,
    });

    const { toast } = useToast();

    const handleSave = async (query: string) => {
        if (!query.trim()) {
            toast({
                title: "Please enter a message",
                variant: "destructive",
            });
            return;
        }
        removeFollowupThreadItems(threadItem.id);

        const formData = new FormData();
        formData.append("query", query);
        formData.append("imageAttachment", threadItem.imageAttachment || "");
        const threadItems = await getThreadItems(threadItem.threadId);

        handleSubmit({
            formData,
            existingThreadItemId: threadItem.id,
            messages: threadItems,
            newChatMode: threadItem.mode,
            useWebSearch: false, //
        });
    };

    return (
        <div className="relative flex max-w-full flex-col items-end gap-2">
            <div
                className={cn(" relative px-3 py-0 text-base font-normal", {})}
                style={{
                    minWidth: width,
                    transition: "max-height 0.3s ease-in-out",
                }}
            >
                <ChatEditor
                    className={cn("prose-base max-w-full overflow-y-scroll !p-0", markdownStyles)}
                    editor={editor}
                    maxHeight="100px"
                    sendMessage={() => {
                        handleSave(editor?.getText() || "");
                    }}
                />
            </div>
            <div className={cn("flex-col items-center group-hover:flex")}>
                <div className=" flex w-full items-center justify-end gap-1 bg-gradient-to-b from-transparent p-1.5">
                    <Button
                        onClick={() => {
                            handleSave(editor?.getText() || "");
                        }}
                        size="xs"
                        tooltip={status === "copied" ? "Copied" : "Copy"}
                    >
                        Save
                    </Button>
                    <Button onClick={onCancel} size="xs" tooltip="Edit" variant="bordered">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
});

Message.displayName = "Message";
