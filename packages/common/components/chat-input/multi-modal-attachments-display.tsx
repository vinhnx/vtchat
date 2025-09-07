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
            <DialogContent className='max-w-none max-h-none w-screen h-screen p-0 bg-black/95 border-none'>
                {/* Hidden title and description for accessibility */}
                <DialogTitle className='sr-only'>
                    {attachment.name || 'Attachment'}
                </DialogTitle>
                <DialogDescription className='sr-only'>
                    {attachment.contentType || 'Unknown'} attachment
                </DialogDescription>

                {/* Full screen image container */}
                <div className='relative w-full h-full flex items-center justify-center group'>
                    {/* Hover overlay gradients for better UI visibility */}
                    <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
                        {/* Bottom gradient for info overlay */}
                        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent' />
                        {/* Left gradient for prev button */}
                        {canPrev && (
                            <div className='absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/30 to-transparent' />
                        )}
                        {/* Right gradient for next button */}
                        {canNext && (
                            <div className='absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/30 to-transparent' />
                        )}
                    </div>

                    {isImage && attachment.url
                        ? (
                            <div className='relative w-full h-full flex items-center justify-center'>
                                {/* Centered fullscreen image */}
                                <img
                                    alt={attachment.name || 'image'}
                                    className='max-w-full max-h-full object-contain'
                                    src={attachment.url}
                                />

                                {/* Navigation buttons - enhanced with better backdrop */}
                                {canPrev && (
                                    <button
                                        type='button'
                                        onClick={() => setIndex(index - 1)}
                                        className='absolute left-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg border border-white/20'
                                    >
                                        <svg
                                            className='w-6 h-6'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M15 19l-7-7 7-7'
                                            />
                                        </svg>
                                    </button>
                                )}

                                {canNext && (
                                    <button
                                        type='button'
                                        onClick={() => setIndex(index + 1)}
                                        className='absolute right-6 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg border border-white/20'
                                    >
                                        <svg
                                            className='w-6 h-6'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </button>
                                )}

                                {/* Bottom overlay with info - enhanced gradient */}
                                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm'>
                                    <div className='text-white text-center max-w-4xl mx-auto'>
                                        <h3 className='text-xl font-semibold mb-3 drop-shadow-lg leading-relaxed'>
                                            {attachment.name || 'Generated Image'}
                                        </h3>
                                        <div className='text-sm text-white/90 flex items-center justify-center gap-4 drop-shadow-md'>
                                            <span className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                                                {attachment.contentType || 'Image'}
                                            </span>
                                            {attachments.length > 1 && (
                                                <span className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full'>
                                                    {index + 1} of {attachments.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        : <div className='text-muted-foreground text-sm'>No preview available</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}
