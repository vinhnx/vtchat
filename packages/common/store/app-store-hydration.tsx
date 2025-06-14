'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from './app.store';

/**
 * Hydration wrapper for app store to prevent SSR mismatches
 */
export function AppStoreHydration({ children }: { children: ReactNode }) {
    const showExamplePrompts = useAppStore(state => state.showExamplePrompts);
    const setShowExamplePrompts = useAppStore(state => state.setShowExamplePrompts);

    useEffect(() => {
        // Hydrate preferences from localStorage on client-side only
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user-preferences');
            if (saved) {
                try {
                    const preferences = JSON.parse(saved);
                    if (preferences.showExamplePrompts !== showExamplePrompts) {
                        setShowExamplePrompts(preferences.showExamplePrompts);
                    }
                } catch {
                    // Ignore parsing errors, use defaults
                }
            }
        }
    }, [showExamplePrompts, setShowExamplePrompts]);

    return <>{children}</>;
}
