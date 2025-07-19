"use client";

// import { log } from '@repo/shared/logger'; // Removed - no longer needed
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

function ThemeEnforcer({ children }: { children: React.ReactNode }) {
    // TEMPORARILY DISABLED: Theme enforcement disabled to prevent SubscriptionProvider errors
    // The ThemeSwitcher component handles the gating at the UI level, which is sufficient
    // This global enforcement can be re-enabled once provider initialization order is fixed

    // Remove log statement - no need to log this temporary state in production
    // log.info({}, '🔒 GatedThemeProvider: Theme enforcement temporarily disabled');

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
