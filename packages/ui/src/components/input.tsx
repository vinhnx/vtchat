import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const inputVariants = cva(
    "flex h-9 w-full rounded-xl bg-background px-3 text-sm shadow-subtle-xs outline-hidden transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-background text-sm",
                ghost: "bg-transparent",
            },
            size: {
                default: "h-9 px-4 text-sm",
                sm: "h-9 px-3 text-xs md:text-sm",
            },
            roundedSm: {
                default: "rounded-md",
                lg: "rounded-lg",
                full: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            roundedSm: "default",
        },
    },
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, size, roundedSm, ...props }, ref) => {
        return (
            <input
                autoComplete="off"
                className={cn(inputVariants({ variant, size, roundedSm, className }))}
                ref={ref}
                type={type}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
