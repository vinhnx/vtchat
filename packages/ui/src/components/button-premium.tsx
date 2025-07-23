import { Slot as SlotPrimitive } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const premiumButtonVariants = cva(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring-3 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 premium-btn-hover",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/95",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/95",
                outline:
                    "border border-input bg-background transition-all duration-200 hover:border-accent-foreground/20 hover:bg-accent/50 hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                ghost: "hover:bg-accent/50 hover:text-accent-foreground",
                premium:
                    "border border-slate-600/50 bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800",
                glass: "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/15",
                gradient:
                    "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-8 rounded-md px-4 text-xs",
                lg: "h-12 rounded-lg px-8 text-base",
                xl: "h-14 rounded-xl px-10 text-lg",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
                "icon-lg": "h-12 w-12",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
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
        ref,
    ) => {
        const Comp = asChild ? SlotPrimitive.Slot : "button";

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
    },
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton, premiumButtonVariants };
