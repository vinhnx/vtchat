'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { FeatureSlug } from '@repo/shared/types/subscription';
import { Button } from '@repo/ui';
import { GatedFeatureAlert } from './gated-feature-alert';

interface ModeToggleProps {
    onClose?: () => void;
}

export function ModeToggle({ onClose }: ModeToggleProps) {
    const { theme, setTheme } = useTheme();

    const handleToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        if (onClose) onClose();
    };

    return (
        <GatedFeatureAlert
            requiredFeature={FeatureSlug.DARK_MODE}
            title="Dark Mode Available in VT+"
            message="Dark mode is a VT+ feature. Please upgrade your plan to use this feature."
            onGatedClick={() => {
                // Optional: You can add analytics or other side effects here
                console.log('User attempted to use dark mode without VT+ subscription');
            }}
        >
            <Button variant="outlined" size="icon" onClick={handleToggle}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </GatedFeatureAlert>
    );
}
