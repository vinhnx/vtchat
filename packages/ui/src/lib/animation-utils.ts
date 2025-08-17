'use client';

import { type MotionProps, type Variants } from 'framer-motion';
import {
    ANIMATION_DURATION,
    ANTICIPATION,
    EASING,
    EXAGGERATION,
    FOLLOW_THROUGH,
    MOTION_VARIANTS as MOTION_VARIANTS_CONST,
    REDUCED_MOTION_VARIANTS,
    STAGGER_DELAY,
} from './animation-constants';

// Re-export constants for convenience
export { ANIMATION_DURATION, EASING, STAGGER_DELAY } from './animation-constants';

/**
 * PRINCIPLE 1: SQUASH & STRETCH
 * Creates deformation effects to convey weight and impact
 */
export function createSquashStretch(
    intensity: 'subtle' | 'moderate' | 'strong' = 'subtle',
): MotionProps {
    const deformation = {
        subtle: { scaleX: 1.02, scaleY: 0.98 },
        moderate: { scaleX: 1.05, scaleY: 0.95 },
        strong: { scaleX: 1.1, scaleY: 0.9 },
    }[intensity];

    return {
        whileTap: deformation,
        transition: { duration: 0.1, ease: EASING.easeOut },
    };
}

/**
 * PRINCIPLE 2: ANTICIPATION
 * Prepares user for upcoming action with subtle pre-movement
 */
export function createAnticipation(
    direction: 'up' | 'down' | 'left' | 'right' | 'scale' = 'scale',
): Variants {
    const prep = {
        up: { y: ANTICIPATION.translatePrep },
        down: { y: -ANTICIPATION.translatePrep },
        left: { x: ANTICIPATION.translatePrep },
        right: { x: -ANTICIPATION.translatePrep },
        scale: { scale: ANTICIPATION.scalePrep },
    }[direction];

    return {
        initial: { opacity: 0 },
        anticipate: { ...prep, opacity: ANTICIPATION.opacityPrep },
        animate: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.spring },
        },
        exit: { opacity: 0 },
    };
}

/**
 * PRINCIPLE 3: STAGING
 * Focuses attention by sequencing element appearances
 */
export function createStaging(
    delay: keyof typeof STAGGER_DELAY = 'normal',
    priority: 'primary' | 'secondary' | 'tertiary' = 'primary',
): Variants {
    const delayValue = STAGGER_DELAY[delay];
    const priorityDelay = {
        primary: 0,
        secondary: delayValue,
        tertiary: delayValue * 2,
    }[priority];

    return {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                delay: priorityDelay / 1000,
                duration: ANIMATION_DURATION.normal / 1000,
                ease: EASING.easeOut,
            },
        },
        exit: { opacity: 0, y: -10 },
    };
}

/**
 * PRINCIPLE 4: STRAIGHT AHEAD ACTION & POSE TO POSE
 * Optimized keyframe interpolation for smooth motion
 */
export function createSmoothPath(
    from: { x?: number; y?: number; scale?: number; opacity?: number; },
    to: { x?: number; y?: number; scale?: number; opacity?: number; },
    keyframes?: Array<{ x?: number; y?: number; scale?: number; opacity?: number; }>,
): Variants {
    return {
        initial: from,
        animate: keyframes
            ? {
                ...to,
                transition: {
                    duration: ANIMATION_DURATION.slow / 1000,
                    ease: EASING.easeInOut,
                    times: keyframes.map((_, i) => i / (keyframes.length - 1)),
                },
            }
            : {
                ...to,
                transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
            },
    };
}

/**
 * PRINCIPLE 5: FOLLOW THROUGH & OVERLAPPING ACTION
 * Creates natural continuation with staggered timing
 */
