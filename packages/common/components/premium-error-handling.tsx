import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, 
    RefreshCw, 
    Wifi, 
    WifiOff, 
    AlertCircle,
    CheckCircle2,
    Info,
    X,
    ExternalLink,
    MessageSquare,
    Zap
} from 'lucide-react';
import { Button, cn, Card, CardContent } from '@repo/ui';

interface PremiumErrorBoundaryProps {
    error: Error | string;
    onRetry?: () => void;
    onReport?: () => void;
    variant?: 'inline' | 'card' | 'toast';
    className?: string;
}

export const PremiumErrorBoundary = memo(({
    error,
    onRetry,
    onReport,
    variant = 'card',
    className
}: PremiumErrorBoundaryProps) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const [isExpanded, setIsExpanded] = useState(false);

    const getErrorType = () => {
        if (errorMessage.toLowerCase().includes('network') || 
            errorMessage.toLowerCase().includes('fetch')) {
            return {
                type: 'network',
                title: 'Connection Issue',
                description: 'Unable to connect to our servers. Please check your internet connection.',
                icon: WifiOff,
                color: 'text-orange-500',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                borderColor: 'border-orange-200 dark:border-orange-800'
            };
        }
        
        if (errorMessage.toLowerCase().includes('rate limit') || 
            errorMessage.toLowerCase().includes('quota')) {
            return {
                type: 'rate_limit',
                title: 'Rate Limit Exceeded',
                description: 'You\'ve reached the limit for this feature. Please try again later or upgrade your plan.',
                icon: Zap,
                color: 'text-purple-500',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                borderColor: 'border-purple-200 dark:border-purple-800'
            };
        }
        
        if (errorMessage.toLowerCase().includes('auth') || 
            errorMessage.toLowerCase().includes('unauthorized')) {
            return {
                type: 'auth',
                title: 'Authentication Required',
                description: 'Please sign in to continue using this feature.',
                icon: AlertCircle,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                borderColor: 'border-blue-200 dark:border-blue-800'
            };
        }

        return {
            type: 'general',
            title: 'Something went wrong',
            description: 'An unexpected error occurred. Our team has been notified.',
            icon: AlertTriangle,
            color: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800'
        };
    };

    const errorConfig = getErrorType();
    const Icon = errorConfig.icon;

    if (variant === 'toast') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className={cn(
                    'fixed bottom-4 right-4 z-50 max-w-sm',
                    'rounded-xl border shadow-lg backdrop-blur-sm',
                    errorConfig.bgColor,
                    errorConfig.borderColor,
                    className
                )}
            >
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                            'bg-white/80 dark:bg-gray-800/80'
                        )}>
                            <Icon size={16} className={errorConfig.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {errorConfig.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {errorConfig.description}
                            </p>
                        </div>
                    </div>
                    
                    {onRetry && (
                        <div className="mt-3 flex gap-2">
                            <Button
                                size="xs"
                                onClick={onRetry}
                                className="h-7 px-3 text-xs"
                            >
                                Try Again
                            </Button>
                            {onReport && (
                                <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={onReport}
                                    className="h-7 px-3 text-xs"
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    errorConfig.bgColor,
                    errorConfig.borderColor,
                    className
                )}
            >
                <Icon size={18} className={errorConfig.color} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {errorConfig.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                        {errorConfig.description}
                    </p>
                </div>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={onRetry}
                        className="flex-shrink-0"
                    >
                        <RefreshCw size={12} className="mr-1" />
                        Retry
                    </Button>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={className}
        >
            <Card className={cn(
                'border-2',
                errorConfig.borderColor,
                errorConfig.bgColor
            )}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                            'bg-white/80 dark:bg-gray-800/80 shadow-sm'
                        )}>
                            <Icon size={24} className={errorConfig.color} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                {errorConfig.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {errorConfig.description}
                            </p>
                            
                            {/* Error details (expandable) */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    {isExpanded ? 'Hide' : 'Show'} technical details
                                </button>
                                
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                        >
                                            <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                                                {errorMessage}
                                            </code>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mt-6">
                                {onRetry && (
                                    <Button
                                        onClick={onRetry}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Try Again
                                    </Button>
                                )}
                                
                                {onReport && (
                                    <Button
                                        variant="outline"
                                        onClick={onReport}
                                        className="flex items-center gap-2"
                                    >
                                        <MessageSquare size={16} />
                                        Report Issue
                                    </Button>
                                )}
                                
                                <Button
                                    variant="ghost"
                                    onClick={() => window.open('/help', '_blank')}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
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
});

interface ConnectionStatusProps {
    isOnline: boolean;
    className?: string;
}

export const ConnectionStatus = memo(({ isOnline, className }: ConnectionStatusProps) => {
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowStatus(true);
        } else {
            const timer = setTimeout(() => setShowStatus(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    return (
        <AnimatePresence>
            {showStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
                        'px-4 py-2 rounded-full border shadow-lg backdrop-blur-sm',
                        isOnline 
                            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
                        className
                    )}
                >
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <>
                                <Wifi size={16} />
                                <span className="text-sm font-medium">Connection restored</span>
                            </>
                        ) : (
                            <>
                                <WifiOff size={16} />
                                <span className="text-sm font-medium">No internet connection</span>
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

export const NotificationToast = memo(({
    type,
    title,
    message,
    isVisible,
    onClose,
    duration = 5000
}: NotificationToastProps) => {
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
                    progressColor: 'bg-green-500'
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    progressColor: 'bg-red-500'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                    borderColor: 'border-orange-200 dark:border-orange-800',
                    progressColor: 'bg-orange-500'
                };
            default:
                return {
                    icon: Info,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    progressColor: 'bg-blue-500'
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className={cn(
                        'fixed bottom-4 right-4 z-50 max-w-sm',
                        'rounded-xl border shadow-lg backdrop-blur-sm overflow-hidden',
                        config.bgColor,
                        config.borderColor
                    )}
                >
                    {/* Progress bar */}
                    {duration > 0 && (
                        <motion.div
                            className={cn('h-1', config.progressColor)}
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                        />
                    )}

                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                                'bg-white/80 dark:bg-gray-800/80'
                            )}>
                                <Icon size={16} className={config.color} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    {title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {message}
                                </p>
                            </div>
                            
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onClose}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

PremiumErrorBoundary.displayName = 'PremiumErrorBoundary';
ConnectionStatus.displayName = 'ConnectionStatus';
NotificationToast.displayName = 'NotificationToast';
