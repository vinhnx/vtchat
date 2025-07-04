'use client';

import { FullPageLoader } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import type { ReactNode } from 'react';

interface ClientBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Client boundary component that prevents rendering until client is ready
 * Helps prevent hydration mismatches for complex components
 */
export function ClientBoundary({ children, fallback }: ClientBoundaryProps) {
    const { isClient } = useRootContext();

    if (!isClient) {
        return fallback ? <>{fallback}</> : <FullPageLoader />;
    }

    return <>{children}</>;
}
