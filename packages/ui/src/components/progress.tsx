'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '../lib/utils';

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
        indicatorClassName?: string;
    }
>(({ className, value, indicatorClassName, ...props }, ref) => (
    <ProgressPrimitive.Root
        className={cn(
            'relative h-2 w-full overflow-hidden rounded-full bg-stone-900/20 dark:bg-stone-50/20',
            className
        )}
        ref={ref}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className={cn(
                'h-full w-full flex-1 bg-stone-900 transition-all dark:bg-stone-50',
                indicatorClassName
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
