import { cva, type VariantProps } from 'class-variance-authority';

import React from 'react';

const typeVariants = cva('text !my-0 flex', {
    variants: {
        size: {
            xxs: 'text-xs',
            xs: 'text-xs',
            sm: 'text-xs md:text-sm',
            base: 'text-sm md:text-base',
            lg: 'text-base md:text-lg',
            xl: 'text-lg md:text-xl',
        },
        textColor: {
            primary: 'text-foreground',
            secondary: 'text-muted-foreground',
            tertiary: 'text-tertiary-foreground',
            white: 'text-white',
        },
        weight: {
            regular: 'font-normal',
            medium: 'font-medium',
            bold: 'font-semibold',
        },
    },

    defaultVariants: {
        size: 'sm',
        textColor: 'primary',
        weight: 'regular',
    },
});

export interface TypeProps
    extends React.HTMLAttributes<HTMLParagraphElement>,
        VariantProps<typeof typeVariants> {
    asChild?: boolean;
}

export const Type = React.forwardRef<HTMLParagraphElement, TypeProps>(
    ({ className, size, textColor, weight, asChild = false, ...props }, ref) => {
        const Comp = asChild ? 'span' : 'p';
        return (
            <Comp
                className={typeVariants({ size, textColor, weight, className })}
                ref={ref}
                {...props}
            />
        );
    }
);
Type.displayName = 'Type';
