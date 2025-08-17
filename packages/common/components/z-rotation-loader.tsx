'use client';

import { cn } from '@repo/ui';
import { motion } from 'framer-motion';
import type { HTMLAttributes } from 'react';

export type ZRotationLoaderProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    speed?: 'slow' | 'normal' | 'fast';
} & HTMLAttributes<HTMLDivElement>;

export const ZRotationLoader = ({
    size = 'md',
    className,
    speed = 'normal',
    ...rest
}: ZRotationLoaderProps) => {
    const sizes = {
        xs: 'h-3.5 w-3.5',
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    } as const;

    const speeds = {
        slow: 3,
        normal: 2,
        fast: 1,
    } as const;

    return (
        <div className={cn('flex items-center justify-center', className)} {...rest}>
            <motion.div
                className={cn('border-2 border-muted rounded-lg bg-background', sizes[size])}
                animate={{ rotateY: [0, 180, 360], translateZ: [0, 50, 0] }}
                transition={{ duration: speeds[speed], repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
                <motion.div
                    className='h-full w-full rounded-md bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/40'
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: speeds[speed], repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.div>
        </div>
    );
};
