import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-0.5 font-medium text-[0.7rem] transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'rounded-md bg-tertiary text-foreground shadow-sm hover:shadow-md',
                secondary:
                    'rounded-full bg-tertiary text-tertiary-foreground shadow-sm hover:shadow-md',
                tertiary: 'rounded-full bg-brand text-brand-foreground shadow-sm hover:shadow-md',
                brand: 'bg-brand text-brand-foreground shadow-sm hover:shadow-md',
                destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:shadow-md',
                outline:
                    'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                success:
                    'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
                warning:
                    'border border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                premium:
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:shadow-xl',
                glass: 'border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md',
            },
            size: {
                xs: 'h-4 px-1.5 text-[10px]',
                sm: 'h-5 px-2 text-xs',
                md: 'h-6 px-2 font-[350] font-sans text-[11px] text-xs tracking-[0.02em]',
                lg: 'h-7 px-3 text-xs',
                xl: 'h-8 px-4 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    dot?: boolean;
    pulse?: boolean;
}

function Badge({
    className,
    variant,
    size,
    dot = false,
    pulse = false,
    children,
    ...props
}: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {dot && (
                <span
                    className={cn('h-1.5 w-1.5 rounded-full bg-current', pulse && 'animate-pulse')}
                />
            )}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
