'use client';

import { useChatStore } from '@repo/common/store';
import { GENERATION_TIMEOUTS, TIMEOUT_MESSAGES } from '@repo/shared/constants';
import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

// Simple VT icon component
const VTIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="-7.5 0 32 32"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect fill="#000000" height={32} width={32} x={-7.5} y={0} rx={6} />
        <path
            d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z"
            fill="white"
            strokeWidth={1}
        />
    </svg>
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
            sm: 'h-8 w-8',
            md: 'h-10 w-10',
            lg: 'h-12 w-12',
        };

        const iconSizes = {
            sm: 16,
            md: 20,
            lg: 24,
        };

        const dotSizes = {
            sm: 'w-2 h-2',
            md: 'w-3 h-3',
            lg: 'w-4 h-4',
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
                        className={cn('flex w-full items-start gap-3', className)}
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
                                'flex flex-shrink-0 items-center justify-center rounded-xl relative',
                                'bg-muted border border-muted-foreground/20',
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
                                    'absolute -top-1 -right-1 rounded-full',
                                    'bg-muted-foreground/40',
                                    size === 'sm'
                                        ? 'w-3 h-3'
                                        : size === 'md'
                                          ? 'w-4 h-4'
                                          : 'w-5 h-5'
                                )}
                                transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'easeInOut',
                                }}
                            >
                                <div className="w-full h-full rounded-full bg-background/60" />
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Loading Content */}
                        <motion.div
                            animate={{ scale: 1 }}
                            className={cn(
                                'rounded-2xl border shadow-sm flex-1',
                                config.bgColor,
                                config.borderColor,
                                size === 'sm'
                                    ? 'gap-2 py-2 px-3'
                                    : size === 'md'
                                      ? 'gap-3 py-3 px-4'
                                      : 'gap-4 py-4 px-5'
                            )}
                            initial={{ scale: 0.9 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Animated dots */}
                                    <div className="flex items-center gap-1">
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
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: 'linear',
                                            }}
                                        >
                                            <Icon
                                                className={config.color}
                                                size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                                            />
                                        </motion.div>
                                        <span
                                            className={cn(
                                                'font-medium',
                                                config.color,
                                                size === 'sm'
                                                    ? 'text-xs'
                                                    : size === 'md'
                                                      ? 'text-sm'
                                                      : 'text-base'
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
                                            'flex items-center gap-1 px-2 py-1 rounded-full',
                                            'bg-muted/60 border border-muted-foreground/10',
                                            size === 'sm' ? 'text-xs' : 'text-sm'
                                        )}
                                        initial={{ opacity: 0 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <Clock
                                            className="text-muted-foreground"
                                            size={size === 'sm' ? 10 : 12}
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
                                    className="mt-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="animate-spin" size={12} />
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
