'use client';

import { signOut } from '@repo/shared/lib/auth-client';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

/**
 * Custom hook for logout functionality that ensures light mode is activated
 * when the user logs out.
 */
export const useLogout = () => {
    const { setTheme } = useTheme();

    const logout = useCallback(async () => {
        try {
            // First reset theme to light mode
            setTheme('light');

            // Then perform the logout
            await signOut();
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if signOut fails, we still want to reset theme
            setTheme('light');
        }
    }, [setTheme]);

    return { logout };
};
