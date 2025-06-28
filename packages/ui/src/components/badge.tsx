import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center whitespace-nowrap gap-1.5 rounded-sm px-2 py-0.5 text-[0.7rem] font-medium transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-tertiary text-foreground rounded-md shadow-sm hover:shadow-md',
                secondary: 'bg-tertiary text-tertiary-foreground rounded-full shadow-sm hover:shadow-md',
                tertiary: 'bg-brand text-brand-foreground rounded-full shadow-sm hover:shadow-md',
                brand: 'bg-brand text-brand-foreground shadow-sm hover:shadow-md',
                destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:shadow-md',
                outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
                warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
                premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40',
                glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg',
            },
            size: {
                xs: 'px-1.5 h-4 text-[10px]',
                sm: 'px-2 h-5 text-xs',
                md: 'px-2 h-6 text-xs font-mono text-[11px] tracking-[0.02em] font-[350]',
                lg: 'px-3 h-7 text-xs',
                xl: 'px-4 h-8 text-sm',
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

function Badge({ className, variant, size, dot = false, pulse = false, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full bg-current',
                    pulse && 'animate-pulse'
                )} />
            )}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
