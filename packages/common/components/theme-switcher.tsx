'use client';

import { log } from '@repo/shared/logger';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Tooltip } from '@repo/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { useFeatureAccess } from '../hooks/use-subscription-access';

const themes = [
    {
        key: 'system',
        icon: Monitor,
        label: 'System theme',
    },
    {
        key: 'light',
        icon: Sun,
        label: 'Light theme',
    },
    {
        key: 'dark',
        icon: Moon,
        label: 'Dark theme',
    },
];

export type ThemeSwitcherProps = {
    value?: 'light' | 'dark' | 'system';
    onChange?: (theme: 'light' | 'dark' | 'system') => void;
    defaultValue?: 'light' | 'dark' | 'system';
    className?: string;
};

export const ThemeSwitcher = ({ onChange, className = '' }: ThemeSwitcherProps) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // Dark theme is now available to all logged-in users
    const hasThemeAccess = useFeatureAccess(FeatureSlug.DARK_THEME);

    const handleThemeClick = useCallback(
        (themeKey: 'light' | 'dark' | 'system') => {
            // Block dark mode and system theme for non-signed-in users
            if ((themeKey === 'dark' || themeKey === 'system') && !hasThemeAccess) {
                log.warn('Dark theme access blocked: Sign in required');
                // Fallback to light theme for non-signed-in users
                setTheme('light');
                onChange?.('light');
                return;
            }

            setTheme(themeKey);
            onChange?.(themeKey);
        },
        [setTheme, onChange, hasThemeAccess]
    );

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={`relative isolate flex h-8 rounded-full bg-gray-100 p-1 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 ${className}`}
            >
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-6 rounded-full" />
                <div className="h-6 w-6 rounded-full" />
            </div>
        );
    }

    const themeSwitcher = (
        <div
            className={`bg-background ring-border relative isolate flex h-8 rounded-full p-1 ring-1 ${className}`}
        >
            {themes.map(({ key, icon: Icon, label }) => {
                const isActive = theme === key;
                // For system theme, also show the resolved theme icon as a hint
                const showSystemHint = key === 'system' && theme === 'system' && resolvedTheme;
                const SystemHintIcon = resolvedTheme === 'dark' ? Moon : Sun;
                // Check if this theme option is disabled for non-signed-in users
                const isDisabled = (key === 'dark' || key === 'system') && !hasThemeAccess;

                return (
                    <button
                        aria-label={`${label}${showSystemHint ? ` (${resolvedTheme})` : ''}${isDisabled ? ' (Sign in required)' : ''}`}
                        className={`relative h-6 w-6 rounded-full transition-all duration-200 ${
                            isDisabled
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        disabled={isDisabled}
                        key={key}
                        onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
                        title={`${label}${showSystemHint ? ` (currently ${resolvedTheme})` : ''}${isDisabled ? ' - Sign in required' : ''}`}
                        type="button"
                    >
                        {isActive && (
                            <div className="bg-secondary absolute inset-0 rounded-full transition-all duration-200" />
                        )}
                        <Icon
                            className={`relative z-10 m-auto h-4 w-4 transition-colors duration-200 ${
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                        />
                        {showSystemHint && (
                            <SystemHintIcon
                                className="text-muted-foreground absolute -bottom-0.5 -right-0.5 h-2 w-2"
                                strokeWidth={3}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );

    // Show sign in tooltip for non-signed-in users
    if (!hasThemeAccess) {
        return (
            <Tooltip content="Sign in to unlock dark theme and system theme" side="bottom">
                {themeSwitcher}
            </Tooltip>
        );
    }

    return themeSwitcher;
};
