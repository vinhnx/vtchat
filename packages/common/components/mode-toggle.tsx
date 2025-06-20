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
        // Don't close settings when toggling theme
    };

    return (
        <GatedFeatureAlert
            requiredFeature={FeatureSlug.DARK_THEME}
            title="Dark Theme Available in VT+"
            message="Dark theme is a VT+ feature. Please upgrade your plan to use this feature."
            onGatedClick={() => {
                // Optional: You can add analytics or other side effects here
                console.log('User attempted to use dark theme without VT+ subscription');
            }}
        >
            <Button variant="outlined" size="sm" onClick={handleToggle}>
                {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
        </GatedFeatureAlert>
    );
}
