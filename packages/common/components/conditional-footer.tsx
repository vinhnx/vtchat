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
        <footer className='border-border/50 bg-background relative z-0 mt-auto border-t mb-4 pb-safe sm:mb-4 md:mb-6'>
            <div className='mx-auto w-full max-w-7xl'>
                <Footer />
            </div>
        </footer>
    );
};
