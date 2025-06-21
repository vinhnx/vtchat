'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

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

    const handleThemeClick = useCallback(
        (themeKey: 'light' | 'dark' | 'system') => {
            setTheme(themeKey);
            onChange?.(themeKey);
        },
        [setTheme, onChange]
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

    return (
        <div
            className={`bg-background ring-border relative isolate flex h-8 rounded-full p-1 ring-1 ${className}`}
        >
            {themes.map(({ key, icon: Icon, label }) => {
                const isActive = theme === key;
                // For system theme, also show the resolved theme icon as a hint
                const showSystemHint = key === 'system' && theme === 'system' && resolvedTheme;
                const SystemHintIcon = resolvedTheme === 'dark' ? Moon : Sun;

                return (
                    <button
                        type="button"
                        key={key}
                        className="relative h-6 w-6 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
                        aria-label={`${label}${showSystemHint ? ` (${resolvedTheme})` : ''}`}
                        title={`${label}${showSystemHint ? ` (currently ${resolvedTheme})` : ''}`}
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
};
