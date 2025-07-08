'use client';

import { useState } from 'react';
import { useSession } from '@repo/shared/lib/auth-client';

export const useLoginPrompt = () => {
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { data: session } = useSession();
    const isSignedIn = !!session;

    const requireLogin = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return true;
        }
        return false;
    };

    return {
        showLoginPrompt,
        setShowLoginPrompt,
        isSignedIn,
        requireLogin,
    };
};
