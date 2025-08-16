'use client';

import { log } from '@repo/shared/lib/logger';
import { useCallback, useState } from 'react';

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

type UseContextualFeedbackOptions = {
    successDuration?: number;
    errorDuration?: number;
    onSuccess?: () => void;
    onError?: (error?: any) => void;
};

/**
 * Hook for providing contextual feedback for user actions
 * Replaces toast notifications with inline status indicators
 */
export function useContextualFeedback({
    successDuration = 2000,
    errorDuration = 3000,
    onSuccess,
    onError,
}: UseContextualFeedbackOptions = {}) {
    const [status, setStatus] = useState<ActionStatus>('idle');
    const [message, setMessage] = useState<string>('');

    const executeAction = useCallback(
        async (action: () => Promise<any>, options?: {
            loadingMessage?: string;
            successMessage?: string;
            errorMessage?: string;
        }) => {
            const {
                loadingMessage = 'Processing...',
                successMessage = 'Done',
                errorMessage = 'Failed',
            } = options || {};

            try {
                setStatus('loading');
                setMessage(loadingMessage);

                const result = await action();

                setStatus('success');
                setMessage(successMessage);
                onSuccess?.();

                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, successDuration);

                return result;
            } catch (error) {
                log.error('Action failed:', { error });
                
                setStatus('error');
                setMessage(typeof error === 'string' ? error : errorMessage);
                onError?.(error);

                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, errorDuration);

                throw error;
            }
        },
        [successDuration, errorDuration, onSuccess, onError]
    );

    const reset = useCallback(() => {
        setStatus('idle');
        setMessage('');
    }, []);

    return {
        status,
        message,
        executeAction,
        reset,
        setStatus,
        setMessage,
    };
}

/**
 * Enhanced copy text hook with contextual feedback
 */
export function useContextualCopy() {
    const [textStatus, setTextStatus] = useState<ActionStatus>('idle');
    const [markdownStatus, setMarkdownStatus] = useState<ActionStatus>('idle');

    const copyText = useCallback(async (text: string) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        try {
            setTextStatus('loading');

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Copy command failed');
                }
            }

            setTextStatus('success');
            setTimeout(() => setTextStatus('idle'), 2000);
            return true;
        } catch (error) {
            log.error('Copy text failed:', { error });
            setTextStatus('error');
            setTimeout(() => setTextStatus('idle'), 3000);
            return false;
        }
    }, []);

    const copyElement = useCallback(async (element: HTMLElement) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        try {
            setTextStatus('loading');

            const range = document.createRange();
            const selection = window.getSelection();

            if (!selection) {
                throw new Error('No selection object available');
            }

            selection.removeAllRanges();
            range.selectNodeContents(element);
            selection.addRange(range);

            document.execCommand('copy');
            selection.removeAllRanges();

            setTextStatus('success');
            setTimeout(() => setTextStatus('idle'), 2000);
            return true;
        } catch (error) {
            log.error('Copy element failed:', { error });
            setTextStatus('error');
            setTimeout(() => setTextStatus('idle'), 3000);
            return false;
        }
    }, []);

    const copyMarkdown = useCallback(async (text: string) => {
        if (!text || typeof window === 'undefined' || typeof document === 'undefined') {
            return false;
        }

        try {
            setMarkdownStatus('loading');

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Copy command failed');
                }
            }

            setMarkdownStatus('success');
            setTimeout(() => setMarkdownStatus('idle'), 2000);
            return true;
        } catch (error) {
            log.error('Copy markdown failed:', { error });
            setMarkdownStatus('error');
            setTimeout(() => setMarkdownStatus('idle'), 3000);
            return false;
        }
    }, []);

    return {
        textStatus,
        markdownStatus,
        copyText,
        copyElement,
        copyMarkdown,
    };
}

/**
 * Hook for form field validation with contextual feedback
 */
export function useFieldValidation() {
    const [validationStatus, setValidationStatus] = useState<Record<string, {
        status: 'idle' | 'validating' | 'valid' | 'invalid';
        message?: string;
    }>>({});

    const validateField = useCallback(async (
        fieldName: string,
        validator: () => Promise<{ valid: boolean; message?: string }>
    ) => {
        setValidationStatus(prev => ({
            ...prev,
            [fieldName]: { status: 'validating' }
        }));

        try {
            const result = await validator();
            setValidationStatus(prev => ({
                ...prev,
                [fieldName]: {
                    status: result.valid ? 'valid' : 'invalid',
                    message: result.message
                }
            }));
            return result;
        } catch (error) {
            setValidationStatus(prev => ({
                ...prev,
                [fieldName]: {
                    status: 'invalid',
                    message: 'Validation failed'
                }
            }));
            throw error;
        }
    }, []);

    const resetField = useCallback((fieldName: string) => {
        setValidationStatus(prev => ({
            ...prev,
            [fieldName]: { status: 'idle' }
        }));
    }, []);

    const getFieldStatus = useCallback((fieldName: string) => {
        return validationStatus[fieldName] || { status: 'idle' as const };
    }, [validationStatus]);

    return {
        validateField,
        resetField,
        getFieldStatus,
        validationStatus,
    };
}