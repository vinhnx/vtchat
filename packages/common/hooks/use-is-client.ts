'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to handle hydration mismatch issues.
 * Returns true only after the component has mounted on the client.
 * Use this to prevent SSR/client mismatch for components that depend on browser APIs.
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}
