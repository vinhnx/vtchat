'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Custom hook that forces a re-render when the theme changes
 * This helps ensure components properly update their styling when theme changes
 */
export function useThemeChange() {
    const { theme, resolvedTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

    // Force re-render when theme changes
    useEffect(() => {
        if (theme !== currentTheme) {
            setCurrentTheme(theme);
        }
    }, [theme, currentTheme]);

    return { theme, resolvedTheme, currentTheme };
}
