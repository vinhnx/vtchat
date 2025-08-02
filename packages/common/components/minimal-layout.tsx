import type { ReactNode } from "react";
import { LayoutSkeleton } from "./layout-skeleton";

interface OptimizedLayoutProps {
    children?: ReactNode;
    showSkeleton?: boolean;
    sidebarPlacement?: "left" | "right";
}

/**
 * SSR-friendly optimized layout that provides immediate structure
 * Falls back to skeleton during loading states
 */
export function OptimizedLayout({
    children,
    showSkeleton = false,
    sidebarPlacement = "left",
}: OptimizedLayoutProps) {
    if (showSkeleton || !children) {
        return <LayoutSkeleton showSidebar={true} sidebarPlacement={sidebarPlacement} />;
    }

    return <>{children}</>;
}

/**
 * Server-side safe layout wrapper
 * Provides consistent structure for SSR and client hydration
 */
export function SSRLayoutWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            {children}
        </div>
    );
}
