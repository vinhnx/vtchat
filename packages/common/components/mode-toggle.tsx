'use client';

import { FeatureSlug } from '@repo/shared/types/subscription';
import { GatedFeatureAlert } from './gated-feature-alert';
import { ThemeSwitcher } from './theme-switcher';

interface ModeToggleProps {
    onClose?: () => void;
}

export function ModeToggle({ onClose: _onClose }: ModeToggleProps) {
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
            <ThemeSwitcher />
        </GatedFeatureAlert>
    );
}
