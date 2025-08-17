'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Clock, Info, Loader2, X } from 'lucide-react';
import React from 'react';
import { cn } from '../lib/utils';

const contextualStatusVariants = cva(
    'inline-flex items-center gap-2 text-sm font-medium transition-all duration-200',
    {
        variants: {
            variant: {
                idle: 'text-muted-foreground',
                loading: 'text-blue-600 dark:text-blue-400',
                success: 'text-green-600 dark:text-green-400',
                error: 'text-red-600 dark:text-red-400',
                warning: 'text-amber-600 dark:text-amber-400',
                info: 'text-blue-600 dark:text-blue-400',
            },
            size: {
                sm: 'text-xs',
                default: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'idle',
            size: 'default',
        },
    },
);

const getStatusIcon = (
    variant: VariantProps<typeof contextualStatusVariants>['variant'],
    size = 16,
) => {
    switch (variant) {
        case 'loading':
            return <Loader2 size={size} className='animate-spin' strokeWidth={2} />;
        case 'success':
            return <Check size={size} strokeWidth={2} />;
        case 'error':
            return <X size={size} strokeWidth={2} />;
        case 'warning':
            return <AlertCircle size={size} strokeWidth={2} />;
        case 'info':
            return <Info size={size} strokeWidth={2} />;
        default:
            return <Clock size={size} strokeWidth={2} />;
    }
};

type ContextualStatusProps = {
    status: VariantProps<typeof contextualStatusVariants>['variant'];
    message?: string;
    size?: VariantProps<typeof contextualStatusVariants>['size'];
    className?: string;
    showIcon?: boolean;
    customIcon?: React.ReactNode;
};

export function ContextualStatus({
    status = 'idle',
    message,
    size = 'default',
    className,
    showIcon = true,
    customIcon,
}: ContextualStatusProps) {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
        <AnimatePresence mode='wait'>
            <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className={cn(contextualStatusVariants({ variant: status, size }), className)}
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                key={status}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {showIcon && (
                    <motion.span
                        animate={{ rotate: status === 'loading' ? 360 : 0 }}
                        transition={{
                            duration: status === 'loading' ? 1 : 0.2,
                            repeat: status === 'loading' ? Infinity : 0,
                            ease: status === 'loading' ? 'linear' : 'easeOut',
                        }}
                    >
                        {customIcon || getStatusIcon(status, iconSize)}
                    </motion.span>
                )}
                {message && <span>{message}</span>}
            </motion.div>
        </AnimatePresence>
    );
}

// Progress Status Component for multi-step processes
type ProgressStatusProps = {
    steps: Array<{
        id: string;
        label: string;
        status: 'pending' | 'loading' | 'completed' | 'error';
        message?: string;
    }>;
    currentStep?: string;
    className?: string;
    compact?: boolean;
};

export function ProgressStatus({
    steps,
    currentStep,
    className,
    compact = false,
}: ProgressStatusProps) {
    if (compact) {
        const activeStep = steps.find(step => step.id === currentStep)
            || steps.find(step => step.status === 'loading');

        if (!activeStep) return null;

        return (
            <ContextualStatus
                status={activeStep.status === 'loading'
                    ? 'loading'
                    : activeStep.status === 'completed'
                    ? 'success'
                    : 'error'}
                message={activeStep.message || activeStep.label}
                className={className}
            />
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            {steps.map((step) => (
                <motion.div
                    key={step.id}
                    animate={{ opacity: step.status === 'pending' ? 0.5 : 1 }}
                    className='flex items-center gap-3'
                    transition={{ duration: 0.2 }}
                >
                    <ContextualStatus
                        status={step.status === 'loading'
                            ? 'loading'
                            : step.status === 'completed'
                            ? 'success'
                            : step.status === 'error'
                            ? 'error'
                            : 'idle'}
                        message={step.label}
                        size='sm'
                    />
                    {step.message && step.message !== step.label && (
                        <span className='text-xs text-muted-foreground'>{step.message}</span>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// Real-time Status Indicator for live operations
type LiveStatusProps = {
    isActive: boolean;
    activeMessage: string;
    inactiveMessage?: string;
    variant?: 'pulse' | 'subtle' | 'prominent';
    className?: string;
};

export function LiveStatus({
    isActive,
    activeMessage,
    inactiveMessage = 'Ready',
    variant = 'subtle',
    className,
}: LiveStatusProps) {
    return (
        <motion.div
            animate={{
                opacity: variant === 'prominent' && isActive ? [0.7, 1, 0.7] : 1,
                scale: variant === 'pulse' && isActive ? [1, 1.05, 1] : 1,
            }}
            className={cn('inline-flex items-center gap-2', className)}
            transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
                ease: 'easeInOut',
            }}
        >
            <motion.div
                animate={{
                    backgroundColor: isActive
                        ? ['#10b981', '#059669', '#10b981']
                        : '#6b7280',
                }}
                className='w-2 h-2 rounded-full'
                transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeInOut',
                }}
            />
            <span
                className={cn(
                    'text-sm font-medium transition-colors',
                    isActive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground',
                )}
            >
                {isActive ? activeMessage : inactiveMessage}
            </span>
        </motion.div>
    );
}
