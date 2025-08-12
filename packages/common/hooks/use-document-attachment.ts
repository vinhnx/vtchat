'use client';

import { useChatStore } from '@repo/common/store';
import { DOCUMENT_UPLOAD_CONFIG } from '@repo/shared/constants/document-upload';
import { useToast } from '@repo/ui';
import { type ChangeEvent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export const useDocumentAttachment = () => {
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const setDocumentAttachment = useChatStore((state) => state.setDocumentAttachment);
    const clearDocumentAttachment = useChatStore((state) => state.clearDocumentAttachment);
    const setPdfProcessingStatus = useChatStore((state) => state.setPdfProcessingStatus);
    const { toast } = useToast();

    const validateFile = useCallback((file: File): { valid: boolean; error?: string; } => {
        // Check file size
        if (file.size > DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File is too large. Maximum size is ${
                    DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
                }MB.`,
            };
        }

        // Check file type
        if (!Object.keys(DOCUMENT_UPLOAD_CONFIG.ACCEPTED_TYPES).includes(file.type)) {
            return {
                valid: false,
                error: 'Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or MD files.',
            };
        }

        // Additional PDF-specific validation
        if (file.type === 'application/pdf') {
            // Check if file name has proper extension
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                return {
                    valid: false,
                    error: 'Invalid PDF file. Please ensure the file has a .pdf extension.',
                };
            }
        }

        return { valid: true };
    }, []);

    const handleFileReadWithRetry = useCallback(
        async (file: File, retryCount = 0): Promise<void> => {
            const maxRetries = file.type === 'application/pdf' ? 2 : 0;

            // Validate file first
            const validation = validateFile(file);
            if (!validation.valid) {
                setPdfProcessingStatus({
                    status: 'error',
                    error: validation.error,
                    suggestion: 'Please select a valid document file and try again.',
                });

                toast({
                    title: 'Invalid file',
                    description: validation.error,
                    variant: 'destructive',
                });
                return;
            }

            // Set processing status for PDFs
            if (file.type === 'application/pdf') {
                setPdfProcessingStatus({ status: 'processing' });
            }

            return new Promise((resolve, reject) => {
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

                        // Set success status
                        setPdfProcessingStatus({ status: 'success' });

                        toast({
                            title: 'Document uploaded',
                            description: `${file.name} is ready for analysis.`,
                            variant: 'default',
                        });

                        resolve();
                    } else {
                        reject(new Error('Failed to read file'));
                    }
                };

                reader.onerror = () => {
                    const error = new Error('Failed to read file');

                    // Retry logic for transient failures
                    if (retryCount < maxRetries) {
                        console.log(`Retrying file read (attempt ${retryCount + 1}/${maxRetries})`);
                        setTimeout(() => {
                            handleFileReadWithRetry(file, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        }, 1000 * (retryCount + 1)); // Exponential backoff
                        return;
                    }

                    setPdfProcessingStatus({
                        status: 'error',
                        error: 'Failed to read the file',
                        suggestion:
                            'Please try uploading the file again, or use a different document.',
                    });

                    toast({
                        title: 'Upload failed',
                        description: 'Failed to read the file. Please try again.',
                        variant: 'destructive',
                    });

                    reject(error);
                };

                reader.readAsDataURL(file);
            });
        },
        [setDocumentAttachment, setPdfProcessingStatus, toast, validateFile],
    );

    const handleFileRead = useCallback(
        (file: File) => {
            handleFileReadWithRetry(file).catch((error) => {
                console.error('File upload failed:', error);
            });
        },
        [handleFileReadWithRetry],
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                handleFileRead(file);
            }
        },
        [handleFileRead],
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
        [handleFileRead],
    );

    const clearAttachment = () => {
        clearDocumentAttachment();
        setPdfProcessingStatus({ status: 'idle' });
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
