'use client';

import { signOut } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';

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
    const clearAllKeys = useApiKeysStore((state) => state.clearAllKeys);
    const clearAllThreads = useChatStore((state) => state.clearAllThreads);
    const resetUserState = useAppStore((state) => state.resetUserState);

    const logout = useCallback(async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            log.info('[Logout] Starting secure logout process...');

            // 1. First reset theme to light mode (VT+ Dark Theme feature)
            // Force theme change multiple times to ensure it takes effect
            setTheme('light');
            setTimeout(() => setTheme('light'), 100); // Additional safety
            log.info('[Logout] ✅ Reset theme to light mode');

            // 2. Clear all API keys (BYOK security requirement)
            clearAllKeys();
            log.info('[Logout] ✅ Cleared all API keys');

            // 3. Clear all threads (user-specific conversation data)
            await clearAllThreads();
            log.info('[Logout] ✅ Cleared all threads from local storage');

            // 4. Reset app store user state
            resetUserState();
            log.info('[Logout] ✅ Reset app store user state');

            // 5. Clear subscription-related localStorage cache
            if (typeof window !== 'undefined') {
                // Clear subscription status cache
                const subscriptionKeys = Object.keys(localStorage).filter(
                    (key) =>
                        key.startsWith('subscription_status_') ||
                        key.startsWith('creem_') ||
                        key.startsWith('vt_plus_')
                );
                subscriptionKeys.forEach((key) => {
                    localStorage.removeItem(key);
                });
                log.info(
                    { subscriptionKeysCleared: subscriptionKeys.length },
                    '[Logout] ✅ Cleared subscription cache entries'
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
                userDataKeys.forEach((key) => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        log.info({ key }, '[Logout] ✅ Cleared subscription cache key');
                    }
                });

                // Clear user-specific dynamic keys (like chat-config-{userId})
                const dynamicKeys = Object.keys(localStorage).filter(
                    (key) =>
                        key.startsWith('chat-config-') ||
                        key.startsWith('api-keys-') ||
                        key.startsWith('mcp-tools-') ||
                        key.includes('user-') ||
                        key.includes('profile-')
                );
                dynamicKeys.forEach((key) => {
                    localStorage.removeItem(key);
                    log.info({ key }, '[Logout] ✅ Cleared dynamic key');
                });

                // Clear next-themes storage (dark mode is a VT+ feature)
                localStorage.removeItem('theme');

                // More aggressive theme cleanup
                const allThemeKeys = Object.keys(localStorage).filter(
                    (key) =>
                        key.includes('theme') ||
                        key.includes('next-themes') ||
                        key.includes('dark') ||
                        key.includes('mode')
                );
                allThemeKeys.forEach((key) => localStorage.removeItem(key));
                log.info(
                    { themeKeysCleared: allThemeKeys.length + 1 },
                    '[Logout] ✅ Cleared theme storage'
                );

                // Clear any remaining VT+ or premium feature caches
                const premiumKeys = Object.keys(localStorage).filter(
                    (key) =>
                        key.includes('premium') ||
                        key.includes('plus') ||
                        key.includes('dark') ||
                        key.includes('theme') ||
                        key.includes('vt+') ||
                        key.includes('vtplus')
                );
                premiumKeys.forEach((key) => {
                    localStorage.removeItem(key);
                });
                if (premiumKeys.length > 0) {
                    log.info(
                        { premiumKeysCleared: premiumKeys.length },
                        '[Logout] ✅ Cleared additional premium cache entries'
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
                    log.info('[Logout] ✅ Invalidated server-side subscription cache');
                } else {
                    log.warn(
                        { status: cacheResponse.status },
                        '[Logout] ⚠️ Server cache invalidation returned error'
                    );
                }
            } catch (cacheError) {
                log.warn(
                    { error: cacheError },
                    '[Logout] ⚠️ Failed to invalidate server cache (non-critical)'
                );
                // Non-critical, continue with logout
            }

            // 7. Clear session storage as well for extra security
            if (typeof window !== 'undefined') {
                try {
                    sessionStorage.clear();
                    log.info('[Logout] ✅ Cleared session storage');
                } catch (sessionError) {
                    log.warn({ error: sessionError }, '[Logout] ⚠️ Failed to clear session storage');
                }

                // Clear any auth-related cookies client-side
                try {
                    document.cookie.split(';').forEach((c) => {
                        document.cookie = c
                            .replace(/^ +/, '')
                            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                    });
                    log.info('[Logout] ✅ Cleared cookies');
                } catch (cookieError) {
                    log.warn({ error: cookieError }, '[Logout] ⚠️ Failed to clear cookies');
                }
            }

            // 8. Finally perform the authentication logout
            await signOut();
            log.info('[Logout] ✅ Completed authentication sign out');

            // 9. Refresh the page to ensure all state is reset
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
            log.info('[Logout] 🔒 Secure logout completed successfully');
        } catch (error) {
            log.error({ error }, '[Logout] ❌ Error during logout');

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
                        .filter((key) => key.includes('theme') || key.includes('dark'))
                        .forEach((key) => localStorage.removeItem(key));
                }

                clearAllKeys();
                await clearAllThreads();
                resetUserState();
                log.info('[Logout] ✅ Emergency cleanup completed');
            } catch (cleanupError) {
                log.error({ error: cleanupError }, '[Logout] ❌ Emergency cleanup failed');
            }
        } finally {
            setIsLoggingOut(false);
        }
    }, [setTheme, clearAllKeys, clearAllThreads, resetUserState, isLoggingOut]);

    return { logout, isLoggingOut };
};
