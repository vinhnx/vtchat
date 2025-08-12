'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader } from './components/card';
import { Skeleton } from './components/skeleton';

// Dynamic import the chart renderer
const ChartRendererComponent = lazy(() =>
    import('./chart-renderer').then((module) => ({
        default: module.ChartRenderer,
    }))
);

// Chart loading skeleton
function ChartSkeleton() {
    return (
        <Card className='w-full'>
            <CardHeader>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
                <div className='flex h-[300px] items-center justify-center'>
                    <div className='w-full space-y-3'>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-5/6' />
                        <Skeleton className='h-4 w-4/6' />
                        <div className='mt-6 grid grid-cols-3 gap-4'>
                            <Skeleton className='h-20' />
                            <Skeleton className='h-16' />
                            <Skeleton className='h-24' />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Re-export chart types for convenience
export type { ChartProps } from './chart-renderer';

export function DynamicChartRenderer(props: ChartProps) {
    return (
        <Suspense fallback={<ChartSkeleton />}>
            <ChartRendererComponent {...props} />
        </Suspense>
    );
}
