'use client';

import { cn } from '@repo/ui';
import * as React from 'react';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
Label.displayName = 'Label';

export { Label };
