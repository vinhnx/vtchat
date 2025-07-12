import { Slot as SlotPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Tooltip } from './tooltip';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                bordered:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                'ghost-bordered':
                    'border border-input hover:bg-accent hover:text-accent-foreground',
            },
            size: {
                default: 'h-9 px-4 py-2',
                xs: 'h-6 rounded px-2 text-xs',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
                'icon-sm': 'h-7 w-7',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    tooltip?: string;
    tooltipSide?: 'left' | 'right' | 'top' | 'bottom';
    rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant, size, asChild = false, tooltip, tooltipSide, rounded, ...props },
        ref
    ) => {
        const Comp = asChild ? SlotPrimitive.Slot : 'button';

        const roundedClass = rounded
            ? {
                  sm: 'rounded-sm',
                  md: 'rounded-md',
                  lg: 'rounded-lg',
                  full: 'rounded-full',
              }[rounded]
            : '';

        const buttonElement = (
            <Comp
                className={cn(buttonVariants({ variant, size }), roundedClass, className)}
                ref={ref}
                {...props}
            />
        );

        if (tooltip) {
            return (
                <Tooltip content={tooltip} side={tooltipSide}>
                    {buttonElement}
                </Tooltip>
            );
        }

        return buttonElement;
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
