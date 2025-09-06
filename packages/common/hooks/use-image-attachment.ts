'use client';

import { useChatStore } from '@repo/common/store';
import { resizeImageDataUrl } from '@repo/shared/utils';
import { useToast } from '@repo/ui';
import { type ChangeEvent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// const resizeFile = (file: File) =>
//   new Promise((resolve) => {
//     Resizer.imageFileResizer(
//       file,
//       1000,
//       1000,
//       "JPEG",
//       100,
//       0,
//       (uri) => {
//         resolve(uri);
//       },
//       "file",
//     );
//   });

export type TRenderImageUpload = {
    showIcon?: boolean;
    label?: string;
    tooltip?: string;
};

export const useImageAttachment = () => {
    const _imageAttachment = useChatStore((state) => state.imageAttachment);
    const setImageAttachment = useChatStore((state) => state.setImageAttachment);
    const clearImageAttachment = useChatStore((state) => state.clearImageAttachment);

    const { toast } = useToast();

    const clearAttachment = () => {
        clearImageAttachment();
    };

    const readImageFile = useCallback(async (file?: File) => {
        const reader = new FileReader();

        const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (file && !fileTypes.includes(file?.type)) {
            toast({
                title: 'Invalid format',
                description: 'Please select a valid image (JPEG, PNG, GIF).',
                variant: 'destructive',
            });
            return;
        }

        const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
        if (file && file.size > MAX_FILE_SIZE) {
            toast({
                title: 'File too large',
                description: 'Image size should be less than 3MB.',
                variant: 'destructive',
            });
            return;
        }

        reader.onload = async () => {
            if (typeof reader.result !== 'string') return;
            const originalDataUrl = reader.result;
            const resizedDataUrl = await resizeImageDataUrl(
                originalDataUrl,
                file?.type || 'image/png',
                768,
            );
            setImageAttachment({
                base64: resizedDataUrl,
            });
        };

        if (file) {
            setImageAttachment({
                file,
            });
            reader.readAsDataURL(file);
        }
    }, [setImageAttachment, toast]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles?.[0];
            readImageFile(file);
        },
        [readImageFile],
    );
    const dropzonProps = useDropzone({ onDrop, multiple: false, noClick: true });

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        readImageFile(file);
    };

    return {
        dropzonProps,
        handleImageUpload,
        clearAttachment,
    };
};
