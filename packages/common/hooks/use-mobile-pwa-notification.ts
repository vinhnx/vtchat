'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../../apps/web/hooks/use-mobile';

const STORAGE_KEY = 'vt-mobile-pwa-notification-seen';

export function useMobilePWANotification() {
    const isMobile = useIsMobile();
    const [hasSeenNotification, setHasSeenNotification] = useState(true); // Default to true to prevent SSR flash
    const [shouldShow, setShouldShow] = useState(false);
    const toastShown = useRef(false);

    // Check if user has seen the notification
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const seen = localStorage.getItem(STORAGE_KEY);
        setHasSeenNotification(seen === 'true');
    }, []);

    // Mark notification as seen
    const markAsSeen = useCallback(() => {
        if (typeof window === 'undefined') return;

        localStorage.setItem(STORAGE_KEY, 'true');
        setHasSeenNotification(true);
    }, []);

    // Show toast with close button
    const showToast = useCallback(() => {
        if (toastShown.current) return;

        toastShown.current = true;

        toast('Install VT on your mobile device', {
            description: 'Tap share button then tap "Add to Home Screen" for a better experience',
            duration: 8000, // 8 seconds
            action: {
                label: 'Got it',
                onClick: () => {
                    markAsSeen();
                },
            },
            onDismiss: () => {
                markAsSeen();
            },
            onAutoClose: () => {
                markAsSeen();
            },
        });

        // Mark as seen immediately after showing to prevent duplicate toasts
        markAsSeen();
    }, [markAsSeen]);

    // Determine if we should show the notification
    useEffect(() => {
        if (isMobile && !hasSeenNotification && !toastShown.current) {
            setShouldShow(true);
        }
    }, [isMobile, hasSeenNotification]);

    // Show toast when ready
    useEffect(() => {
        if (shouldShow && !toastShown.current) {
            // Use setTimeout to avoid React state update during render
            const timer = setTimeout(() => {
                showToast();
            }, 2000); // Show after 2 seconds delay to let the app load

            return () => clearTimeout(timer);
        }
    }, [shouldShow, showToast]);

    return {
        shouldShow,
        showToast,
        markAsSeen,
        hasSeenNotification,
    };
}
