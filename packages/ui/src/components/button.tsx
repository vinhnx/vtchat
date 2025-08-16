import { Slot as SlotPrimitive } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type MotionProps } from 'framer-motion';
import * as React from 'react';

import { cn } from '../lib/utils';
import { createSquashStretch, createSecondaryAction, ANIMATION_MOTION_VARIANTS } from '../lib/animation-utils';
import { Tooltip } from './tooltip';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-hover-effect',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:
                    'border border-border/40 bg-background hover:bg-accent/30 hover:text-accent-foreground hover:border-border/60',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent/30 hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline link-hover-effect',
                bordered:
                    'border border-border/40 bg-background hover:bg-accent/30 hover:text-accent-foreground hover:border-border/60',
                'ghost-bordered':
                    'border border-border/40 hover:bg-accent/30 hover:text-accent-foreground hover:border-border/60',
            },
            size: {
                default: 'h-9 px-4 py-2',
                xs: 'h-6 rounded-sm px-2 text-xs',
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
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants>
{
    asChild?: boolean;
    tooltip?: string;
    tooltipSide?: 'left' | 'right' | 'top' | 'bottom';
    roundedSm?: 'sm' | 'md' | 'lg' | 'full';
    // Animation enhancements following 12 Principles
    animationType?: 'none' | 'gentle' | 'squash' | 'secondary';
    anticipation?: boolean;
    motionProps?: Partial<MotionProps>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { 
            className, 
            variant, 
            size, 
            asChild = false, 
            tooltip, 
            tooltipSide, 
            roundedSm,
            animationType = 'gentle',
            anticipation = false,
            motionProps,
            ...props 
        },
        ref,
    ) => {
        const Comp = asChild ? SlotPrimitive.Slot : 'button';

        const roundedClass = roundedSm
            ? {
                sm: 'rounded-xs',
                md: 'rounded-md',
                lg: 'rounded-lg',
                full: 'rounded-full',
            }[roundedSm]
            : '';

        // Apply animation principles based on type
        const getAnimationProps = (): Partial<MotionProps> => {
            if (animationType === 'none') return {};

            const baseProps: Partial<MotionProps> = {
                ...ANIMATION_MOTION_VARIANTS.buttonPress,
                whileHover: { scale: 1.02 },
                ...motionProps,
            };

            switch (animationType) {
                case 'squash':
                    return {
                        ...baseProps,
                        ...createSquashStretch('subtle'),
                    };
                case 'secondary':
                    return {
                        ...baseProps,
                        ...createSecondaryAction('glow'),
                    };
                case 'gentle':
                default:
                    return baseProps;
            }
        };

        // Enhanced button with animation principles
        const buttonElement = asChild ? (
            <Comp
                className={cn(buttonVariants({ variant, size }), roundedClass, className)}
                ref={ref}
                {...props}
            />
        ) : (
            <motion.button
                className={cn(buttonVariants({ variant, size }), roundedClass, className)}
                ref={ref}
                {...getAnimationProps()}
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
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
