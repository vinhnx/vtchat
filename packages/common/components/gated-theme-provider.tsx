'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';
import { logger } from '@repo/shared/logger';

function ThemeEnforcer({ children }: { children: React.ReactNode }) {
    // TEMPORARILY DISABLED: Theme enforcement disabled to prevent SubscriptionProvider errors
    // The ThemeSwitcher component handles the gating at the UI level, which is sufficient
    // This global enforcement can be re-enabled once provider initialization order is fixed
    
    logger.info('🔒 GatedThemeProvider: Theme enforcement temporarily disabled');
    
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
