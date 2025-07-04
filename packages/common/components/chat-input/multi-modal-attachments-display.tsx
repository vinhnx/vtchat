import type { Attachment } from '@repo/shared/types';
import { Button, cn } from '@repo/ui';
import { FileImage, FileText, X } from 'lucide-react';
import { memo } from 'react';

interface MultiModalAttachmentsDisplayProps {
    attachments: Attachment[];
    onRemove: (index: number) => void;
    className?: string;
}

export const MultiModalAttachmentsDisplay = memo(
    ({ attachments, onRemove, className }: MultiModalAttachmentsDisplayProps) => {
        if (!attachments || attachments.length === 0) return null;

        const getFileIcon = (contentType: string) => {
            if (contentType.startsWith('image/')) {
                return <FileImage className="h-4 w-4 text-blue-500" />;
            }
            if (contentType === 'application/pdf') {
                return <FileText className="h-4 w-4 text-red-500" />;
            }
            return <FileText className="h-4 w-4 text-gray-500" />;
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Number.parseFloat((bytes / k ** i).toFixed(1)) + ' ' + sizes[i];
        };

        return (
            <div className={cn('flex flex-wrap gap-2 p-2', className)}>
                {attachments.map((attachment, index) => (
                    <div
                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                        key={index}
                    >
                        {getFileIcon(attachment.contentType)}
                        <div className="min-w-0 flex-1">
                            <p
                                className="max-w-[120px] truncate font-medium"
                                title={attachment.name}
                            >
                                {attachment.name}
                            </p>
                            {attachment.size && (
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.size)}
                                </p>
                            )}
                        </div>
                        <Button
                            className="h-auto p-0.5 text-gray-500 hover:text-red-500"
                            onClick={() => onRemove(index)}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
        );
    }
);

MultiModalAttachmentsDisplay.displayName = 'MultiModalAttachmentsDisplay';
