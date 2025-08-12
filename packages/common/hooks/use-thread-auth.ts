'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { monitorAuth } from '@repo/shared/utils/performance-monitor';
import { useEffect, useRef } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useChatStore } from '../store/chat.store';

/**
 * Hook to manage thread database switching based on user authentication
 * Ensures threads and API keys are isolated per user account
 */
export const useThreadAuth = () => {
    const { data: session } = useSession();
    const switchUserDatabase = useChatStore((state) => state.switchUserDatabase);
    const switchUserStorage = useApiKeysStore((state) => state.switchUserStorage);
    const forceRehydrate = useApiKeysStore((state) => state.forceRehydrate);
    const previousUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        const currentUserId = session?.user?.id || null;
        const previousUserId = previousUserIdRef.current;

        // Only switch database if user actually changed
        if (currentUserId !== previousUserId) {
            log.info(
                {
                    previousUserId: previousUserId || 'anonymous',
                    currentUserId: currentUserId || 'anonymous',
                },
                '[ThreadAuth] User changed',
            );

            // Monitor the database switching performance
            monitorAuth
                .sessionCheck(async () => {
                    // Switch to the appropriate user database for threads
                    await switchUserDatabase(currentUserId);
                    log.info(
                        { userId: currentUserId || 'anonymous' },
                        '[ThreadAuth] Successfully switched to database for user',
                    );
                })
                .catch((error) => {
                    log.error({ error }, '[ThreadAuth] Failed to switch user database');
                });

            // Switch to the appropriate user storage for API keys
            switchUserStorage(currentUserId);

            // Force rehydration to ensure the store has the latest data
            setTimeout(() => {
                forceRehydrate();
            }, 100);

            // Update the ref to track the current user
            previousUserIdRef.current = currentUserId;
        }
    }, [session?.user?.id, switchUserDatabase, switchUserStorage, forceRehydrate]);

    return {
        currentUserId: session?.user?.id || null,
        isAuthenticated: !!session?.user,
    };
};
