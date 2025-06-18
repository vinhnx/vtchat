import { DocumentAttachment, ThreadItem } from '@repo/shared/types';

export const buildCoreMessagesFromThreadItems = ({
    messages,
    query,
    imageAttachment,
    documentAttachment,
}: {
    messages: ThreadItem[];
    query: string;
    imageAttachment?: string;
    documentAttachment?: DocumentAttachment;
}) => {
    const threadMessages = (messages || []).flatMap(item => {
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

    const currentMessage = {
        role: 'user' as const,
        content: currentContent.length === 1 ? query || '' : currentContent,
    };

    return [...threadMessages, currentMessage];
};
