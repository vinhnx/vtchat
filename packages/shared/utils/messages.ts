import type { Attachment, DocumentAttachment, ThreadItem } from '@repo/shared/types';

type MessageContent =
    | { type: 'text'; text: string; }
    // Use image part for images
    | { type: 'image'; image: string; }
    // Use file part for documents (e.g., PDFs) with proper data URI and media type
    | { type: 'file'; data: string; mediaType: string; };

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
        const content: MessageContent[] = [{ type: 'text', text: item.query || '' }];

        if (item.imageAttachment) {
            content.push({ type: 'image', image: item.imageAttachment });
        }

        if (item.documentAttachment) {
            // For document attachments (e.g., PDF), include as file part with mediaType
            content.push({
                type: 'file',

                file: {
                    file: {
                        file: {
                            data: item.documentAttachment.base64,
                            mediaType: item.documentAttachment.mimeType
                        }
                    }
                }
            });
        }

        // Add multi-modal attachments
        if (item.attachments) {
            item.attachments.forEach((attachment) => {
                if (attachment.contentType.startsWith('image/')) {
                    content.push({ type: 'image', image: attachment.url });
                } else if (attachment.contentType === 'application/pdf') {
                    // For PDF attachments, include as file part with mediaType
                    content.push({
                        type: 'file',

                        file: {
                            file: {
                                file: {
                                    data: attachment.url,
                                    mediaType: attachment.contentType
                                }
                            }
                        }
                    });
                }
            });
        }

        return [
            {
                role: 'user' as const,
                content: content.length === 1 ? item.query || '' : content,
            },
            {
                role: 'assistant' as const,
                content: item.answer?.text || '',
            },
        ];
    });

    // Add current query with attachments
    const currentContent: MessageContent[] = [{ type: 'text', text: query || '' }];

    if (imageAttachment) {
        currentContent.push({ type: 'image', image: imageAttachment });
    }

    if (documentAttachment) {
        // For document attachments (e.g., PDF), include as file part with mediaType
        currentContent.push({
            type: 'file',

            file: {
                file: {
                    file: {
                        data: documentAttachment.base64,
                        mediaType: documentAttachment.mimeType
                    }
                }
            }
        });
    }

    // Add current multi-modal attachments
    if (attachments) {
        attachments.forEach((attachment) => {
            if (attachment.contentType.startsWith('image/')) {
                currentContent.push({ type: 'image', image: attachment.url });
            } else if (attachment.contentType === 'application/pdf') {
                // For PDF attachments, include as file part with mediaType
                currentContent.push({
                    type: 'file',

                    file: {
                        file: {
                            file: {
                                data: attachment.url,
                                mediaType: attachment.contentType
                            }
                        }
                    }
                });
            }
        });
    }

    const currentMessage = {
        role: 'user' as const,
        content: currentContent.length === 1 ? query || '' : currentContent,
    };

    return [...threadMessages, currentMessage];
};
