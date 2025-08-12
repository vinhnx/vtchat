import { Button, Card, CardContent, cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Info,
    MessageSquare,
    RefreshCw,
    Wifi,
    WifiOff,
    X,
    Zap,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface PremiumErrorBoundaryProps {
    error: Error | string;
    onRetry?: () => void;
    onReport?: () => void;
    variant?: 'inline' | 'card' | 'toast';
    className?: string;
}

export const PremiumErrorBoundary = memo(
    ({ error, onRetry, onReport, variant = 'card', className }: PremiumErrorBoundaryProps) => {
        const errorMessage = typeof error === 'string' ? error : error.message;
        const [isExpanded, setIsExpanded] = useState(false);

        const getErrorType = () => {
            if (
                errorMessage.toLowerCase().includes('network')
                || errorMessage.toLowerCase().includes('fetch')
            ) {
                return {
                    type: 'network',
                    title: 'Connection Issue',
                    description:
                        'Unable to connect to our servers. Please check your internet connection.',
                    icon: WifiOff,
                    color: 'text-orange-500',
                    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                    borderColor: 'border-orange-200 dark:border-orange-800',
                };
            }

            if (
                errorMessage.toLowerCase().includes('rate limit')
                || errorMessage.toLowerCase().includes('quota')
            ) {
                return {
                    type: 'rate_limit',
                    title: 'Rate Limit Exceeded',
                    description:
                        "You've reached the limit for this feature. Please try again later or upgrade your plan.",
                    icon: Zap,
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                    borderColor: 'border-purple-200 dark:border-purple-800',
                };
            }

            if (
                errorMessage.toLowerCase().includes('auth')
                || errorMessage.toLowerCase().includes('unauthorized')
            ) {
                return {
                    type: 'auth',
                    title: 'Authentication Required',
                    description: 'Please sign in to continue using this feature.',
                    icon: AlertCircle,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                };
            }

            return {
                type: 'general',
                title: 'Something went wrong',
                description: 'An unexpected error occurred. Our team has been notified.',
                icon: AlertTriangle,
                color: 'text-red-500',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                borderColor: 'border-red-200 dark:border-red-800',
            };
        };

        const errorConfig = getErrorType();
        const Icon = errorConfig.icon;

        if (variant === 'toast') {
            return (
                <motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                        'fixed bottom-4 right-4 z-50 max-w-sm',
                        'rounded-xl border shadow-lg backdrop-blur-sm',
                        errorConfig.bgColor,
                        errorConfig.borderColor,
                        className,
                    )}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                >
                    <div className='p-4'>
                        <div className='flex items-start gap-3'>
                            <div
                                className={cn(
                                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                                    'bg-white/80 dark:bg-gray-800/80',
                                )}
                            >
                                <Icon className={errorConfig.color} size={16} />
                            </div>
                            <div className='min-w-0 flex-1'>
                                <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                    {errorConfig.title}
                                </h4>
                                <p className='text-muted-foreground mt-1 text-xs'>
                                    {errorConfig.description}
                                </p>
                            </div>
                        </div>

                        {onRetry && (
                            <div className='mt-3 flex gap-2'>
                                <Button className='h-7 px-3 text-xs' onClick={onRetry} size='xs'>
                                    Try Again
                                </Button>
                                {onReport && (
                                    <Button
                                        className='h-7 px-3 text-xs'
                                        onClick={onReport}
                                        size='xs'
                                        variant='outline'
                                    >
                                        Report
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            );
        }

        if (variant === 'inline') {
            return (
                <motion.div
                    animate={{ opacity: 1, height: 'auto' }}
                    className={cn(
                        'flex items-center gap-3 rounded-lg border p-3',
                        errorConfig.bgColor,
                        errorConfig.borderColor,
                        className,
                    )}
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                >
                    <Icon className={errorConfig.color} size={18} />
                    <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                            {errorConfig.title}
                        </p>
                        <p className='text-muted-foreground text-xs'>{errorConfig.description}</p>
                    </div>
                    {onRetry && (
                        <Button
                            className='flex-shrink-0'
                            onClick={onRetry}
                            size='xs'
                            variant='outline'
                        >
                            <RefreshCw className='mr-1' size={12} />
                            Retry
                        </Button>
                    )}
                </motion.div>
            );
        }

        return (
            <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className={className}
                initial={{ opacity: 0, scale: 0.95 }}
            >
                <Card className={cn('border-2', errorConfig.borderColor, errorConfig.bgColor)}>
                    <CardContent className='p-6'>
                        <div className='flex items-start gap-4'>
                            <div
                                className={cn(
                                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
                                    'bg-white/80 shadow-sm dark:bg-gray-800/80',
                                )}
                            >
                                <Icon className={errorConfig.color} size={24} />
                            </div>

                            <div className='min-w-0 flex-1'>
                                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                    {errorConfig.title}
                                </h3>
                                <p className='text-muted-foreground mt-1'>
                                    {errorConfig.description}
                                </p>

                                {/* Error details (expandable) */}
                                <div className='mt-4'>
                                    <button
                                        className='text-muted-foreground hover:text-foreground text-sm transition-colors'
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        {isExpanded ? 'Hide' : 'Show'} technical details
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className='mt-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-800'
                                                exit={{ opacity: 0, height: 0 }}
                                                initial={{ opacity: 0, height: 0 }}
                                            >
                                                <code className='text-muted-foreground break-all text-xs'>
                                                    {errorMessage}
                                                </code>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Action buttons */}
                                <div className='mt-6 flex items-center gap-3'>
                                    {onRetry && (
                                        <Button
                                            className='flex items-center gap-2'
                                            onClick={onRetry}
                                        >
                                            <RefreshCw size={16} />
                                            Try Again
                                        </Button>
                                    )}

                                    {onReport && (
                                        <Button
                                            className='flex items-center gap-2'
                                            onClick={onReport}
                                            variant='outline'
                                        >
                                            <MessageSquare size={16} />
                                            Report Issue
                                        </Button>
                                    )}

                                    <Button
                                        className='text-muted-foreground hover:text-foreground flex items-center gap-2'
                                        onClick={() => window.open('/help', '_blank')}
                                        variant='ghost'
                                    >
                                        <ExternalLink size={16} />
                                        Get Help
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    },
);

interface ConnectionStatusProps {
    isOnline: boolean;
    className?: string;
}

export const ConnectionStatus = memo(({ isOnline, className }: ConnectionStatusProps) => {
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        if (isOnline) {
            const timer = setTimeout(() => setShowStatus(false), 3000);
            return () => clearTimeout(timer);
        }
        setShowStatus(true);
    }, [isOnline]);

    return (
        <AnimatePresence>
            {showStatus && (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'fixed left-1/2 top-4 z-50 -translate-x-1/2 transform',
                        'rounded-full border px-4 py-2 shadow-lg backdrop-blur-sm',
                        isOnline
                            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
                        className,
                    )}
                    exit={{ opacity: 0, y: -20 }}
                    initial={{ opacity: 0, y: -20 }}
                >
                    <div className='flex items-center gap-2'>
                        {isOnline
                            ? (
                                <>
                                    <Wifi size={16} />
                                    <span className='text-sm font-medium'>Connection restored</span>
                                </>
                            )
                            : (
                                <>
                                    <WifiOff size={16} />
                                    <span className='text-sm font-medium'>
                                        No internet connection
                                    </span>
                                </>
                            )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

interface NotificationToastProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const NotificationToast = memo(
    ({ type, title, message, isVisible, onClose, duration = 5000 }: NotificationToastProps) => {
        useEffect(() => {
            if (isVisible && duration > 0) {
                const timer = setTimeout(onClose, duration);
                return () => clearTimeout(timer);
            }
        }, [isVisible, duration, onClose]);

        const getConfig = () => {
            switch (type) {
                case 'success':
                    return {
                        icon: CheckCircle2,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50 dark:bg-green-900/20',
                        borderColor: 'border-green-200 dark:border-green-800',
                        progressColor: 'bg-green-500',
                    };
                case 'error':
                    return {
                        icon: AlertCircle,
                        color: 'text-red-600',
                        bgColor: 'bg-red-50 dark:bg-red-900/20',
                        borderColor: 'border-red-200 dark:border-red-800',
                        progressColor: 'bg-red-500',
                    };
                case 'warning':
                    return {
                        icon: AlertTriangle,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                        borderColor: 'border-orange-200 dark:border-orange-800',
                        progressColor: 'bg-orange-500',
                    };
                default:
                    return {
                        icon: Info,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                        borderColor: 'border-blue-200 dark:border-blue-800',
                        progressColor: 'bg-blue-500',
                    };
            }
        };

        const config = getConfig();
        const Icon = config.icon;

        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                            'fixed bottom-4 right-4 z-50 max-w-sm',
                            'overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm',
                            config.bgColor,
                            config.borderColor,
                        )}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    >
                        {/* Progress bar */}
                        {duration > 0 && (
                            <motion.div
                                animate={{ width: '0%' }}
                                className={cn('h-1', config.progressColor)}
                                initial={{ width: '100%' }}
                                transition={{ duration: duration / 1000, ease: 'linear' }}
                            />
                        )}

                        <div className='p-4'>
                            <div className='flex items-start gap-3'>
                                <div
                                    className={cn(
                                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                                        'bg-white/80 dark:bg-gray-800/80',
                                    )}
                                >
                                    <Icon className={config.color} size={16} />
                                </div>

                                <div className='min-w-0 flex-1'>
                                    <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                        {title}
                                    </h4>
                                    <p className='text-muted-foreground mt-1 text-xs'>{message}</p>
                                </div>

                                <Button
                                    className='text-muted-foreground hover:text-foreground flex-shrink-0'
                                    onClick={onClose}
                                    size='icon-sm'
                                    variant='ghost'
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    },
);

PremiumErrorBoundary.displayName = 'PremiumErrorBoundary';
ConnectionStatus.displayName = 'ConnectionStatus';
NotificationToast.displayName = 'NotificationToast';