export function createFollowThrough(elementCount: number): Variants {
    return {
        initial: { opacity: 0, y: 30 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: ANIMATION_DURATION.normal / 1000,
                ease: EASING.spring,
                staggerChildren: STAGGER_DELAY.normal / 1000,
                delayChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            y: -15,
            transition: {
                duration: ANIMATION_DURATION.quick / 1000,
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    };
}

/**
 * PRINCIPLE 8: SECONDARY ACTION
 * Adds supporting micro-interactions without stealing focus
 */
export function createSecondaryAction(
    type: 'ripple' | 'glow' | 'sparkle' = 'glow',
): MotionProps {
    const effects = {
        ripple: {
            whileTap: { scale: [1, 1.1, 1] },
            transition: { duration: 0.6, ease: EASING.easeOut },
        },
        glow: {
            whileHover: {
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                transition: { duration: ANIMATION_DURATION.normal / 1000 },
            },
        },
        sparkle: {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    };

    return effects[type];
}

/**
 * PRINCIPLE 9: TIMING
 * Consistent timing patterns for different interaction types
 */
export function getTimingForContext(context: 'tooltip' | 'button' | 'modal' | 'page' | 'loading'): {
    duration: number;
    ease: string | number[];
} {
    const timingMap = {
        tooltip: { duration: ANIMATION_DURATION.quick, ease: EASING.easeOut },
        button: { duration: ANIMATION_DURATION.quick, ease: EASING.sharp },
        modal: { duration: ANIMATION_DURATION.normal, ease: EASING.easeInOut },
        page: { duration: ANIMATION_DURATION.slow, ease: EASING.easeInOut },
        loading: { duration: ANIMATION_DURATION.extended, ease: EASING.linear },
    };

    return timingMap[context];
}

/**
 * PRINCIPLE 10: EXAGGERATION
 * Amplified effects for important feedback
 */
export function createExaggeration(
    type: 'error' | 'success' | 'attention' | 'celebration' = 'attention',
): Variants {
    const effects = {
        error: {
            initial: { x: 0 },
            animate: {
                x: EXAGGERATION.shake.x,
                transition: {
                    duration: EXAGGERATION.shake.duration / 1000,
                    ease: EASING.sharp,
                    times: [0, 0.25, 0.5, 0.75, 1],
                },
            },
        },
        success: {
            initial: { scale: 1 },
            animate: {
                scale: [1, 1.1, 1.05, 1],
                transition: { duration: 0.6, ease: EASING.bounceSoft },
            },
        },
        attention: {
            initial: { rotate: 0 },
            animate: {
                rotate: EXAGGERATION.wiggle.rotation,
                transition: {
                    duration: EXAGGERATION.wiggle.duration / 1000,
                    ease: EASING.easeInOut,
                    repeat: 2,
                },
            },
        },
        celebration: {
            initial: { scale: 1, rotate: 0 },
            animate: {
                scale: [1, 1.2, 1.1, 1],
                rotate: [0, 10, -5, 0],
                transition: { duration: 0.8, ease: EASING.spring },
            },
        },
    };

    return effects[type];
}

/**
 * PRINCIPLE 12: APPEAL
 * Delightful animations that create emotional connection
 */
export function createAppeal(
    type: 'heartbeat' | 'float' | 'breathe' | 'dance' = 'float',
): MotionProps {
    const appeals = {
        heartbeat: {
            animate: {
                scale: [1, 1.05, 1],
                transition: {
                    duration: 0.8,
                    ease: EASING.easeInOut,
                    repeat: Number.POSITIVE_INFINITY,
                },
            },
        },
        float: {
            animate: {
                y: [0, -8, 0],
                transition: {
                    duration: 3,
                    ease: EASING.easeInOut,
                    repeat: Number.POSITIVE_INFINITY,
                },
            },
        },
        breathe: {
            animate: {
                scale: [1, 1.02, 1],
                opacity: [0.8, 1, 0.8],
                transition: {
                    duration: 4,
                    ease: EASING.easeInOut,
                    repeat: Number.POSITIVE_INFINITY,
                },
            },
        },
        dance: {
            animate: {
                rotate: [0, 2, -2, 0],
                scale: [1, 1.02, 1],
                transition: {
                    duration: 2,
                    ease: EASING.easeInOut,
                    repeat: Number.POSITIVE_INFINITY,
                },
            },
        },
    };

    return appeals[type];
}

/**
 * Utility to respect reduced motion preferences
 */
export function getAccessibleVariants(
    variants: Variants,
    shouldReduceMotion: boolean = false,
): Variants {
    if (shouldReduceMotion) {
        return REDUCED_MOTION_VARIANTS.static;
    }
    return variants;
}

/**
 * Utility to create complex animation sequences
 */
export function createAnimationSequence(
    steps: Array<{
        element: string;
        variant: Variants;
        delay?: number;
    }>,
): Variants {
    return {
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
    };
}

/**
 * Utility for list animations with staggering
 */
export function createListAnimation(itemCount: number): Variants {
    return {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: {
                staggerChildren: STAGGER_DELAY.tight / 1000,
                delayChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    };
}

// Export motion variants with different name to avoid conflicts
export const ANIMATION_MOTION_VARIANTS = MOTION_VARIANTS_CONST;
