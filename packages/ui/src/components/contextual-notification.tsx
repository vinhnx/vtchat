'use client';

import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info, X, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const contextualNotificationVariants = cva(
    'inline-flex items-center gap-2 text-sm font-medium transition-all duration-200',
    {
        variants: {
            variant: {
                success: 'text-green-700 dark:text-green-400',
                error: 'text-red-700 dark:text-red-400',
                info: 'text-blue-700 dark:text-blue-400',
                warning: 'text-amber-700 dark:text-amber-400',
            },
            position: {
                inline: '',
                overlay: 'absolute z-10 bg-background/95 backdrop-blur-sm border rounded-md px-2 py-1 shadow-sm',
                tooltip: 'absolute z-20 bg-popover border rounded-md px-2 py-1 shadow-md text-xs',
            },
        },
        defaultVariants: {
            variant: 'info',
            position: 'inline',
        },
    }
);

type ContextualNotificationProps = {
    children: React.ReactNode;
    show: boolean;
    variant?: VariantProps<typeof contextualNotificationVariants>['variant'];
    position?: VariantProps<typeof contextualNotificationVariants>['position'];
    autoHide?: boolean;
    duration?: number;
    className?: string;
    onHide?: () => void;
} & (
    | { position: 'overlay'; overlayOffset?: { x?: number; y?: number } }
    | { position?: Exclude<VariantProps<typeof contextualNotificationVariants>['position'], 'overlay'> }
);

const getIcon = (variant: VariantProps<typeof contextualNotificationVariants>['variant']) => {
    switch (variant) {
        case 'success':
            return <CheckCircle2 size={16} strokeWidth={2} />;
        case 'error':
            return <AlertCircle size={16} strokeWidth={2} />;
        case 'warning':
            return <AlertCircle size={16} strokeWidth={2} />;
        default:
            return <Info size={16} strokeWidth={2} />;
    }
};

export function ContextualNotification({
    children,
    show,
    variant = 'info',
    position = 'inline',
    autoHide = true,
    duration = 2000,
    className,
    onHide,
    ...props
}: ContextualNotificationProps) {
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    useEffect(() => {
        if (autoHide && isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onHide?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoHide, duration, isVisible, onHide]);

    const overlayOffset = 'overlayOffset' in props ? props.overlayOffset : undefined;

    const notificationContent = (
        <span className={cn(contextualNotificationVariants({ variant, position }), className)}>
            {getIcon(variant)}
            {children}
        </span>
    );

    if (position === 'overlay') {
        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        animate={{ opacity: 1, scale: 1 }}
                        className='pointer-events-none'
                        exit={{ opacity: 0, scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        style={{
                            transform: `translate(${overlayOffset?.x || 0}px, ${overlayOffset?.y || -4}px)`,
                        }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        {notificationContent}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    initial={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                    {notificationContent}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Enhanced Button Status Indicator Component
type ButtonStatusProps = {
    status: 'idle' | 'loading' | 'success' | 'error';
    idleIcon?: React.ReactNode;
    loadingIcon?: React.ReactNode;
    successIcon?: React.ReactNode;
    errorIcon?: React.ReactNode;
    successText?: string;
    errorText?: string;
    className?: string;
};

export function ButtonStatusIndicator({
    status,
    idleIcon,
    loadingIcon,
    successIcon = <Check size={16} strokeWidth={2} />,
    errorIcon = <X size={16} strokeWidth={2} />,
    successText = 'Done',
    errorText = 'Failed',
    className,
}: ButtonStatusProps) {
    if (status === 'success') {
        return (
            <motion.span
                animate={{ scale: 1, opacity: 1 }}
                className={cn('inline-flex items-center gap-1 text-green-600 dark:text-green-400', className)}
                initial={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {successIcon}
                {successText && <span className='text-xs'>{successText}</span>}
            </motion.span>
        );
    }

    if (status === 'error') {
        return (
            <motion.span
                animate={{ scale: 1, opacity: 1 }}
                className={cn('inline-flex items-center gap-1 text-red-600 dark:text-red-400', className)}
                initial={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {errorIcon}
                {errorText && <span className='text-xs'>{errorText}</span>}
            </motion.span>
        );
    }

    if (status === 'loading') {
        return (
            <motion.span
                animate={{ rotate: 360 }}
                className={cn('inline-block', className)}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                {loadingIcon || <div className='h-4 w-4 border-2 border-current border-t-transparent rounded-full' />}
            </motion.span>
        );
    }

    return <>{idleIcon}</>;
}

// Contextual Form Field Feedback
type FieldFeedbackProps = {
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
    className?: string;
};

export function FieldFeedback({ status, message, className }: FieldFeedbackProps) {
    if (status === 'idle') return null;

    return (
        <AnimatePresence>
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={cn('mt-1', className)}
                exit={{ opacity: 0, y: -5 }}
                initial={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
            >
                <ContextualNotification
                    autoHide={false}
                    show={true}
                    variant={status === 'valid' ? 'success' : status === 'invalid' ? 'error' : 'info'}
                >
                    {message || (status === 'validating' ? 'Checking...' : status === 'valid' ? 'Valid' : 'Invalid')}
                </ContextualNotification>
            </motion.div>
        </AnimatePresence>
    );
}