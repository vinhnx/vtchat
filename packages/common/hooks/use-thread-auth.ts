'use client';

import { useSession } from '@repo/shared/lib/auth-client';
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
    const switchUserDatabase = useChatStore(state => state.switchUserDatabase);
    const switchUserStorage = useApiKeysStore(state => state.switchUserStorage);
    const previousUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        const currentUserId = session?.user?.id || null;
        const previousUserId = previousUserIdRef.current;

        // Only switch database if user actually changed
        if (currentUserId !== previousUserId) {
            console.log(
                `[ThreadAuth] User changed from ${previousUserId || 'anonymous'} to ${currentUserId || 'anonymous'}`
            );

            // Monitor the database switching performance
            monitorAuth
                .sessionCheck(async () => {
                    // Switch to the appropriate user database for threads
                    await switchUserDatabase(currentUserId);
                    console.log(
                        `[ThreadAuth] Successfully switched to database for user: ${currentUserId || 'anonymous'}`
                    );
                })
                .catch(error => {
                    console.error('[ThreadAuth] Failed to switch user database:', error);
                });

            // Switch to the appropriate user storage for API keys
            switchUserStorage(currentUserId);

            // Update the ref to track the current user
            previousUserIdRef.current = currentUserId;
        }
    }, [session?.user?.id, switchUserDatabase, switchUserStorage]);

    return {
        currentUserId: session?.user?.id || null,
        isAuthenticated: !!session?.user,
    };
};
