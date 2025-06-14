'use client';
import { cn } from '@repo/ui';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useIsClient } from '../hooks';

export type TextShimmerProps = {
    children: string;
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
    duration?: number;
    spread?: number;
};

function TextShimmerComponent({
    children,
    as: Component = 'p',
    className,
    duration = 1,
    spread = 2,
}: TextShimmerProps) {
    // Ensure children is always a string
    const textContent = typeof children === 'string' ? children : String(children);

    const MotionComponent = motion[Component];
    const isClient = useIsClient();

    const dynamicSpread = useMemo(() => {
        return textContent.length * spread;
    }, [textContent, spread]);

    const baseStyles = cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:hsl(var(--muted-foreground)/50)] [--base-gradient-color:hsl(var(--foreground))]',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        'dark:[--base-color:hsl(var(--muted-foreground)/50)] dark:[--base-gradient-color:hsl(var(--brand))]',
        className
    );

    const styleProps = {
        '--spread': `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
    } as React.CSSProperties;

    return (
        <MotionComponent
            className={baseStyles}
            initial={isClient ? { backgroundPosition: '100% center' } : false}
            animate={isClient ? { backgroundPosition: '0% center' } : false}
            transition={
                isClient
                    ? {
                          repeat: Infinity,
                          duration,
                          ease: 'linear',
                      }
                    : undefined
            }
            style={styleProps}
        >
            {textContent}
        </MotionComponent>
    );
}

export const TextShimmer = React.memo(TextShimmerComponent);
