'use client';

import { useChatStore } from '@repo/common/store';
import { supportsMultiModal } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import type { Attachment } from '@repo/shared/types';
import { resizeImageDataUrl } from '@repo/shared/utils';
import { Button, Tooltip, useToast } from '@repo/ui';
import { Image } from 'lucide-react';
import { type FC, useCallback, useRef, useState } from 'react';
// Login prompt removed for pre-login attachment support

// Icon wrapper removed (no longer used)

interface MultiModalAttachmentButtonProps {
    onAttachmentsChange: (attachments: Attachment[]) => void;
    attachments: Attachment[];
    disabled?: boolean;
}

export const MultiModalAttachmentButton: FC<MultiModalAttachmentButtonProps> = ({
    onAttachmentsChange,
    attachments,
    disabled = false,
}) => {
    const chatMode = useChatStore((state) => state.chatMode);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasAttachments = attachments.length > 0;

    const { toast } = useToast();

    const handleFileUpload = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            const maxFiles = 5;
            if (attachments.length + files.length > maxFiles) {
                toast({ title: `Maximum ${maxFiles} files allowed`, variant: 'destructive' });
                return;
            }

            setUploading(true);

            const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
            const MAX_DIM = 768;

            try {
                const results: Attachment[] = [];
                for (const f of files) {
                    if (!fileTypes.includes(f.type)) {
                        toast({
                            title: 'Invalid format',
                            description: 'Please select a valid image (JPEG, PNG, GIF).',
                            variant: 'destructive',
                        });
                        continue;
                    }
                    if (f.size > MAX_FILE_SIZE) {
                        toast({
                            title: 'File too large',
                            description: 'Image size should be less than 3MB.',
                            variant: 'destructive',
                        });
                        continue;
                    }

                    const reader = new FileReader();
                    const dataUrl: string = await new Promise((res, rej) => {
                        reader.onload = () => {
                            if (typeof reader.result === 'string') res(reader.result);
                            else rej(new Error('Failed to read file'));
                        };
                        reader.onerror = () => rej(new Error('Failed to read file'));
                        reader.readAsDataURL(f);
                    });

                    const resized = await resizeImageDataUrl(dataUrl, f.type, MAX_DIM);
                    results.push({
                        url: resized,
                        name: f.name || 'image',
                        contentType: f.type || 'image/png',
                        size: f.size,
                    });
                }

                if (results.length > 0) {
                    const newAttachments = [...attachments, ...results];
                    onAttachmentsChange(newAttachments);
                    toast({
                        title: `Attached ${results.length} image${results.length > 1 ? 's' : ''}`,
                    });
                }
            } catch (error) {
                log.error({ data: error }, 'Local image attach error');
                toast({
                    title: error instanceof Error ? error.message : 'Attach failed',
                    variant: 'destructive',
                });
            } finally {
                setUploading(false);
            }
        },
        [attachments, onAttachmentsChange, toast],
    );

    const handleFileInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files || []);
            handleFileUpload(files);
            // Reset input to allow same file to be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [handleFileUpload],
    );

    const handleFileSelect = () => {
        if (disabled || uploading) return;

        fileInputRef.current?.click();
    };

    // Only show for models that support multi-modal
    if (!supportsMultiModal(chatMode)) {
        return null;
    }

    const getTooltipContent = () => {
        if (uploading) return 'Uploading...';
        if (hasAttachments) {
            const count = attachments.length;
            const fileNames = attachments.map((a) => a.name).join(', ');
            return `${count} file${count > 1 ? 's' : ''} attached: ${fileNames}`;
        }
        return 'Attach images';
    };

    const attachmentButton = (
        <>
            <input
                accept='image/*'
                className='hidden'
                disabled={disabled || uploading}
                multiple
                onChange={handleFileInputChange}
                ref={fileInputRef}
                type='file'
            />
            <Tooltip content={getTooltipContent()}>
                <Button
                    className={hasAttachments
                        ? 'border-blue-300 bg-blue-100 hover:bg-blue-200'
                        : ''}
                    disabled={disabled || uploading}
                    onClick={handleFileSelect}
                    size='icon-sm'
                    variant={hasAttachments ? 'default' : 'ghost'}
                >
                    <Image size={16} strokeWidth={2} />
                </Button>
            </Tooltip>

            {/* Login gating removed: selection allowed pre-login (auth enforced on send) */}
        </>
    );

    return attachmentButton;
};
