'use client';

import { motion, type Variants } from 'framer-motion';
import { CheckCircle, X, AlertTriangle, Info, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';
import { 
    createAnticipation, 
    createFollowThrough, 
    createSecondaryAction, 
    createExaggeration, 
    ANIMATION_DURATION,
    EASING 
} from '../lib/animation-utils';

// Toast types with different animation behaviors
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AnimatedToastProps {
    type: ToastType;
    title: string;
    description?: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

// PRINCIPLE 3: STAGING - Sequential appearance of elements
const containerVariants: Variants = {
    hidden: { 
        opacity: 0, 
        scale: 0.8, 
        y: -50,
        transition: { duration: 0.2 }
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: ANIMATION_DURATION.normal / 1000,
            ease: EASING.spring,
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        x: 300, // Slide out to the right
        transition: {
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.easeIn,
        },
    },
};

// PRINCIPLE 5: FOLLOW THROUGH & OVERLAPPING ACTION - Icon and content animate separately
const iconVariants: Variants = {
    hidden: { 
        scale: 0,
        rotate: -180,
    },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.1,
        },
    },
};

// PRINCIPLE 8: SECONDARY ACTION - Subtle background pulse for success
const backgroundVariants: Variants = {
    success: {
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(22, 163, 74)', 'rgb(34, 197, 94)'],
        transition: {
            duration: 2,
            repeat: 1,
            ease: 'easeInOut',
        },
    },
};

// PRINCIPLE 10: EXAGGERATION - Error shakes, success bounces
const getExaggeratedMotion = (type: ToastType): Variants => {
    switch (type) {
        case 'error':
            return createExaggeration('error');
        case 'success':
            return createExaggeration('success');
        case 'warning':
            return createExaggeration('attention');
        default:
            return {};
    }
};

// Get icon and colors based on type
const getToastConfig = (type: ToastType) => {
    const configs = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-500',
            textColor: 'text-green-50',
            borderColor: 'border-green-400',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-500',
            textColor: 'text-red-50',
            borderColor: 'border-red-400',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-500',
            textColor: 'text-yellow-50',
            borderColor: 'border-yellow-400',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-500',
            textColor: 'text-blue-50',
            borderColor: 'border-blue-400',
        },
    };
    return configs[type];
};

export function AnimatedToast({
    type,
    title,
    description,
    isVisible,
    onClose,
    duration = 4000,
    position = 'top-right',
}: AnimatedToastProps) {
    const config = getToastConfig(type);
    const Icon = config.icon;
    
    // Auto-close timer
    React.useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getPositionClasses = () => {
        const positions = {
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-center': 'top-4 left-1/2 -translate-x-1/2',
        };
        return positions[position];
    };

    return (
        <motion.div
            className={cn(
                'fixed z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
                'max-w-md w-full pointer-events-auto',
                config.bgColor,
                config.textColor,
                config.borderColor,
                getPositionClasses()
            )}
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            exit="exit"
            {...getExaggeratedMotion(type)}
        >
            {/* PRINCIPLE 2: ANTICIPATION - Icon appears with slight delay and rotation */}
            <motion.div
                variants={iconVariants}
                className="flex-shrink-0 mt-0.5"
            >
                <Icon size={20} />
            </motion.div>

            {/* PRINCIPLE 5: FOLLOW THROUGH - Content slides in after icon */}
            <motion.div 
                className="flex-1 space-y-1"
                variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { 
                            delay: 0.15, 
                            duration: ANIMATION_DURATION.normal / 1000,
                            ease: EASING.easeOut
                        }
                    },
                }}
            >
                <h4 className="text-sm font-semibold">{title}</h4>
                {description && (
                    <p className="text-sm opacity-90">{description}</p>
                )}
            </motion.div>

            {/* PRINCIPLE 8: SECONDARY ACTION - Close button with hover effect */}
            <motion.button
                className="flex-shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors"
                onClick={onClose}
                variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: 0.2 }
                    },
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                {...createSecondaryAction('sparkle')}
            >
                <X size={16} />
            </motion.button>
        </motion.div>
    );
}

// PRINCIPLE 9: TIMING - Toast manager with proper sequencing
export function ToastContainer({ 
    toasts 
}: { 
    toasts: Array<AnimatedToastProps & { id: string }> 
}) {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <motion.div
                    key={toast.id}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ 
                        y: index * 80, // Stack toasts with proper spacing
                        opacity: 1,
                        transition: {
                            delay: index * 0.1, // PRINCIPLE 5: Staggered appearance
                            duration: ANIMATION_DURATION.normal / 1000,
                            ease: EASING.spring,
                        }
                    }}
                    exit={{ 
                        x: 300, 
                        opacity: 0,
                        transition: {
                            duration: ANIMATION_DURATION.quick / 1000,
                        }
                    }}
                    className="absolute"
                    style={{ 
                        top: toast.position?.includes('top') ? '1rem' : 'auto',
                        bottom: toast.position?.includes('bottom') ? '1rem' : 'auto',
                        right: toast.position?.includes('right') ? '1rem' : 'auto',
                        left: toast.position?.includes('left') ? '1rem' : 'auto',
                    }}
                >
                    <AnimatedToast {...toast} />
                </motion.div>
            ))}
        </div>
    );
}

// Hook for managing toast state with animations
export function useAnimatedToast() {
    const [toasts, setToasts] = React.useState<Array<AnimatedToastProps & { id: string }>>([]);

    const showToast = React.useCallback((toast: Omit<AnimatedToastProps, 'isVisible' | 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = {
            ...toast,
            id,
            isVisible: true,
            onClose: () => {
                setToasts(prev => prev.filter(t => t.id !== id));
            },
        };
        
        setToasts(prev => [...prev, newToast]);
    }, []);

    const clearToasts = React.useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        clearToasts,
        success: (title: string, description?: string) => 
            showToast({ type: 'success', title, description }),
        error: (title: string, description?: string) => 
            showToast({ type: 'error', title, description }),
        warning: (title: string, description?: string) => 
            showToast({ type: 'warning', title, description }),
        info: (title: string, description?: string) => 
            showToast({ type: 'info', title, description }),
    };
}