'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export const ConditionalFooter = () => {
    const pathname = usePathname();
    
    // Don't show footer on chat page
    if (pathname.startsWith('/chat')) {
        return null;
    }
    
    return (
        <footer className="border-border/50 bg-background border-t mt-auto">
            <div className="mx-auto max-w-7xl">
                <Footer />
            </div>
        </footer>
    );
};
