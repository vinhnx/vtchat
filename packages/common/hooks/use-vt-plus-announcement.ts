"use client";

import { useSession } from "@repo/shared/lib/auth-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const VT_PLUS_ANNOUNCEMENT_KEY = "vt-plus-gemini-rag-announcement-seen";

export function useVTPlusAnnouncement() {
    const { data: session } = useSession();
    const [shouldShow, setShouldShow] = useState(false);
    const toastShown = useRef(false);

    // Mark announcement as seen
    const markAsSeen = useCallback(() => {
        localStorage.setItem(VT_PLUS_ANNOUNCEMENT_KEY, "true");
    }, []);

    // Show toast with close button
    const showToast = useCallback(() => {
        if (toastShown.current) return;

        toastShown.current = true;

        toast("VT+ now includes Gemini models & RAG!", {
            description:
                "VT+ subscriber will now have unlimited access to Gemini Models (Gemini 2.5 Pro, Gemini 2.5 Flash) and Personal AI Assistant. Enjoy!",
            duration: 8000, // 8 seconds
            onDismiss: markAsSeen,
            onAutoClose: markAsSeen,
            closeButton: true,
        });

        // Mark as seen immediately after showing to prevent duplicate toasts
        markAsSeen();
        setShouldShow(false);
    }, [markAsSeen]);

    useEffect(() => {
        // Show when user is authenticated and hasn't seen the announcement
        const hasSeenAnnouncement = localStorage.getItem(VT_PLUS_ANNOUNCEMENT_KEY);

        if (session?.user && !hasSeenAnnouncement && !toastShown.current) {
            setShouldShow(true);
        }
    }, [session]);

    useEffect(() => {
        if (shouldShow && !toastShown.current) {
            // Use setTimeout to avoid React state update during render
            const timeoutId = setTimeout(() => {
                showToast();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [shouldShow, showToast]);

    return null;
}
