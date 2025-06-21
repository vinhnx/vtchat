'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@repo/shared/lib/auth-client';
import { useTheme } from 'next-themes';

/**
 * Theme Enforcer Component
 * Ensures unauthorized sessions always use light theme
 * and handles theme cleanup on logout
 */
export function ThemeEnforcer() {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { setTheme, theme } = useTheme();
    const previousSignedInState = useRef<boolean | null>(null);

    useEffect(() => {
        // Initialize previous state on first render
        if (previousSignedInState.current === null) {
            previousSignedInState.current = isSignedIn;
            
            // If user is not signed in on initial load, ensure light theme
            if (!isSignedIn) {
                console.log('[ThemeEnforcer] Unauthorized session detected, enforcing light theme');
                setTheme('light');
                
                // Clear any theme storage for unauthorized users
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('theme');
                }
            }
            return;
        }

        // Detect logout: user was signed in, now they're not
        const justLoggedOut = previousSignedInState.current && !isSignedIn;
        
        // Detect session loss (unauthorized)
        const sessionLost = previousSignedInState.current !== isSignedIn && !isSignedIn;

        if (justLoggedOut || sessionLost) {
            console.log('[ThemeEnforcer] Session ended, enforcing light theme');
            
            // Force light theme immediately
            setTheme('light');
            
            // Clear theme storage to prevent any cached dark theme
            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('theme');
                    
                    // Also clear any next-themes related storage
                    const themeKeys = Object.keys(localStorage).filter(key => 
                        key.includes('theme') || 
                        key.includes('next-themes') ||
                        key.includes('dark') ||
                        key.includes('mode')
                    );
                    
                    themeKeys.forEach(key => {
                        localStorage.removeItem(key);
                        console.log(`[ThemeEnforcer] Cleared theme storage: ${key}`);
                    });
                    
                } catch (error) {
                    console.warn('[ThemeEnforcer] Failed to clear theme storage:', error);
                }
            }
        }

        // For unauthorized users, always enforce light theme if they somehow have dark
        if (!isSignedIn && theme !== 'light') {
            console.log('[ThemeEnforcer] Unauthorized user with non-light theme detected, correcting');
            setTheme('light');
        }

        // Update previous state
        previousSignedInState.current = isSignedIn;
    }, [isSignedIn, setTheme, theme]);

    // Additional effect to monitor theme changes for unauthorized users
    useEffect(() => {
        if (!isSignedIn && theme && theme !== 'light') {
            console.log('[ThemeEnforcer] Unauthorized theme change blocked, reverting to light');
            setTheme('light');
        }
    }, [theme, isSignedIn, setTheme]);

    // Clean up on component unmount if user is not signed in
    useEffect(() => {
        return () => {
            if (!isSignedIn) {
                console.log('[ThemeEnforcer] Component unmounting for unauthorized user, ensuring light theme');
                setTheme('light');
            }
        };
    }, [isSignedIn, setTheme]);

    // This component doesn't render anything
    return null;
}
