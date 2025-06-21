'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '../store/onboarding.store';
import { useSession } from '@repo/shared/lib/auth-client';

/**
 * Onboarding Manager Component
 * Handles first session launch detection and automatic API keys setup
 */
export function OnboardingManager() {
    const { hasCompletedFirstLaunch, setFirstLaunchCompleted } = useOnboardingStore();
    const { data: session } = useSession();
    const isSignedIn = !!session;

    useEffect(() => {
        // Only run onboarding for authenticated users
        if (!isSignedIn) return;

        const checkOnboarding = async () => {
            // Check if this is the first session launch
            if (!hasCompletedFirstLaunch) {
                console.log('[Onboarding] First session detected');
                setFirstLaunchCompleted();

                // Note: We no longer automatically open settings
                // API key validation will happen when user tries to send a message
                console.log(
                    '[Onboarding] First launch completed - API keys will be requested when needed'
                );
            }
        };

        checkOnboarding();
    }, [isSignedIn, hasCompletedFirstLaunch, setFirstLaunchCompleted]);

    // This component doesn't render anything
    return null;
}
