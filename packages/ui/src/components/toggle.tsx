'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const toggleVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-all duration-200 hover:bg-stone-100/70 hover:text-stone-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-stone-100/90 data-[state=on]:text-stone-900 dark:data-[state=on]:bg-stone-800/90 dark:data-[state=on]:text-stone-50 dark:focus-visible:ring-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-stone-400 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 toggle-hover-effect',
    {
        variants: {
            variant: {
                default: 'bg-transparent',
                outline:
                    'border border-stone-200 bg-transparent shadow-xs hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-50',
            },
            size: {
                default: 'h-9 min-w-9 px-2',
                sm: 'h-8 min-w-8 px-1.5',
                lg: 'h-10 min-w-10 px-2.5',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const Toggle = React.forwardRef<
    React.ElementRef<typeof TogglePrimitive.Root>,
    & React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
    & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
    <TogglePrimitive.Root
        className={cn(toggleVariants({ variant, size, className }))}
        ref={ref}
        {...props}
    />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
