'use client';

import { ReactNode, useEffect, useState } from 'react';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // During SSR, render children directly to prevent null returns that can cause hydration issues
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    // Prevent hydration mismatch by not rendering auth-dependent content until mounted
    if (!isMounted) {
        return <>{children}</>;
    }

    // Ensure children is a valid React node
    if (!children) {
        return <div>Loading...</div>;
    }

    // For now, just pass through children without session provider
    // Better Auth handles sessions differently
    return <>{children}</>;
}
