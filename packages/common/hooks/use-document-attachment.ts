'use client';

import { useChatStore } from '@repo/common/store';
import { DOCUMENT_UPLOAD_CONFIG } from '@repo/shared/constants/document-upload';
import { useToast } from '@repo/ui';
import { ChangeEvent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export const useDocumentAttachment = () => {
    const documentAttachment = useChatStore(state => state.documentAttachment);
    const setDocumentAttachment = useChatStore(state => state.setDocumentAttachment);
    const clearDocumentAttachment = useChatStore(state => state.clearDocumentAttachment);
    const { toast } = useToast();

    const handleFileRead = useCallback(
        (file: File) => {
            if (file.size > DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE) {
                toast({
                    title: 'File too large',
                    description: 'File size must be less than 10MB',
                    variant: 'destructive',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    setDocumentAttachment({
                        base64: result,
                        file,
                        mimeType: file.type,
                        fileName: file.name,
                    });
                }
            };

            reader.onerror = () => {
                toast({
                    title: 'Error',
                    description: 'Failed to read file',
                    variant: 'destructive',
                });
            };

            reader.readAsDataURL(file);
        },
        [setDocumentAttachment, toast]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                handleFileRead(file);
            }
        },
        [handleFileRead]
    );

    const dropzoneProps = useDropzone({
        accept: DOCUMENT_UPLOAD_CONFIG.ACCEPTED_TYPES,
        multiple: false,
        onDrop,
        noClick: true,
        noKeyboard: true,
    });

    const handleDocumentUpload = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileRead(file);
            }
        },
        [handleFileRead]
    );

    const clearAttachment = () => {
        clearDocumentAttachment();
    };

    return {
        documentAttachment,
        setDocumentAttachment,
        clearAttachment,
        handleDocumentUpload,
        dropzoneProps,
        supportedTypes: Object.keys(DOCUMENT_UPLOAD_CONFIG.ACCEPTED_TYPES),
        maxFileSize: DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE,
    };
};
