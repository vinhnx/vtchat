'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export const ConditionalFooter = () => {
    const pathname = usePathname();

    // Don't show footer on chat pages (root and thread pages)
    if (pathname === '/' || pathname.startsWith('/chat/')) {
        return null;
    }

    return (
        <footer className="border-border/50 bg-background mt-auto border-t">
            <div className="mx-auto max-w-7xl">
                <Footer />
            </div>
        </footer>
    );
};
