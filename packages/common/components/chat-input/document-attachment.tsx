'use client';

import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import { FileText, X } from 'lucide-react';

export const DocumentAttachment = () => {
    const attachment = useChatStore((state) => state.documentAttachment);
    const clearAttachment = useChatStore((state) => state.clearDocumentAttachment);

    if (!attachment?.base64) return null;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
    };

    return (
        <div className='bg-muted flex items-center gap-2 rounded-lg border p-2'>
            <FileText className='text-muted-foreground' size={16} />
            <div className='min-w-0 flex-1'>
                <p className='truncate text-xs font-medium'>{attachment.fileName}</p>
                <p className='text-muted-foreground text-xs'>
                    {attachment.file ? formatFileSize(attachment.file.size) : 'Document'}
                </p>
            </div>
            <Button className='h-6 w-6' onClick={clearAttachment} size='icon-xs' variant='ghost'>
                <X size={12} />
            </Button>
        </div>
    );
};
