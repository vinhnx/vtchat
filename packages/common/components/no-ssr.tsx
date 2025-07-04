'use client';

import { type ReactNode, useEffect, useState } from 'react';

interface NoSSRProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Component that only renders children on the client side
 * to prevent SSR hydration mismatches
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
