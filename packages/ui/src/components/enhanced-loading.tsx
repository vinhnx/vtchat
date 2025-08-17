'use client';

import { motion, type Variants } from 'framer-motion';
import * as React from 'react';

import { cn } from '../lib/utils';
import { 
    ANIMATION_DURATION, 
    EASING, 
    STAGGER_DELAY,
    FOLLOW_THROUGH 
} from '../lib/animation-constants';

interface EnhancedLoadingProps {
    type?: 'dots' | 'bars' | 'spinner' | 'pulse' | 'skeleton';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    message?: string;
    showMessage?: boolean;
}

// PRINCIPLE 6: SLOW IN & SLOW OUT + PRINCIPLE 9: TIMING
const baseTransition = {
    duration: ANIMATION_DURATION.extended / 1000,
    ease: EASING.easeInOut,
    repeat: Number.POSITIVE_INFINITY,
};

// PRINCIPLE 5: FOLLOW THROUGH & OVERLAPPING ACTION - Dots with staggered motion
const DotsLoader = ({ size = 'md' }: { size: string }) => {
    const dotSizes = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    }[size];

    const containerVariants: Variants = {
        animate: {
            transition: {
                staggerChildren: STAGGER_DELAY.normal / 1000,
                repeat: Number.POSITIVE_INFINITY,
            },
        },
    };

    const dotVariants: Variants = {
        initial: { 
            y: 0, 
            opacity: 0.7,
            scale: 1 
        },
        animate: {
            y: [0, -8, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.1, 1],
            transition: {
                ...baseTransition,
                duration: 0.6,
            },
        },
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex items-center gap-1"
        >
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    variants={dotVariants}
                    className={cn(
                        'rounded-full bg-current',
                        dotSizes
                    )}
                />
            ))}
        </motion.div>
    );
};

// PRINCIPLE 1: SQUASH & STRETCH - Bars with deformation
const BarsLoader = ({ size = 'md' }: { size: string }) => {
    const barSizes = {
        sm: 'w-0.5 h-4',
        md: 'w-1 h-6',
        lg: 'w-1.5 h-8',
    }[size];

    const containerVariants: Variants = {
        animate: {
            transition: {
                staggerChildren: STAGGER_DELAY.tight / 1000,
                repeat: Number.POSITIVE_INFINITY,
            },
        },
    };

    // PRINCIPLE 1: SQUASH & STRETCH applied to height
    const barVariants: Variants = {
        initial: { 
            scaleY: 0.3,
            opacity: 0.6 
        },
        animate: {
            scaleY: [0.3, 1, 0.3],
            opacity: [0.6, 1, 0.6],
            transition: {
                ...baseTransition,
                duration: 0.8,
            },
        },
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex items-center gap-1"
        >
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    variants={barVariants}
                    className={cn(
                        'rounded-sm bg-current origin-bottom',
                        barSizes
                    )}
                />
            ))}
        </motion.div>
    );
};

// PRINCIPLE 7: ARCS - Circular motion with organic path
const SpinnerLoader = ({ size = 'md' }: { size: string }) => {
    const spinnerSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }[size];

    const spinVariants: Variants = {
        animate: {
            rotate: 360,
            transition: {
                duration: ANIMATION_DURATION.extended / 1000,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
            },
        },
    };

    return (
        <motion.div 
            variants={spinVariants}
            animate="animate"
            className={cn(
                'border-2 border-current border-t-transparent rounded-full',
                spinnerSizes
            )}
        />
    );
};

// PRINCIPLE 12: APPEAL - Breathing pulse effect
const PulseLoader = ({ size = 'md' }: { size: string }) => {
    const pulseSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6',
    }[size];

    const pulseVariants: Variants = {
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 1.5,
                ease: EASING.easeInOut,
                repeat: Number.POSITIVE_INFINITY,
            },
        },
    };

    return (
        <motion.div 
            variants={pulseVariants}
            animate="animate"
            className={cn(
                'rounded-full bg-current',
                pulseSizes
            )}
        />
    );
};

// PRINCIPLE 3: STAGING - Skeleton with sequential loading effect
const SkeletonLoader = ({ size = 'md' }: { size: string }) => {
    const skeletonSizes = {
        sm: { width: 'w-32', height: 'h-3' },
        md: { width: 'w-48', height: 'h-4' },
        lg: { width: 'w-64', height: 'h-5' },
    }[size];

    const shimmerVariants: Variants = {
        animate: {
            x: ['-100%', '100%'],
            transition: {
                duration: 1.5,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
            },
        },
    };

    const containerVariants: Variants = {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const lineVariants: Variants = {
        initial: { opacity: 0, width: 0 },
        animate: { 
            opacity: 1, 
            width: '100%',
            transition: { 
                duration: 0.5, 
                ease: EASING.easeOut 
            }
        },
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-2"
        >
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    variants={lineVariants}
                    className={cn(
                        'relative overflow-hidden rounded bg-muted',
                        skeletonSizes.height,
                        i === 2 ? 'w-3/4' : skeletonSizes.width // Last line shorter
                    )}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        variants={shimmerVariants}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                </motion.div>
            ))}
        </motion.div>
    );
};

// PRINCIPLE 8: SECONDARY ACTION - Message with typewriter effect
const LoadingMessage = ({ message, isVisible }: { message: string; isVisible: boolean }) => {
    const [displayText, setDisplayText] = React.useState('');
    
    React.useEffect(() => {
        if (!isVisible || !message) {
            setDisplayText('');
            return;
        }

        let index = 0;
        const timer = setInterval(() => {
            if (index <= message.length) {
                setDisplayText(message.slice(0, index));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 50); // Typewriter speed

        return () => clearInterval(timer);
    }, [message, isVisible]);

    const messageVariants: Variants = {
        initial: { opacity: 0, y: 10 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: { 
                delay: 0.3,
                duration: ANIMATION_DURATION.normal / 1000,
                ease: EASING.easeOut 
            }
        },
        exit: { opacity: 0, y: -10 },
    };

    if (!message || !isVisible) return null;

    return (
        <motion.p
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-sm text-muted-foreground mt-4 text-center"
        >
            {displayText}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ 
                    duration: 0.8, 
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut'
                }}
                className="ml-0.5"
            >
                |
            </motion.span>
        </motion.p>
    );
};

export function EnhancedLoading({
    type = 'dots',
    size = 'md',
    className,
    message,
    showMessage = false,
}: EnhancedLoadingProps) {
    const LoaderComponent = {
        dots: DotsLoader,
        bars: BarsLoader,
        spinner: SpinnerLoader,
        pulse: PulseLoader,
        skeleton: SkeletonLoader,
    }[type];

    return (
        <div className={cn('flex flex-col items-center justify-center p-4', className)}>
            <div className="text-muted-foreground">
                <LoaderComponent size={size} />
            </div>
            
            {showMessage && (
                <LoadingMessage 
                    message={message || 'Loading...'} 
                    isVisible={true} 
                />
            )}
        </div>
    );
}

// Export individual loaders for specific use cases (renamed to avoid conflicts)
export { 
    DotsLoader as AnimatedDotsLoader, 
    BarsLoader as AnimatedBarsLoader, 
    SpinnerLoader as AnimatedSpinnerLoader, 
    PulseLoader as AnimatedPulseLoader, 
    SkeletonLoader as AnimatedSkeletonLoader 
};