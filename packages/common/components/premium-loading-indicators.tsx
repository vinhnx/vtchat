import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Brain, Cpu, Loader2, Sparkles, Zap } from 'lucide-react';
import { memo } from 'react';

interface PremiumTypingIndicatorProps {
    isVisible: boolean;
    variant?: 'default' | 'thinking' | 'processing' | 'generating';
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export const PremiumTypingIndicator = memo(
    ({ isVisible, variant = 'default', size = 'md', message }: PremiumTypingIndicatorProps) => {
        const sizeClasses = {
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
        };

        const containerSizes = {
            sm: 'gap-1 py-2 px-3',
            md: 'gap-2 py-3 px-4',
            lg: 'gap-3 py-4 px-5',
        };

        const getVariantConfig = () => {
            switch (variant) {
                case 'thinking':
                    return {
                        icon: Brain,
                        color: 'text-purple-500',
                        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
                        borderColor: 'border-purple-200 dark:border-purple-800',
                        message: message || 'AI is thinking deeply...',
                        dots: 'bg-purple-500',
                    };
                case 'processing':
                    return {
                        icon: Cpu,
                        color: 'text-blue-500',
                        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                        borderColor: 'border-blue-200 dark:border-blue-800',
                        message: message || 'Processing your request...',
                        dots: 'bg-blue-500',
                    };
                case 'generating':
                    return {
                        icon: Sparkles,
                        color: 'text-green-500',
                        bgColor: 'bg-green-100 dark:bg-green-900/30',
                        borderColor: 'border-green-200 dark:border-green-800',
                        message: message || 'Generating response...',
                        dots: 'bg-green-500',
                    };
                default:
                    return {
                        icon: Bot,
                        color: 'text-gray-500',
                        bgColor: 'bg-gray-100 dark:bg-gray-800',
                        borderColor: 'border-gray-200 dark:border-gray-700',
                        message: message || 'AI is typing...',
                        dots: 'bg-gray-500',
                    };
            }
        };

        const config = getVariantConfig();
        const Icon = config.icon;

        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="flex max-w-sm items-start gap-3"
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {/* Avatar */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 4px 12px rgba(147, 51, 234, 0.25)',
                                    '0 6px 20px rgba(59, 130, 246, 0.35)',
                                    '0 4px 12px rgba(147, 51, 234, 0.25)',
                                ],
                            }}
                            className={cn(
                                'flex flex-shrink-0 items-center justify-center rounded-xl',
                                'bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500',
                                'shadow-md ring-2 ring-white/20',
                                sizeClasses[size] === 'h-3 w-3'
                                    ? 'h-8 w-8'
                                    : sizeClasses[size] === 'h-4 w-4'
                                      ? 'h-10 w-10'
                                      : 'h-12 w-12'
                            )}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <Bot
                                className="text-white"
                                size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                            />
                        </motion.div>

