'use client';

import type { Attachment } from '@repo/shared/types';
import { Button, cn, Dialog, DialogContent, DialogDescription, DialogTitle } from '@repo/ui';
import { FileImage, FileText, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

interface MultiModalAttachmentsDisplayProps {
    attachments: Attachment[];
    onRemove: (index: number) => void;
    className?: string;
}

export const MultiModalAttachmentsDisplay = memo(
    ({ attachments, onRemove, className }: MultiModalAttachmentsDisplayProps) => {
        if (!attachments || attachments.length === 0) return null;

        const [previewIndex, setPreviewIndex] = useState<number | null>(null);
        const open = useMemo(() => previewIndex !== null, [previewIndex]);
        const current = previewIndex !== null ? attachments[previewIndex] : undefined;

        const getAttachmentVisual = (attachment: Attachment) => {
            if (attachment.contentType.startsWith('image/') && attachment.url) {
                return (
                    <button
                        type='button'
                        className='focus-visible:ring-ring rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                        onClick={() => setPreviewIndex(attachments.indexOf(attachment))}
                        aria-label='Preview image'
                        title='Tap to preview'
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt={attachment.name || 'image'}
                            className='h-6 w-6 rounded-sm border border-black/10 object-cover dark:border-white/10'
                            src={attachment.url}
                        />
                    </button>
                );
            }
            if (attachment.contentType === 'application/pdf') {
                return <FileText className='h-4 w-4 text-red-500' />;
            }
            if (attachment.contentType.startsWith('image/')) {
                return <FileImage className='h-4 w-4 text-blue-500' />;
            }
            return <FileText className='h-4 w-4 text-gray-500' />;
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
        };

        return (
            <>
                <div className={cn('flex flex-wrap gap-2 p-2', className)}>
                    {attachments.map((attachment, index) => (
                        <div
                            className='flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800'
                            key={index}
                        >
                            {getAttachmentVisual(attachment)}
                            <div className='min-w-0 flex-1'>
                                <p
                                    className='max-w-[120px] truncate font-medium'
                                    title={attachment.name}
                                >
                                    {attachment.name}
                                </p>
                                {attachment.size && (
                                    <p className='text-xs text-gray-500'>
                                        {formatFileSize(attachment.size)}
                                    </p>
                                )}
                            </div>
                            <Button
                                className='h-auto p-0.5 text-gray-500 hover:text-red-500'
                                onClick={() => onRemove(index)}
                                size='sm'
                                type='button'
                                variant='ghost'
                            >
                                <X className='h-3 w-3' />
                            </Button>
                        </div>
                    ))}
                </div>
            <AttachmentPreviewModal
                open={open}
                onClose={() => setPreviewIndex(null)}
                attachments={attachments}
                index={previewIndex ?? 0}
                setIndex={(i) => {
                    if (i < 0) i = 0;
                    if (i > attachments.length - 1) i = attachments.length - 1;
                    setPreviewIndex(i);
                }}
            />
            </>
        );
    },
);

MultiModalAttachmentsDisplay.displayName = 'MultiModalAttachmentsDisplay';

function formatSize(bytes?: number) {
    if (!bytes && bytes !== 0) return 'Unknown';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function AttachmentPreviewModal({
    open,
    onClose,
    attachments,
    index,
    setIndex,
}: {
    open: boolean;
    onClose: () => void;
    attachments: Attachment[];
    index: number;
    setIndex: (i: number) => void;
}) {
    const attachment = attachments[index];
    if (!attachment) return null;
    const isImage = attachment.contentType.startsWith('image/');
    const canPrev = index > 0;
    const canNext = index < attachments.length - 1;
    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
            <DialogContent className='max-w-[95vw]'>
                <div className='flex items-center justify-between gap-2'>
                    <DialogTitle className='truncate'>{attachment.name || 'Attachment'}</DialogTitle>
                    <div className='text-muted-foreground text-xs'>
                        {index + 1}/{attachments.length}
                    </div>
                </div>
                <DialogDescription>
                    Type: {attachment.contentType || 'Unknown'} • Size: {formatSize(attachment.size)}
                </DialogDescription>
                <div className='mt-2 flex max-h-[75vh] w-full items-center justify-center'>
                    {isImage && attachment.url
                        ? (
                            <div className='relative flex w-full items-center justify-center'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt={attachment.name || 'image'}
                                    className='max-h-[70vh] w-auto max-w-full rounded-md object-contain'
                                    src={attachment.url}
                                />
                                <div className='absolute inset-y-0 left-0 flex items-center'>
                                    <button
                                        type='button'
                                        disabled={!canPrev}
                                        onClick={() => canPrev && setIndex(index - 1)}
                                        className='bg-background/70 text-foreground/80 hover:text-foreground disabled:opacity-40 ml-2 rounded-md px-2 py-1 text-xs'
                                    >
                                        Prev
                                    </button>
                                </div>
                                <div className='absolute inset-y-0 right-0 flex items-center'>
                                    <button
                                        type='button'
                                        disabled={!canNext}
                                        onClick={() => canNext && setIndex(index + 1)}
                                        className='bg-background/70 text-foreground/80 hover:text-foreground disabled:opacity-40 mr-2 rounded-md px-2 py-1 text-xs'
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )
                        : <div className='text-muted-foreground text-sm'>No preview available</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
