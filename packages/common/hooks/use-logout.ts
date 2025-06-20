'use client';

import { signOut } from '@repo/shared/lib/auth-client';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useChatStore } from '../store/chat.store';
import { useAppStore } from '../store/app.store';

/**
 * Custom hook for logout functionality that ensures all gated features
 * and user data are properly cleared when the user logs out.
 *
 * Security Note: This clears API keys, subscription cache, and user-specific
 * data to prevent access leakage on shared devices.
 */
export const useLogout = () => {
    const { setTheme } = useTheme();
    const clearAllKeys = useApiKeysStore(state => state.clearAllKeys);
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const resetUserState = useAppStore(state => state.resetUserState);

    const logout = useCallback(async () => {
        try {
            console.log('[Logout] Starting secure logout process...');

            // 1. First reset theme to light mode (VT+ Dark Theme feature)
            setTheme('light');
            console.log('[Logout] ✅ Reset theme to light mode');

            // 2. Clear all API keys (BYOK security requirement)
            clearAllKeys();
            console.log('[Logout] ✅ Cleared all API keys');

            // 3. Clear all threads (user-specific conversation data)
            await clearAllThreads();
            console.log('[Logout] ✅ Cleared all threads from local storage');

            // 4. Reset app store user state
            resetUserState();
            console.log('[Logout] ✅ Reset app store user state');

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
                    'vtchat-preferences', // App store preferences
                ];
                userDataKeys.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        console.log(`[Logout] ✅ Cleared ${key}`);
                    }
                });

                // Clear next-themes storage (dark mode is a VT+ feature)
                localStorage.removeItem('theme');
                console.log('[Logout] ✅ Cleared theme storage');

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
                    console.log(`[Logout] ✅ Cleared ${premiumKeys.length} additional premium cache entries`);
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
                    console.log('[Logout] ✅ Invalidated server-side subscription cache');
                } else {
                    console.warn('[Logout] ⚠️ Server cache invalidation returned:', cacheResponse.status);
                }
            } catch (cacheError) {
                console.warn('[Logout] ⚠️ Failed to invalidate server cache (non-critical):', cacheError);
                // Non-critical, continue with logout
            }

            // 7. Finally perform the authentication logout
            await signOut();
            console.log('[Logout] ✅ Completed authentication sign out');
            console.log('[Logout] 🔒 Secure logout completed successfully');
        } catch (error) {
            console.error('[Logout] ❌ Error during logout:', error);

            // Even if logout fails, ensure security-critical data is cleared
            try {
                setTheme('light');
                clearAllKeys();
                await clearAllThreads();
                resetUserState();
                console.log('[Logout] ✅ Emergency cleanup completed');
            } catch (cleanupError) {
                console.error('[Logout] ❌ Emergency cleanup failed:', cleanupError);
            }
        }
    }, [setTheme, clearAllKeys, clearAllThreads, resetUserState]);

    return { logout };
};
