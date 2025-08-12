'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';

/**
 * Higher-order component that wraps a component with client-side dynamic import
 * to prevent SSR hydration mismatches for components that depend on browser APIs
 */
export function withClientOnly<P extends object>(
    Component: ComponentType<P>,
    loadingComponent?: ComponentType | (() => ReactNode),
) {
    const ClientComponent = dynamic(() => Promise.resolve(Component), {
        ssr: false,
        loading: loadingComponent
            ? typeof loadingComponent === 'function' && loadingComponent.length === 0
                ? (loadingComponent as () => ReactNode)
                : () => {
                    const LoadingComp = loadingComponent as ComponentType;
                    return <LoadingComp />;
                }
            : undefined,
    });

    const WrappedComponent = (props: P) => {
        return <ClientComponent {...props} />;
    };

    WrappedComponent.displayName = `withClientOnly(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
