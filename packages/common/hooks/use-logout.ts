'use client';

import { signOut } from '@repo/shared/lib/auth-client';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useChatStore } from '../store/chat.store';
import { useAppStore } from '../store/app.store';
import { logger } from '@repo/shared/logger';

/**
 * Custom hook for logout functionality that ensures all gated features
 * and user data are properly cleared when the user logs out.
 *
 * Security Note: This clears API keys, subscription cache, and user-specific
 * data to prevent access leakage on shared devices.
 */
export const useLogout = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { setTheme } = useTheme();
    const clearAllKeys = useApiKeysStore(state => state.clearAllKeys);
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const resetUserState = useAppStore(state => state.resetUserState);

    const logout = useCallback(async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            logger.info('[Logout] Starting secure logout process...');

            // 1. First reset theme to light mode (VT+ Dark Theme feature)
            // Force theme change multiple times to ensure it takes effect
            setTheme('light');
            setTimeout(() => setTheme('light'), 100); // Additional safety
            logger.info('[Logout] ✅ Reset theme to light mode');

            // 2. Clear all API keys (BYOK security requirement)
            clearAllKeys();
            logger.info('[Logout] ✅ Cleared all API keys');

            // 3. Clear all threads (user-specific conversation data)
            await clearAllThreads();
            logger.info('[Logout] ✅ Cleared all threads from local storage');

            // 4. Reset app store user state
            resetUserState();
            logger.info('[Logout] ✅ Reset app store user state');

            // 5. Clear subscription-related localStorage cache
            if (typeof window !== 'undefined') {
                // Clear subscription status cache
                const subscriptionKeys = Object.keys(localStorage).filter(
                    key =>
                        key.startsWith('subscription_status_') ||
                        key.startsWith('creem_') ||
                        key.startsWith('vt_plus_')
                );
                subscriptionKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                console.log(
                    `[Logout] ✅ Cleared ${subscriptionKeys.length} subscription cache entries`
                );

                // Clear user-specific preferences that might contain gated feature data
                const userDataKeys = [
                    'user-preferences',
                    'subscription-preferences',
                    'feature-access-cache',
                    'vtchat-settings', // App store preferences
                    'vtchat-preferences', // Legacy user preferences
                    'chat-config', // Chat store configuration
                    'draft-message', // Draft message storage
                    'linking_provider', // User profile linking provider
                    'hasSeenIntro', // Intro dialog state
                ];
                userDataKeys.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        console.log(`[Logout] ✅ Cleared ${key}`);
                    }
                });

                // Clear user-specific dynamic keys (like chat-config-{userId})
                const dynamicKeys = Object.keys(localStorage).filter(
                    key =>
                        key.startsWith('chat-config-') ||
                        key.startsWith('api-keys-') ||
                        key.startsWith('mcp-tools-') ||
                        key.includes('user-') ||
                        key.includes('profile-')
                );
                dynamicKeys.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`[Logout] ✅ Cleared dynamic key: ${key}`);
                });

                // Clear next-themes storage (dark mode is a VT+ feature)
                localStorage.removeItem('theme');

                // More aggressive theme cleanup
                const allThemeKeys = Object.keys(localStorage).filter(
                    key =>
                        key.includes('theme') ||
                        key.includes('next-themes') ||
                        key.includes('dark') ||
                        key.includes('mode')
                );
                allThemeKeys.forEach(key => localStorage.removeItem(key));
                console.log(`[Logout] ✅ Cleared theme storage (${allThemeKeys.length + 1} keys)`);

                // Clear any remaining VT+ or premium feature caches
                const premiumKeys = Object.keys(localStorage).filter(
                    key =>
                        key.includes('premium') ||
                        key.includes('plus') ||
                        key.includes('dark') ||
                        key.includes('theme') ||
                        key.includes('vt+') ||
                        key.includes('vtplus')
                );
                premiumKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                if (premiumKeys.length > 0) {
                    console.log(
                        `[Logout] ✅ Cleared ${premiumKeys.length} additional premium cache entries`
                    );
                }
            }

            // 6. Invalidate server-side subscription cache (before sign out)
            try {
                const cacheResponse = await fetch('/api/subscription/invalidate-cache', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });

                if (cacheResponse.ok) {
                    logger.info('[Logout] ✅ Invalidated server-side subscription cache');
                } else {
                    console.warn(
                        '[Logout] ⚠️ Server cache invalidation returned:',
                        cacheResponse.status
                    );
                }
            } catch (cacheError) {
                console.warn(
                    '[Logout] ⚠️ Failed to invalidate server cache (non-critical):',
                    cacheError
                );
                // Non-critical, continue with logout
            }

            // 7. Clear session storage as well for extra security
            if (typeof window !== 'undefined') {
                try {
                    sessionStorage.clear();
                    logger.info('[Logout] ✅ Cleared session storage');
                } catch (sessionError) {
                    logger.warn('[Logout] ⚠️ Failed to clear session storage:', { data: sessionError });
                }

                // Clear any auth-related cookies client-side
                try {
                    document.cookie.split(';').forEach(function (c) {
                        document.cookie = c
                            .replace(/^ +/, '')
                            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                    });
                    logger.info('[Logout] ✅ Cleared cookies');
                } catch (cookieError) {
                    logger.warn('[Logout] ⚠️ Failed to clear cookies:', { data: cookieError });
                }
            }

            // 8. Finally perform the authentication logout
            await signOut();
            logger.info('[Logout] ✅ Completed authentication sign out');

            // 9. Refresh the page to ensure all state is reset
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
            logger.info('[Logout] 🔒 Secure logout completed successfully');
        } catch (error) {
            logger.error('[Logout] ❌ Error during logout:', { data: error });

            // Even if logout fails, ensure security-critical data is cleared
            try {
                // Multiple theme resets for emergency cleanup
                setTheme('light');
                setTimeout(() => setTheme('light'), 50);
                setTimeout(() => setTheme('light'), 200);

                // Clear theme storage in emergency cleanup
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('theme');
                    Object.keys(localStorage)
                        .filter(key => key.includes('theme') || key.includes('dark'))
                        .forEach(key => localStorage.removeItem(key));
                }

                clearAllKeys();
                await clearAllThreads();
                resetUserState();
                logger.info('[Logout] ✅ Emergency cleanup completed');
            } catch (cleanupError) {
                logger.error('[Logout] ❌ Emergency cleanup failed:', { data: cleanupError });
            }
        } finally {
            setIsLoggingOut(false);
        }
    }, [setTheme, clearAllKeys, clearAllThreads, resetUserState, isLoggingOut]);

    return { logout, isLoggingOut };
};
