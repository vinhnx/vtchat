/**
 * Animation constants following the 12 Principles of Animation for Web & UX Design
 * Based on Disney's principles adapted for modern UI/UX
 */

// TIMING - Keep durations under 300ms for most interactions
export const ANIMATION_DURATION = {
    instant: 0,
    quick: 150,     // For tooltips, button states
    normal: 200,    // Standard UI transitions
    slow: 300,      // Complex animations, modals
    extended: 500,  // Page transitions, loading states
    dramatic: 800,  // Special effects, onboarding
} as const;

// SLOW IN & SLOW OUT - Natural easing curves
export const EASING = {
    // Standard easings following natural motion
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',        // Fast start, slow end - snappy feel
    easeIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',       // Slow start, fast end - entering elements
    easeInOut: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',    // Smooth both ends - balanced
    
    // Spring-like motion for organic feel
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',     // Slight overshoot
    bounceSoft: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Gentle bounce
    
    // Sharp transitions for emphasis
    sharp: 'cubic-bezier(0.4, 0.0, 0.2, 1)',               // Material Design standard
    linear: 'linear',                                        // Use sparingly
} as const;

// STAGING - Staggered delays for sequential animations
export const STAGGER_DELAY = {
    none: 0,
    tight: 50,      // Quick succession
    normal: 100,    // Standard stagger
    relaxed: 150,   // Leisurely pace
    dramatic: 300,  // Emphasized sequence
} as const;

// ANTICIPATION - Preparation before main action
export const ANTICIPATION = {
    scalePrep: 0.95,        // Slight scale down before action
    translatePrep: 4,       // Small movement before main motion
    opacityPrep: 0.8,       // Subtle fade before appearance
    rotatePrep: -2,         // Small counter-rotation
} as const;

// FOLLOW THROUGH & OVERLAPPING ACTION - Natural continuation
export const FOLLOW_THROUGH = {
    overshoot: 1.02,        // Slight overshoot past target
    settle: 0.98,           // Settle back slightly
    damping: 0.6,           // Spring damping factor
    stiffness: 300,         // Spring stiffness
} as const;

// SQUASH & STRETCH - Deformation for weight and impact
export const DEFORMATION = {
    subtle: { scaleX: 1.02, scaleY: 0.98 },    // Light press effect
    moderate: { scaleX: 1.05, scaleY: 0.95 },  // Button press
    strong: { scaleX: 1.1, scaleY: 0.9 },      // Impact effect
} as const;

// SECONDARY ACTIONS - Supporting micro-interactions
export const SECONDARY = {
    rippleDuration: 600,    // Material ripple effect
    sparkle: {
        particles: 6,
        spread: 20,
        duration: 400,
    },
    glow: {
        intensity: 0.3,
        duration: 300,
    },
} as const;

// EXAGGERATION - Emphasized effects for important actions
export const EXAGGERATION = {
    wiggle: {
        rotation: [-1, 1, -1, 0],
        duration: 400,
    },
    pulse: {
        scale: [1, 1.05, 1],
        duration: 600,
    },
    shake: {
        x: [-2, 2, -2, 0],
        duration: 300,
    },
} as const;

// APPEAL - Delightful micro-interactions
export const APPEAL = {
    heartbeat: {
        scale: [1, 1.2, 1],
        duration: 800,
    },
    float: {
        y: [0, -4, 0],
        duration: 2000,
    },
    breathe: {
        scale: [1, 1.02, 1],
        duration: 3000,
    },
} as const;

// COMMON ANIMATION PRESETS
export const MOTION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.easeOut },
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        transition: { duration: ANIMATION_DURATION.normal / 1000, ease: EASING.spring },
    },
    buttonPress: {
        initial: { scale: 1 },
        whileTap: { 
            scale: ANTICIPATION.scalePrep,
            transition: { duration: 0.1, ease: EASING.easeIn }
        },
        animate: { scale: 1 },
        transition: { duration: ANIMATION_DURATION.quick / 1000, ease: EASING.easeOut },
    },
    stagger: {
        animate: {
            transition: {
                staggerChildren: STAGGER_DELAY.normal / 1000,
                delayChildren: 0.1,
            },
        },
    },
} as const;

// CSS TRANSITION UTILITIES
export const CSS_TRANSITIONS = {
    base: `all ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
    quick: `all ${ANIMATION_DURATION.quick}ms ${EASING.easeOut}`,
    slow: `all ${ANIMATION_DURATION.slow}ms ${EASING.easeInOut}`,
    colors: `background-color ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}, color ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
    transform: `transform ${ANIMATION_DURATION.normal}ms ${EASING.spring}`,
    opacity: `opacity ${ANIMATION_DURATION.quick}ms ${EASING.easeOut}`,
} as const;

// ACCESSIBILITY - Respect reduced motion preferences
export const REDUCED_MOTION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
    },
    static: {
        initial: {},
        animate: {},
        exit: {},
        transition: { duration: 0 },
    },
} as const;