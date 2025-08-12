'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        className={cn(
            'border-primary focus-visible:ring-ring-3 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-hidden peer h-5 w-5 shrink-0 rounded-md border focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
            className,
        )}
        ref={ref}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current')}
        >
            <Check className='h-4 w-4' />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
