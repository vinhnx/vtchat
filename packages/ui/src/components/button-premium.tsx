import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/utils';

const premiumButtonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]',
                destructive: 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:scale-[1.02] active:scale-[0.98]',
                outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:shadow-md transition-all duration-200',
                secondary: 'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]',
                ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] active:scale-[0.99]',
                premium: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/25 hover:from-slate-700 hover:to-slate-800 hover:shadow-2xl hover:shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] border border-slate-600/50',
                glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]',
                gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/25 hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]',
            },
            size: {
                default: 'h-10 px-6 py-2',
                sm: 'h-8 rounded-md px-4 text-xs',
                lg: 'h-12 rounded-lg px-8 text-base',
                xl: 'h-14 rounded-xl px-10 text-lg',
                icon: 'h-10 w-10',
                'icon-sm': 'h-8 w-8',
                'icon-lg': 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface PremiumButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof premiumButtonVariants> {
    asChild?: boolean;
    loading?: boolean;
    shimmer?: boolean;
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, shimmer = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(premiumButtonVariants({ variant, size }), className)}
                ref={ref}
                disabled={loading || props.disabled}
                {...props}
            >
                {shimmer && (
                    <div className="absolute inset-0 -top-[2px] rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out] pointer-events-none" />
                )}
                {loading ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Loading...
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);

PremiumButton.displayName = 'PremiumButton';

export { PremiumButton, premiumButtonVariants };
