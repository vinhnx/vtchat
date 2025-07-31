import type { Transition, Variants } from "framer-motion";

/**
 * Animation optimization utilities for VT Chat
 * Provides mobile-optimized animations with performance considerations
 */

// Device detection utilities
export const isMobile = () => {
    if (typeof window === "undefined") return false;
    return (
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
};

export const isLowEndDevice = () => {
    if (typeof window === "undefined") return false;
    // Check for reduced motion preference or low-end device indicators
    return (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        (navigator as any).hardwareConcurrency <= 2 ||
        (navigator as any).deviceMemory <= 2
    );
};

// Prefers reduced motion check
export const prefersReducedMotion = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Performance-optimized transition configurations
export const TRANSITIONS = {
    // Ultra-fast transitions for immediate feedback
    instant: {
        duration: 0.08,
        ease: "easeOut",
    } as Transition,

    // Fast transitions for mobile
    fast: {
        duration: 0.12,
        ease: "easeOut",
    } as Transition,

    // Standard transitions with mobile optimization
    standard: {
        duration: prefersReducedMotion() ? 0.08 : isMobile() ? 0.15 : 0.2,
        ease: "easeOut",
    } as Transition,

    // Smooth transitions for desktop, reduced for mobile
    smooth: {
        duration: prefersReducedMotion() ? 0.08 : isMobile() ? 0.18 : 0.25,
        ease: "easeInOut",
    } as Transition,

    // Spring transitions optimized for mobile
    spring: {
        type: "spring" as const,
        stiffness: isMobile() ? 400 : 300,
        damping: isMobile() ? 25 : 20,
        mass: 0.8,
    } as Transition,

    // Gentle spring for mobile
    springGentle: {
        type: "spring" as const,
        stiffness: isMobile() ? 200 : 150,
        damping: isMobile() ? 20 : 15,
        mass: 1,
    } as Transition,

    // No animation for reduced motion
    none: {
        duration: 0,
    } as Transition,
} as const;

// Get appropriate transition based on device capabilities
export const getOptimizedTransition = (type: keyof typeof TRANSITIONS): Transition => {
    if (prefersReducedMotion()) {
        return TRANSITIONS.none;
    }
    return TRANSITIONS[type];
};

// Hardware-accelerated animation variants
export const ANIMATION_VARIANTS = {
    // Fade animations (GPU-accelerated)
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    } as Variants,

    // Slide animations using transform (GPU-accelerated)
    slideUp: {
        initial: { opacity: 0, y: isMobile() ? 10 : 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: isMobile() ? -10 : -20 },
    } as Variants,

    slideDown: {
        initial: { opacity: 0, y: isMobile() ? -10 : -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: isMobile() ? 10 : 20 },
    } as Variants,

    slideLeft: {
        initial: { opacity: 0, x: isMobile() ? 20 : 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: isMobile() ? -20 : -40 },
    } as Variants,

    slideRight: {
        initial: { opacity: 0, x: isMobile() ? -20 : -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: isMobile() ? 20 : 40 },
    } as Variants,

    // Scale animations (GPU-accelerated)
    scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    } as Variants,

    scaleOut: {
        initial: { opacity: 0, scale: 1.1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
    } as Variants,

    // Gentle scale for mobile
    scaleMobile: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    } as Variants,

    // Stagger children animations
    staggerContainer: {
        initial: {},
        animate: {
            transition: {
                staggerChildren: isMobile() ? 0.05 : 0.1,
                delayChildren: 0.1,
            },
        },
        exit: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    } as Variants,

    staggerChild: {
        initial: { opacity: 0, y: isMobile() ? 5 : 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: isMobile() ? -5 : -10 },
    } as Variants,
} as const;

// Get optimized animation variant
export const getAnimationVariant = (type: keyof typeof ANIMATION_VARIANTS): Variants => {
    if (prefersReducedMotion()) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        };
    }
    return ANIMATION_VARIANTS[type];
};

// Mobile-optimized loading animations
export const LOADING_ANIMATIONS = {
    // Simple pulse for mobile
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: isMobile() ? 1.5 : 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
        },
    },

    // Optimized dots animation
    dots: {
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
        transition: {
            duration: isMobile() ? 1.2 : 1.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
        },
    },

    // Gentle rotation for mobile
    rotate: {
        rotate: 360,
        transition: {
            duration: isMobile() ? 1.5 : 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
        },
    },
} as const;

// CSS class names for hardware acceleration
export const HARDWARE_ACCELERATION_CLASSES = {
    // Force hardware acceleration
    accelerated: "transform-gpu will-change-transform",

    // For opacity animations
    fadeAccelerated: "will-change-opacity",

    // For transform animations
    transformAccelerated: "transform-gpu will-change-transform",

    // For complex animations
    complexAccelerated: "transform-gpu will-change-transform will-change-opacity",

    // Remove will-change after animation
    removeWillChange: "will-change-auto",
} as const;

// Animation configuration presets
export const ANIMATION_PRESETS = {
    // Chat message animations
    chatMessage: {
        variants: getAnimationVariant("slideUp"),
        transition: getOptimizedTransition("standard"),
        className: HARDWARE_ACCELERATION_CLASSES.transformAccelerated,
    },

    // Modal/dialog animations
    modal: {
        variants: getAnimationVariant("scaleIn"),
        transition: getOptimizedTransition("smooth"),
        className: HARDWARE_ACCELERATION_CLASSES.complexAccelerated,
    },

    // Page transition animations
    page: {
        variants: getAnimationVariant("fadeIn"),
        transition: getOptimizedTransition("standard"),
        className: HARDWARE_ACCELERATION_CLASSES.fadeAccelerated,
    },

    // Button/interactive element animations
    interactive: {
        variants: getAnimationVariant("scaleMobile"),
        transition: getOptimizedTransition("fast"),
        className: HARDWARE_ACCELERATION_CLASSES.transformAccelerated,
    },

    // Loading indicator animations
    loading: {
        variants: getAnimationVariant("fadeIn"),
        transition: getOptimizedTransition("smooth"),
        className: HARDWARE_ACCELERATION_CLASSES.complexAccelerated,
    },
} as const;

// Utility to create optimized motion props
export const createMotionProps = (preset: keyof typeof ANIMATION_PRESETS) => {
    const config = ANIMATION_PRESETS[preset];
    return {
        variants: config.variants,
        initial: "initial",
        animate: "animate",
        exit: "exit",
        transition: config.transition,
        className: config.className,
    };
};

// Performance monitoring utilities
export const measureAnimationPerformance = (name: string, callback: () => void) => {
    if (typeof window === "undefined" || !window.performance) {
        callback();
        return;
    }

    const start = performance.now();
    callback();
    const end = performance.now();

    // Log performance in development
    if (process.env.NODE_ENV === "development") {
        // Performance logging for development only
        if (end - start > 16) {
            // Only log if animation takes longer than 1 frame (16ms)
            // Use a simple debug log that won't trigger linting
            window.performance?.mark?.(`animation-${name}-slow`);
        }
    }
};
