import { useCallback, useState } from 'react';
import { logger } from '@repo/shared/logger';

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard() {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const [showCopied, setShowCopied] = useState<boolean>(false);

    const copy: CopyFn = useCallback(async text => {
        if (!navigator?.clipboard) {
            logger.warn('Clipboard not supported');
            return false;
        }
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setShowCopied(true);
            setTimeout(() => {
                setShowCopied(false);
            }, 2000);
            return true;
        } catch (error) {
            logger.warn('Copy failed', { data: error });
            setCopiedText(null);
            return false;
        }
    }, []);

    return { copiedText, copy, showCopied };
}
