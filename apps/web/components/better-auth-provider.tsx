'use client';

import { ReactNode, useEffect, useState } from 'react';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // During SSR, return null to prevent any hydration issues
    if (typeof window === 'undefined') {
        return null;
    }

    // Prevent hydration mismatch by not rendering auth-dependent content until mounted
    if (!isMounted) {
        return null;
    }

    // Ensure children is a valid React node
    if (!children) {
        return null;
    }

    // For now, just pass through children without session provider
    // Better Auth handles sessions differently
    return <>{children}</>;
}
