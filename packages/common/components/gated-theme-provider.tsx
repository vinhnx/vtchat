'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useFeatureAccess } from '../hooks/use-subscription-access';
import { FeatureSlug } from '@repo/shared/types/subscription';

function ThemeEnforcer({ children }: { children: React.ReactNode }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    
    // Safely check feature access - will return false if provider not available
    let hasThemeAccess = false;
    try {
        hasThemeAccess = useFeatureAccess(FeatureSlug.DARK_THEME);
    } catch {
        // Subscription provider not available yet, assume no access
        hasThemeAccess = false;
    }

    useEffect(() => {
        // Don't run on server or during initial render
        if (typeof window === 'undefined') return;
        
        // If user doesn't have access and current theme would resolve to dark, force light
        if (!hasThemeAccess && (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'))) {
            console.log('Enforcing light theme for non-VT+ user');
            setTheme('light');
        }
    }, [hasThemeAccess, theme, resolvedTheme, setTheme]);

    return <>{children}</>;
}

export function GatedThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <ThemeEnforcer>{children}</ThemeEnforcer>
        </NextThemesProvider>
    );
}
