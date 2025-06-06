'use client';

import { ReactNode } from 'react';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
    // For now, just pass through children without session provider
    // Better Auth handles sessions differently
    return <>{children}</>;
}
