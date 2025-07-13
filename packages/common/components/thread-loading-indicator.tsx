'use client';

import { useChatStore } from '@repo/common/store';
import { GENERATION_TIMEOUTS, TIMEOUT_MESSAGES } from '@repo/shared/constants';
import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';

// VT icon component using the actual PNG icon
const VTIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
    <Image
        src="/icon-192x192.png"
        alt="VT"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
    />
);

interface ThreadLoadingIndicatorProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showElapsedTime?: boolean;
}

const TIMEOUT_THRESHOLD = GENERATION_TIMEOUTS.TIMEOUT_THRESHOLD;
const SLOW_RESPONSE_THRESHOLD = GENERATION_TIMEOUTS.SLOW_RESPONSE_THRESHOLD;

export const ThreadLoadingIndicator = memo(
    ({ className, size = 'md', showElapsedTime = true }: ThreadLoadingIndicatorProps) => {
        const isGenerating = useChatStore((state) => state.isGenerating);
        const generationStartTime = useChatStore((state) => state.generationStartTime);
        const showTimeoutIndicator = useChatStore((state) => state.showTimeoutIndicator);
        const setShowTimeoutIndicator = useChatStore((state) => state.setShowTimeoutIndicator);

        const [elapsedTime, setElapsedTime] = useState(0);
        const [isSlowResponse, setIsSlowResponse] = useState(false);

        useEffect(() => {
            let interval: NodeJS.Timeout | null = null;
            let timeoutTimer: NodeJS.Timeout | null = null;
            let slowResponseTimer: NodeJS.Timeout | null = null;

            if (isGenerating && generationStartTime) {
                // Update elapsed time every 100ms for smooth updates
                interval = setInterval(() => {
                    const elapsed = Date.now() - generationStartTime;
                    setElapsedTime(elapsed);
                }, 100);

                // Show timeout indicator after 5 seconds
                timeoutTimer = setTimeout(() => {
                    setShowTimeoutIndicator(true);
                }, TIMEOUT_THRESHOLD);

                // Mark as slow response after 10 seconds
                slowResponseTimer = setTimeout(() => {
                    setIsSlowResponse(true);
                }, SLOW_RESPONSE_THRESHOLD);
            } else {
                setElapsedTime(0);
                setIsSlowResponse(false);
                setShowTimeoutIndicator(false);
            }

            return () => {
                if (interval) clearInterval(interval);
                if (timeoutTimer) clearTimeout(timeoutTimer);
                if (slowResponseTimer) clearTimeout(slowResponseTimer);
            };
        }, [isGenerating, generationStartTime, setShowTimeoutIndicator]);

        const sizeClasses = {
            sm: 'h-6 w-6 md:h-8 md:w-8',
            md: 'h-8 w-8 md:h-10 md:w-10',
            lg: 'h-10 w-10 md:h-12 md:w-12',
        };

        const iconSizes = {
            sm: 14,
            md: 16,
            lg: 20,
        };

        const dotSizes = {
            sm: 'w-1.5 h-1.5 md:w-2 md:h-2',
            md: 'w-2 h-2 md:w-3 md:h-3',
            lg: 'w-2.5 h-2.5 md:w-4 md:h-4',
        };

        const formatElapsedTime = (ms: number) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;

            if (minutes > 0) {
                return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
            return `${seconds}s`;
        };

        const getLoadingState = () => {
            if (isSlowResponse) {
                return {
                    variant: 'slow',
                    icon: Clock,
                    message: TIMEOUT_MESSAGES.SLOW_RESPONSE,
                    color: 'text-muted-foreground',
                    bgColor: 'bg-muted/50',
                    borderColor: 'border-muted-foreground/20',
                    dots: 'bg-muted-foreground/60',
                };
            }

            if (showTimeoutIndicator) {
                return {
                    variant: 'timeout',
                    icon: Clock,
                    message: TIMEOUT_MESSAGES.TIMEOUT_WARNING,
                    color: 'text-muted-foreground',
                    bgColor: 'bg-muted/50',
                    borderColor: 'border-muted-foreground/20',
                    dots: 'bg-muted-foreground/60',
                };
            }
            return {
                variant: 'generating',
                icon: Clock,
                message: TIMEOUT_MESSAGES.GENERATING,
                color: 'text-muted-foreground',
                bgColor: 'bg-muted/50',
                borderColor: 'border-muted-foreground/20',
                dots: 'bg-muted-foreground/60',
            };
        };

        const config = getLoadingState();
        const Icon = config.icon;

        return (
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn('flex w-full items-start gap-2 md:gap-3', className)}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* Enhanced Avatar with VT icon */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    '0 2px 8px rgba(0, 0, 0, 0.1)',
                                ],
                            }}
                            className={cn(
                                'relative flex flex-shrink-0 items-center justify-center rounded-xl',
                                'bg-muted border-muted-foreground/20 border',
                                'shadow-sm',
                                sizeClasses[size]
                            )}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <VTIcon size={iconSizes[size]} />

                            {/* Status indicator */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.6, 0.8, 0.6],
                                }}
                                className={cn(
                                    'absolute -right-1 -top-1 rounded-full',
                                    'bg-muted-foreground/40',
                                    size === 'sm'
                                        ? 'h-3 w-3'
                                        : size === 'md'
                                          ? 'h-4 w-4'
                                          : 'h-5 w-5'
                                )}
                                transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'easeInOut',
                                }}
                            >
                                <div className="bg-background/60 h-full w-full rounded-full" />
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Loading Content */}
                        <motion.div
                            animate={{ scale: 1 }}
                            className={cn(
                                'flex-1 rounded-2xl border shadow-sm',
                                config.bgColor,
                                config.borderColor,
                                size === 'sm'
                                    ? 'gap-1.5 px-2 py-1.5 md:gap-2 md:px-3 md:py-2'
                                    : size === 'md'
                                      ? 'gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-3'
                                      : 'gap-3 px-4 py-3 md:gap-4 md:px-5 md:py-4'
                            )}
                            initial={{ scale: 0.9 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    {/* Animated dots */}
                                    <div className="flex items-center gap-0.5 md:gap-1">
                                        {[0, 1, 2].map((index) => (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.6, 1, 0.6],
                                                }}
                                                className={cn(
                                                    'rounded-full',
                                                    config.dots,
                                                    dotSizes[size]
                                                )}
                                                key={index}
                                                transition={{
                                                    duration: 1.4,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    delay: index * 0.2,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Status icon and message */}
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: 'linear',
                                            }}
                                        >
                                            {' '}
                                            <Icon
                                                className={config.color}
                                                size={size === 'sm' ? 10 : size === 'md' ? 12 : 14}
                                            />
                                        </motion.div>
                                        <span
                                            className={cn(
                                                'font-medium',
                                                config.color,
                                                size === 'sm'
                                                    ? 'text-xs'
                                                    : size === 'md'
                                                      ? 'text-xs md:text-sm'
                                                      : 'text-sm md:text-base'
                                            )}
                                        >
                                            {config.message}
                                        </span>
                                    </div>
                                </div>

                                {/* Elapsed time display */}
                                {showElapsedTime && elapsedTime > 1000 && (
                                    <motion.div
                                        animate={{ opacity: 1 }}
                                        className={cn(
                                            'flex items-center gap-1 rounded-full px-1.5 py-0.5 md:px-2 md:py-1',
                                            'bg-muted/60 border-muted-foreground/10 border',
                                            size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
                                        )}
                                        initial={{ opacity: 0 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <Clock
                                            className="text-muted-foreground"
                                            size={size === 'sm' ? 8 : 10}
                                        />
                                        <span className="text-muted-foreground font-mono">
                                            {formatElapsedTime(elapsedTime)}
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Progress indicator for slow responses */}
                            {(showTimeoutIndicator || isSlowResponse) && (
                                <motion.div
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-1.5 md:mt-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs md:gap-2">
                                        <Loader2 className="animate-spin" size={10} />
                                        <span>
                                            {isSlowResponse
                                                ? 'Large or complex request - please wait...'
                                                : 'Request is taking longer than usual...'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
);

ThreadLoadingIndicator.displayName = 'ThreadLoadingIndicator';
