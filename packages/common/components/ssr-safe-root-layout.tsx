'use client';

import { useRootContext } from '@repo/common/context';
import { useAppStore } from '@repo/common/store';
import { usePathname } from 'next/navigation';
import { lazy, Suspense, useEffect, useState } from 'react';
import { LayoutSkeleton } from './layout-skeleton';

// Lazy load the complete root layout for better performance
const CompleteRootLayout = lazy(() =>
    import('./layout/root').then((module) => ({
        default: module.RootLayout,
    }))
);

export type TSSRSafeRootLayout = {
    children: React.ReactNode;
};

/**
 * SSR-safe root layout that provides immediate structure
 * and progressively loads the complete layout
 */
export const SSRSafeRootLayout: React.FC<TSSRSafeRootLayout> = ({ children }) => {
    const [isClient, setIsClient] = useState(false);
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
    const sidebarPlacement = useAppStore((state) => state.sidebarPlacement);
    const pathname = usePathname();

    // Set client-side state
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname, setIsMobileSidebarOpen]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileSidebarOpen]);

    // Show skeleton during SSR and initial client load
    if (!isClient) {
        return <LayoutSkeleton showSidebar={isSidebarOpen} sidebarPlacement={sidebarPlacement} />;
    }

    // Client-side rendering with progressive loading
    return (
        <div className='bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden'>
            <Suspense
                fallback={
                    <LayoutSkeleton
                        showSidebar={isSidebarOpen}
                        sidebarPlacement={sidebarPlacement}
                    />
                }
            >
                <CompleteRootLayout>{children}</CompleteRootLayout>
            </Suspense>
        </div>
    );
};
