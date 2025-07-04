'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import the chart renderer
const ChartRenderer = lazy(() =>
    import('./chart-wrapper').then((module) => ({
        default: module.ChartRenderer,
    }))
);

// Chart loading skeleton
function ChartSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                    <div className="w-full space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <Skeleton className="h-20" />
                            <Skeleton className="h-16" />
                            <Skeleton className="h-24" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Dynamic chart wrapper with proper TypeScript types
export type DynamicChartProps = React.ComponentProps<typeof ChartRenderer>;

export function DynamicChartWrapper(props: DynamicChartProps) {
    return (
        <Suspense fallback={<ChartSkeleton />}>
            <ChartRenderer {...props} />
        </Suspense>
    );
}
