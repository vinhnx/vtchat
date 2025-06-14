'use client';

import { RootLayout } from './root';

// Client-only wrapper to prevent SSR issues
export function SSRSafeRootLayout({ children }: { children: React.ReactNode }) {
    return <RootLayout>{children}</RootLayout>;
}
