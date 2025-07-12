import { cva, type VariantProps } from 'class-variance-authority';
import { Slot as SlotPrimitive } from 'radix-ui';
import * as React from 'react';
import { cn } from '../lib/utils';

const premiumButtonVariants = cva(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] hover:shadow-primary/30 hover:shadow-xl active:scale-[0.98]',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-destructive/25 shadow-lg hover:scale-[1.02] hover:shadow-destructive/30 hover:shadow-xl active:scale-[0.98]',
                outline:
                    'border border-input bg-background shadow-sm transition-all duration-200 hover:border-accent-foreground/20 hover:bg-accent hover:text-accent-foreground hover:shadow-md',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-md hover:scale-[1.01] hover:bg-secondary/80 hover:shadow-lg active:scale-[0.99]',
                ghost: 'hover:scale-[1.01] hover:bg-accent hover:text-accent-foreground active:scale-[0.99]',
                premium:
                    'border border-slate-600/50 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-slate-900/25 shadow-xl hover:scale-[1.02] hover:from-slate-700 hover:to-slate-800 hover:shadow-2xl hover:shadow-slate-900/40 active:scale-[0.98]',
                glass: 'border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md hover:scale-[1.02] hover:border-white/30 hover:bg-white/20 active:scale-[0.98]',
                gradient:
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 shadow-xl hover:scale-[1.02] hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-[0.98]',
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
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            shimmer = false,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? SlotPrimitive.Slot : 'button';

        return (
            <Comp
                className={cn(premiumButtonVariants({ variant, size }), className)}
                disabled={loading || props.disabled}
                ref={ref}
                {...props}
            >
                {shimmer && (
                    <div className="pointer-events-none absolute inset-0 -top-[2px] rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_ease-in-out] group-hover:opacity-100" />
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
