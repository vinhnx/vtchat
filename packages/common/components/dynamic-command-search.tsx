'use client';

import { CommandDialog, Skeleton } from '@repo/ui';
import { lazy, Suspense } from 'react';

// Dynamic import the command search
const CommandSearch = lazy(() =>
    import('./command-search').then((module) => ({
        default: module.CommandSearch,
    }))
);

// Command search loading skeleton
function CommandSearchSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* Search input skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-px w-full" />
            </div>

            {/* Command groups skeleton */}
            <div className="space-y-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export type DynamicCommandSearchProps = React.ComponentProps<typeof CommandSearch>;

export function DynamicCommandSearch(props: DynamicCommandSearchProps) {
    return (
        <CommandDialog onOpenChange={props.setOpen} open={props.open}>
            <Suspense fallback={<CommandSearchSkeleton />}>
                <CommandSearch {...props} />
            </Suspense>
        </CommandDialog>
    );
}
