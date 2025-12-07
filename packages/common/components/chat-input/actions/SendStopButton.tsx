'use client';

import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import { ANIMATION_DURATION, createAnticipation, EASING } from '@repo/ui/src/lib/animation-utils';
import { cn } from '@repo/ui/src/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Clock, Square } from 'lucide-react';
import { ZRotationLoader } from '../../z-rotation-loader'; // Import ZRotationLoader
import { ICON_SIZES } from '../config/constants';

interface SendStopButtonProps {
    isGenerating: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}

export function SendStopButton({
    isGenerating,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: SendStopButtonProps) {
    const showTimeoutIndicator = useChatStore((state) => state.showTimeoutIndicator);
    const generationStartTime = useChatStore((state) => state.generationStartTime);

    // Calculate dynamic tooltip based on generation state
    const getStopTooltip = () => {
        if (!isGenerating) return 'Stop Generation';

        if (showTimeoutIndicator) {
            return 'Generation taking longer than usual - Click to stop';
        }

        const elapsedSeconds = generationStartTime
            ? Math.floor((Date.now() - generationStartTime) / 1000)
            : 0;

        if (elapsedSeconds > 3) {
            return `Stop Generation (${elapsedSeconds}s)`;
        }

        return 'Stop Generation';
    };

    // PRINCIPLE 2: ANTICIPATION - Create anticipatory variants
    const anticipationVariants = createAnticipation('up');

    return (
        <div className='flex flex-row items-center gap-2'>
            <AnimatePresence initial={false} mode='wait'>
                {isGenerating
                    ? (
                        <motion.div
                            variants={{
                                initial: { scale: 0.9, opacity: 0, y: 5 },
                                animate: {
                                    scale: 1,
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: ANIMATION_DURATION.normal / 1000,
                                        ease: EASING.spring,
                                    },
                                },
                                exit: {
                                    scale: 0.8,
                                    opacity: 0,
                                    y: -5,
                                    transition: {
                                        duration: ANIMATION_DURATION.quick / 1000,
                                        ease: EASING.easeIn,
                                    },
                                },
                            }}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            key='stop-button'
                        >
                            <Button
                                aria-label='Stop Generation'
                                onClick={stopGeneration}
                                size='icon-sm'
                                tooltip={getStopTooltip()}
                                variant={showTimeoutIndicator ? 'destructive' : 'default'}
                                className={cn(
                                    'transition-all duration-200',
                                    showTimeoutIndicator
                                        ? 'hover:bg-destructive/90'
                                        : 'hover:bg-muted-foreground/10',
                                )}
                                animationType='squash'
                            >
                                {/* Use ZRotationLoader for the stop button animation */}
                                {showTimeoutIndicator
                                    ? <Clock size={ICON_SIZES.small} strokeWidth={2} />
                                    : isGenerating
                                    ? <ZRotationLoader size='xs' speed='fast' />
                                    : <Square size={ICON_SIZES.small} strokeWidth={2} />}
                            </Button>
                        </motion.div>
                    )
                    : (
                        <motion.div
                            variants={{
                                ...anticipationVariants,
                                animate: {
                                    ...anticipationVariants.animate,
                                    // PRINCIPLE 12: APPEAL - Slight float when ready
                                    y: hasTextInput ? [0, -1, 0] : 0,
                                    transition: {
                                        ...anticipationVariants.animate?.transition,
                                        y: hasTextInput
                                            ? {
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: 'easeInOut',
                                            }
                                            : {},
                                    },
                                },
                            }}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            key='send-button'
                        >
                            <Button
                                aria-label='Send Message'
                                disabled={!hasTextInput}
                                onClick={(e) => {
                                    e.preventDefault();
                                    sendMessage();
                                }}
                                size='icon-sm'
                                tooltip='Send Message'
                                variant='default'
                                className={cn(
                                    'hover:bg-muted-foreground/10 transition-all duration-200',
                                    hasTextInput && 'hover:shadow-lg hover:shadow-primary/20',
                                )}
                                animationType='secondary'
                            >
                                {/* PRINCIPLE 2: ANTICIPATION - Arrow shows readiness with slight prep */}
                                <motion.div
                                    animate={hasTextInput
                                        ? {
                                            y: [-0.5, 0.5, -0.5],
                                            transition: {
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: 'easeInOut',
                                            },
                                        }
                                        : {}}
                                >
                                    <ArrowUp size={ICON_SIZES.small} strokeWidth={2} />
                                </motion.div>
                            </Button>
                        </motion.div>
                    )}
            </AnimatePresence>
        </div>
    );
}
