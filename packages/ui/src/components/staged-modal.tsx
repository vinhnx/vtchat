'use client';

import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';
import { 
    createStaging, 
    createFollowThrough, 
    createSecondaryAction,
    ANIMATION_DURATION, 
    EASING, 
    STAGGER_DELAY 
} from '../lib/animation-utils';
import { Button } from './button';

interface StagedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

// PRINCIPLE 3: STAGING - Sequential appearance prioritizing importance
const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            duration: ANIMATION_DURATION.normal / 1000,
            ease: EASING.easeOut 
        }
    },
    exit: { 
        opacity: 0,
        transition: { 
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.easeIn 
        }
    },
};

// Stage 2: Modal container slides in with backdrop blur
const containerVariants: Variants = {
    hidden: { 
        opacity: 0, 
        scale: 0.95, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
            delay: 0.1, // After backdrop
            duration: ANIMATION_DURATION.normal / 1000,
            ease: EASING.spring,
            staggerChildren: STAGGER_DELAY.tight / 1000,
            delayChildren: 0.2,
        }
    },
    exit: { 
        opacity: 0, 
        scale: 0.9, 
        y: -10,
        transition: { 
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.easeIn,
            staggerChildren: 0.05,
            staggerDirection: -1,
        }
    },
};

// Stage 3: Header elements appear in priority order
const headerVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.easeOut 
        }
    },
    exit: { opacity: 0, y: -5 },
};

// Stage 4: Content with follow-through animation
const contentVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: ANIMATION_DURATION.normal / 1000,
            ease: EASING.easeOut,
            delay: 0.05, // Slight delay after header
        }
    },
    exit: { opacity: 0, y: 10 },
};

// Stage 5: Close button appears last with secondary action
const closeButtonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
            delay: 0.1, // After content
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.spring,
        }
    },
    exit: { opacity: 0, scale: 0.9 },
};

// PRINCIPLE 5: FOLLOW THROUGH - List items cascade naturally
const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER_DELAY.tight / 1000,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
        },
    },
};

const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -10, scale: 0.98 },
    visible: { 
        opacity: 1, 
        x: 0, 
        scale: 1,
        transition: { 
            duration: ANIMATION_DURATION.quick / 1000,
            ease: EASING.easeOut 
        }
    },
    exit: { 
        opacity: 0, 
        x: -5, 
        scale: 0.95,
        transition: { 
            duration: ANIMATION_DURATION.quick / 1000 
        }
    },
};

export function StagedModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    className,
}: StagedModalProps) {
    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }[size];

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* STAGE 1: Backdrop with blur effect */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* STAGE 2: Modal container with staging */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                            'relative w-full bg-background rounded-lg shadow-xl border',
                            'max-h-[90vh] overflow-hidden flex flex-col',
                            sizeClasses,
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* STAGE 3: Header with priority staging */}
                        <motion.header 
                            variants={headerVariants}
                            className="flex items-center justify-between p-6 border-b"
                        >
                            <div className="space-y-1">
                                {title && (
                                    <motion.h2 
                                        variants={headerVariants}
                                        className="text-lg font-semibold"
                                    >
                                        {title}
                                    </motion.h2>
                                )}
                                {description && (
                                    <motion.p 
                                        variants={headerVariants}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {description}
                                    </motion.p>
                                )}
                            </div>

                            {/* STAGE 5: Close button with secondary action */}
                            <motion.div variants={closeButtonVariants}>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={onClose}
                                    className="rounded-full"
                                    animationType="secondary"
                                    {...createSecondaryAction('sparkle')}
                                >
                                    <X size={16} />
                                </Button>
                            </motion.div>
                        </motion.header>

                        {/* STAGE 4: Content with follow-through */}
                        <motion.div 
                            variants={contentVariants}
                            className="flex-1 overflow-auto p-6"
                        >
                            {/* If children is an array, apply staggered animation */}
                            {React.Children.count(children) > 1 ? (
                                <motion.div
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-4"
                                >
                                    {React.Children.map(children, (child, index) => (
                                        <motion.div
                                            key={index}
                                            variants={listItemVariants}
                                        >
                                            {child}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                children
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Example usage component demonstrating all principles
export function ExampleStagedModal() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="p-8 space-y-4">
            <Button onClick={() => setIsOpen(true)} animationType="squash">
                Open Staged Modal
            </Button>

            <StagedModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="12 Principles of Animation"
                description="Demonstrating staging, follow-through, and secondary actions"
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-sm">
                        This modal demonstrates the <strong>staging principle</strong> by showing 
                        elements in order of importance: backdrop → container → header → content → actions.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Timing</h4>
                            <p className="text-sm text-muted-foreground">
                                Elements appear with proper delays under 300ms
                            </p>
                        </div>
                        
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Easing</h4>
                            <p className="text-sm text-muted-foreground">
                                Natural easing curves for organic motion
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsOpen(false)}
                            animationType="gentle"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => setIsOpen(false)}
                            animationType="secondary"
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </StagedModal>
        </div>
    );
}