'use client';

import { motion } from 'framer-motion';
import { cn } from '@repo/ui';

export type ZRotationLoaderProps = {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    speed?: 'slow' | 'normal' | 'fast';
};

export const ZRotationLoader = ({ 
    size = 'md', 
    className, 
    speed = 'normal' 
}: ZRotationLoaderProps) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    const speeds = {
        slow: 3,
        normal: 2,
        fast: 1,
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <motion.div
                className={cn(
                    'border-2 border-muted rounded-lg bg-background',
                    sizes[size]
                )}
                animate={{
                    rotateY: [0, 180, 360],
                    translateZ: [0, 50, 0],
                }}
                transition={{
                    duration: speeds[speed],
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                }}
            >
                <motion.div
                    className="h-full w-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/40 rounded-md"
                    animate={{
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: speeds[speed],
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>
        </div>
    );
};