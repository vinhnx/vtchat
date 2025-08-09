import type { Attachment, DocumentAttachment, ThreadItem } from "@repo/shared/types";

type MessageContent =
    | { type: "text"; text: string }
    // Use image part for both images and documents (e.g., PDFs) per AI SDK schema
    // When sending documents, include mimeType (e.g., 'application/pdf')
    | { type: "image"; image: string; mimeType?: string };

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
            // For document attachments (e.g., PDF), include as image part with mimeType
            content.push({
                type: "image",
                image: item.documentAttachment.base64,
                mimeType: item.documentAttachment.mimeType,
            });
        }

        // Add multi-modal attachments
        if (item.attachments) {
            item.attachments.forEach((attachment) => {
                if (attachment.contentType.startsWith("image/")) {
                    content.push({ type: "image", image: attachment.url });
                } else if (attachment.contentType === "application/pdf") {
                    // For PDF attachments, include as image part with mimeType
                    content.push({
                        type: "image",
                        image: attachment.url,
                        mimeType: attachment.contentType,
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
        // For document attachments (e.g., PDF), include as image part with mimeType
        currentContent.push({
            type: "image",
            image: documentAttachment.base64,
            mimeType: documentAttachment.mimeType,
        });
    }

    // Add current multi-modal attachments
    if (attachments) {
        attachments.forEach((attachment) => {
            if (attachment.contentType.startsWith("image/")) {
                currentContent.push({ type: "image", image: attachment.url });
            } else if (attachment.contentType === "application/pdf") {
                // For PDF attachments, include as image part with mimeType
                currentContent.push({
                    type: "image",
                    image: attachment.url,
                    mimeType: attachment.contentType,
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
