'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamic import of RootLayout to prevent SSR issues
const DynamicRootLayout = dynamic(
    () => import('./root').then(mod => ({ default: mod.RootLayout })),
    {
        ssr: false,
        loading: () => (
            <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
                <div className="flex w-full flex-col gap-2 overflow-y-auto p-4">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-muted-foreground text-sm">Loading...</div>
                    </div>
                </div>
            </div>
        ),
    }
) as ComponentType<{ children: React.ReactNode }>;

export { DynamicRootLayout as ClientRootLayout };
