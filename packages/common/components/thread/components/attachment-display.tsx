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
                <div key={index} className="relative group">
                    <Image
                        src={attachment.url}
                        alt={attachment.name}
                        width={300}
                        height={200}
                        className="rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700"
                        style={{ maxHeight: '200px', width: 'auto' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {attachment.name}
                    </div>
                </div>
            );
        }

        if (isPDF) {
            return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF Document
                            </p>
                        </div>
                    </div>
                    
                    {/* PDF Preview using iframe */}
                    <div className="mt-3">
                        <iframe
                            src={attachment.url}
                            className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded"
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
