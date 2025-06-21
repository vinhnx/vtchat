'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@repo/shared/lib/auth-client';

/**
 * Login BYOK Manager Component
 * Tracks login events for logging (BYOK validation happens in chat input)
 */
export function LoginBYOKManager() {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const previousSignedInState = useRef(false);

    useEffect(() => {
        // Detect login event: user was not signed in, now they are
        const justLoggedIn = !previousSignedInState.current && isSignedIn;

        if (justLoggedIn) {
            console.log('[LoginBYOK] User just logged in');
            console.log(
                '[LoginBYOK] BYOK validation will happen when user tries to send a message'
            );

            // Note: We no longer automatically show BYOK dialog after login
            // The validation will happen when user actually tries to send a message
        }

        // Update previous state
        previousSignedInState.current = isSignedIn;
    }, [isSignedIn]);

    // This component doesn't render anything
    return null;
}
