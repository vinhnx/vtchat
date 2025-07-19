"use client";

import { log } from "@repo/shared/logger";
import { useCallback, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard() {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const [showCopied, setShowCopied] = useState<boolean>(false);

    const copy: CopyFn = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            log.warn("Clipboard not supported");
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
            log.warn("Copy failed", { data: error });
            setCopiedText(null);
            return false;
        }
    }, []);

    return { copiedText, copy, showCopied };
}