                        {/* Typing bubble */}
                        <motion.div
                            animate={{ scale: 1 }}
                            className={cn(
                                'rounded-2xl border shadow-sm',
                                config.bgColor,
                                config.borderColor,
                                containerSizes[size]
                            )}
                            initial={{ scale: 0.9 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
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
                                                sizeClasses[size]
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
);

interface PremiumLoadingSkeletonProps {
    lines?: number;
    variant?: 'message' | 'card' | 'list';
    animated?: boolean;
}

export const PremiumLoadingSkeleton = memo(
    ({ lines = 3, variant = 'message', animated = true }: PremiumLoadingSkeletonProps) => {
        const baseClasses =
            'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg';

        const animationClasses = animated
            ? 'animate-pulse bg-[length:200%_100%] animate-[shimmer_2s_infinite]'
            : '';

        if (variant === 'card') {
            return (
                <motion.div
                    animate={{ opacity: 1 }}
                    className="space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-700"
                    initial={{ opacity: 0 }}
                >
                    <div className={cn(baseClasses, animationClasses, 'h-6 w-1/3')} />
                    <div className="space-y-3">
                        {Array.from({ length: lines }).map((_, i) => (
                            <div
                                className={cn(
                                    baseClasses,
                                    animationClasses,
                                    'h-4',
                                    i === lines - 1 ? 'w-2/3' : 'w-full'
                                )}
                                key={i}
                            />
                        ))}
                    </div>
                </motion.div>
            );
        }

        if (variant === 'list') {
            return (
                <motion.div animate={{ opacity: 1 }} className="space-y-3" initial={{ opacity: 0 }}>
                    {Array.from({ length: lines }).map((_, i) => (
                        <div className="flex items-center gap-3" key={i}>
                            <div
                                className={cn(
                                    baseClasses,
                                    animationClasses,
                                    'h-10 w-10 rounded-full'
                                )}
                            />
                            <div className="flex-1 space-y-2">
                                <div className={cn(baseClasses, animationClasses, 'h-4 w-1/4')} />
                                <div className={cn(baseClasses, animationClasses, 'h-3 w-3/4')} />
                            </div>
                        </div>
                    ))}
                </motion.div>
            );
        }

        return (
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg space-y-3"
                initial={{ opacity: 0, y: 10 }}
            >
                {Array.from({ length: lines }).map((_, i) => (
                    <motion.div
                        animate={{ width: '100%' }}
                        className={cn(
                            baseClasses,
                            animationClasses,
                            'h-4',
                            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
                        )}
                        initial={{ width: 0 }}
                        key={i}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                    />
                ))}
            </motion.div>
        );
    }
);

interface PremiumProgressIndicatorProps {
    progress: number; // 0-100
    status: string;
    variant?: 'linear' | 'circular';
    size?: 'sm' | 'md' | 'lg';
}

export const PremiumProgressIndicator = memo(
    ({ progress, status, variant = 'linear', size = 'md' }: PremiumProgressIndicatorProps) => {
        if (variant === 'circular') {
            const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (progress / 100) * circumference;

            return (
                <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                >
                    <div className="relative">
                        <svg
                            className={cn(
                                '-rotate-90 transform',
                                size === 'sm'
                                    ? 'h-10 w-10'
                                    : size === 'md'
                                      ? 'h-12 w-12'
                                      : 'h-16 w-16'
                            )}
                            viewBox="0 0 50 50"
                        >
                            <circle
                                className="text-gray-200 dark:text-gray-700"
                                cx="25"
                                cy="25"
                                fill="none"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <motion.circle
                                animate={{ strokeDashoffset }}
                                className="text-blue-500"
                                cx="25"
                                cy="25"
                                fill="none"
                                initial={{ strokeDashoffset: circumference }}
                                r={radius}
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                                style={{
                                    strokeDasharray: circumference,
                                }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className={cn(
                                    'font-bold text-blue-600 dark:text-blue-400',
                                    size === 'sm'
                                        ? 'text-xs'
                                        : size === 'md'
                                          ? 'text-sm'
                                          : 'text-base'
                                )}
                            >
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span
                            className={cn(
                                'font-medium text-gray-900 dark:text-gray-100',
                                size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
                            )}
                        >
                            {status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {progress < 100 ? 'Processing...' : 'Complete!'}
                        </span>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={cn(
                            'font-medium text-gray-900 dark:text-gray-100',
                            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
                        )}
                    >
                        {status}
                    </span>
                    <span
                        className={cn(
                            'font-bold text-blue-600 dark:text-blue-400',
                            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
                        )}
                    >
                        {Math.round(progress)}%
                    </span>
                </div>
                <div
                    className={cn(
                        'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
                        size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4'
                    )}
                >
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </motion.div>
        );
    }
);

PremiumTypingIndicator.displayName = 'PremiumTypingIndicator';
PremiumLoadingSkeleton.displayName = 'PremiumLoadingSkeleton';
PremiumProgressIndicator.displayName = 'PremiumProgressIndicator';
