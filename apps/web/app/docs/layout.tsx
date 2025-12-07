import { baseOptions } from '@/app/layout.config';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode; }) {
    let tree: unknown = [];
    try {
        // Lazy-load docs source; fallback to empty tree if unavailable
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { source } = require('@/lib/source');
        tree = source?.pageTree || [];
    } catch {
        tree = [];
    }

    return (
        <DocsLayout tree={tree} {...baseOptions}>
            {children}
        </DocsLayout>
    );
}
