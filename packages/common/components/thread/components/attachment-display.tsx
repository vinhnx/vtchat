'use client';

import { cn } from '@repo/ui';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';

interface Attachment {
    url: string;
    name: string;
    contentType: string;
    size?: number;
}

interface AttachmentDisplayProps {
    attachments: Attachment[];
    className?: string;
}

export const AttachmentDisplay = memo(({ attachments, className }: AttachmentDisplayProps) => {
    if (!attachments || attachments.length === 0) return null;

    const renderAttachment = (attachment: Attachment, index: number) => {
        const isImage = attachment.contentType.startsWith('image/');
        const isPDF = attachment.contentType === 'application/pdf';

        if (isImage) {
            return (
                <div className='group relative' key={index}>
                    <Image
                        alt={attachment.name}
                        className='rounded-lg border border-gray-200 object-cover shadow-sm dark:border-gray-700'
                        height={200}
                        src={attachment.url}
                        style={{ maxHeight: '200px', width: 'auto' }}
                        width={300}
                    />
                    <div className='absolute bottom-0 left-0 right-0 rounded-b-lg bg-black bg-opacity-60 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                        {attachment.name}
                    </div>
                </div>
            );
        }

        if (isPDF) {
            return (
                <div
                    className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'
                    key={index}
                >
                    <div className='flex items-center space-x-3'>
                        <FileText className='h-8 w-8 text-red-500' />
                        <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                {attachment.name}
                            </p>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>PDF Document</p>
                        </div>
                    </div>

                    {/* PDF Preview using iframe */}
                    <div className='mt-3'>
                        <iframe
                            className='h-96 w-full rounded border border-gray-300 dark:border-gray-600'
                            src={attachment.url}
                            title={attachment.name}
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className={cn('space-y-3', className)}>
            {attachments.map((attachment, index) => renderAttachment(attachment, index))}
        </div>
    );
});

AttachmentDisplay.displayName = 'AttachmentDisplay';
