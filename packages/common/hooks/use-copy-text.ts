import { useCallback, useState } from 'react';
import { logger } from '@repo/shared/logger';

type CopyStatus = 'idle' | 'copied' | 'error';

export const useCopyText = () => {
    const [status, setStatus] = useState<CopyStatus>('idle');
    const [markdownCopyStatus, setMarkdownCopyStatus] = useState<CopyStatus>('idle');

    const copyToClipboard = useCallback(async (element: HTMLElement) => {
        try {
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

            setStatus('copied');
            setTimeout(() => setStatus('idle'), 2000);

            return true;
        } catch (err) {
            logger.error('Copy to clipboard failed:', { data: err });
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return false;
        }
    }, []);

    const copyMarkdown = useCallback(async (text?: string) => {
        if (!text) return;

        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                setMarkdownCopyStatus('copied');
                setTimeout(() => setMarkdownCopyStatus('idle'), 2000);
                return;
            }
            
            // Fallback to legacy method
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
            
            if (successful) {
                setMarkdownCopyStatus('copied');
                setTimeout(() => setMarkdownCopyStatus('idle'), 2000);
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            logger.error('Copy markdown failed:', { data: err });
            setMarkdownCopyStatus('error');
            setTimeout(() => setMarkdownCopyStatus('idle'), 3000);
        }
    }, []);

    return {
        status,
        copyToClipboard,
        copyMarkdown,
        markdownCopyStatus,
    };
};
