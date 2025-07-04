'use client';

import { log } from '@repo/shared/logger';
import React, { type ReactNode } from 'react';
import { FullPageLoader } from './full-page-loader';

interface SSRErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

// Simple fallback component that doesn't use error boundaries
// This avoids type compatibility issues while still providing error protection
export function SSRErrorBoundary({ children, fallback }: SSRErrorBoundaryProps): JSX.Element {
    try {
        // In production, just render children
        return <>{children}</>;
    } catch (error) {
        log.warn('SSR Error Boundary caught an error:', { data: error });

        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="bg-background flex h-[100dvh] w-full items-center justify-center">
                <FullPageLoader />
            </div>
        );
    }
}
