import type { Attachment, DocumentAttachment, ThreadItem } from '@repo/shared/types';

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
        const content: any[] = [{ type: 'text', text: item.query || '' }];

        if (item.imageAttachment) {
            content.push({ type: 'image', image: item.imageAttachment });
        }

        if (item.documentAttachment) {
            // Convert base64 to buffer for file type
            const base64Data = item.documentAttachment.base64.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            content.push({
                type: 'file',
                data: buffer,
                mimeType: item.documentAttachment.mimeType,
            });
        }

        // Add multi-modal attachments
        if (item.attachments) {
            item.attachments.forEach((attachment) => {
                if (attachment.contentType.startsWith('image/')) {
                    content.push({ type: 'image', image: attachment.url });
                } else if (attachment.contentType === 'application/pdf') {
                    // Convert data URL to buffer for PDF
                    const base64Data = attachment.url.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    content.push({
                        type: 'file',
                        data: buffer,
                        mimeType: attachment.contentType,
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
    const currentContent: any[] = [{ type: 'text', text: query || '' }];

    if (imageAttachment) {
        currentContent.push({ type: 'image', image: imageAttachment });
    }

    if (documentAttachment) {
        // Convert base64 to buffer for file type
        const base64Data = documentAttachment.base64.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        currentContent.push({
            type: 'file',
            data: buffer,
            mimeType: documentAttachment.mimeType,
        });
    }

    // Add current multi-modal attachments
    if (attachments) {
        attachments.forEach((attachment) => {
            if (attachment.contentType.startsWith('image/')) {
                currentContent.push({ type: 'image', image: attachment.url });
            } else if (attachment.contentType === 'application/pdf') {
                // Convert data URL to buffer for PDF
                const base64Data = attachment.url.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                currentContent.push({
                    type: 'file',
                    data: buffer,
                    mimeType: attachment.contentType,
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
