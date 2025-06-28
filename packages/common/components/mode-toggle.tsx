'use client';

import { ThemeSwitcher } from './theme-switcher';

interface ModeToggleProps {
    onClose?: () => void;
}

export function ModeToggle({ onClose: _onClose }: ModeToggleProps) {
    // The ThemeSwitcher component already handles its own gating logic internally
    // No need to wrap it in GatedFeatureAlert as it would interfere with premium users
    return <ThemeSwitcher />;
}
