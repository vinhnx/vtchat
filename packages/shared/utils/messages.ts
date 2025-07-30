import type { Attachment, DocumentAttachment, ThreadItem } from "@repo/shared/types";

type MessageContent = { type: "text"; text: string } | { type: "image"; image: string };

export const buildCoreMessagesFromThreadItems = ({
    messages,
    query,
    imageAttachment,
    documentAttachment,
    attachments,
}: {
    messages: ThreadItem[];
    query: string;
    imageAttachment?: string;
    documentAttachment?: DocumentAttachment;
    attachments?: Attachment[];
}) => {
    const threadMessages = (messages || []).flatMap((item) => {
        const content: MessageContent[] = [{ type: "text", text: item.query || "" }];

        if (item.imageAttachment) {
            content.push({ type: "image", image: item.imageAttachment });
        }

        if (item.documentAttachment) {
            // For document attachments, include as text content since AI SDK doesn't support file type
            // The document content should be extracted and included as text
            content.push({
                type: "text",
                text: `[Document: ${item.documentAttachment.fileName || "document"} (${item.documentAttachment.mimeType})]`,
            });
        }

        // Add multi-modal attachments
        if (item.attachments) {
            item.attachments.forEach((attachment) => {
                if (attachment.contentType.startsWith("image/")) {
                    content.push({ type: "image", image: attachment.url });
                } else if (attachment.contentType === "application/pdf") {
                    // For PDF attachments, include as text reference since AI SDK doesn't support file type
                    content.push({
                        type: "text",
                        text: `[PDF Document: ${attachment.name}]`,
                    });
                }
            });
        }

        return [
            {
                role: "user" as const,
                content: content.length === 1 ? item.query || "" : content,
            },
            {
                role: "assistant" as const,
                content: item.answer?.text || "",
            },
        ];
    });

    // Add current query with attachments
    const currentContent: MessageContent[] = [{ type: "text", text: query || "" }];

    if (imageAttachment) {
        currentContent.push({ type: "image", image: imageAttachment });
    }

    if (documentAttachment) {
        // For document attachments, include as text reference since AI SDK doesn't support file type
        currentContent.push({
            type: "text",
            text: `[Document: ${documentAttachment.fileName || "document"} (${documentAttachment.mimeType})]`,
        });
    }

    // Add current multi-modal attachments
    if (attachments) {
        attachments.forEach((attachment) => {
            if (attachment.contentType.startsWith("image/")) {
                currentContent.push({ type: "image", image: attachment.url });
            } else if (attachment.contentType === "application/pdf") {
                // For PDF attachments, include as text reference since AI SDK doesn't support file type
                currentContent.push({
                    type: "text",
                    text: `[PDF Document: ${attachment.name}]`,
                });
            }
        });
    }

    const currentMessage = {
        role: "user" as const,
        content: currentContent.length === 1 ? query || "" : currentContent,
    };

    return [...threadMessages, currentMessage];
};
