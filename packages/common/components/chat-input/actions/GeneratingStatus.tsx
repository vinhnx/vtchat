'use client';

import { MotionSkeleton } from '@repo/common/components';

export function GeneratingStatus() {
    return (
        <div className='text-muted-foreground flex flex-row items-center gap-2 px-2 text-xs'>
            <MotionSkeleton className='h-3 w-3 rounded-full' />
        </div>
    );
}
