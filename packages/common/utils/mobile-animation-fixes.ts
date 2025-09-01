'use client';

import type { Transition, Variants } from 'framer-motion';
import { log } from '@repo/shared/src/lib/logger';

/**
 * Mobile-optimized animation utilities to prevent flashing and improve performance
 * Specifically designed to fix sidebar and modal animation issues on mobile devices
 */

// Device detection
export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
        window.innerWidth < 768
        || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
};

export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Hardware acceleration utilities
export const HARDWARE_ACCELERATION = {
    transform3d: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform' as const,
    perspective: '1000px',
} as const;

// Mobile-optimized transitions
export const MOBILE_TRANSITIONS = {
    // Ultra-fast for mobile to prevent flashing
    instant: {
        duration: 0.1,
        ease: 'easeOut',
    } as Transition,

    // Fast transitions for mobile interactions
    fast: {
        duration: prefersReducedMotion() ? 0.01 : isMobileDevice() ? 0.125 : 0.125,
        ease: 'easeOut',
    } as Transition,

    // Standard mobile-optimized transitions
    standard: {
        duration: prefersReducedMotion() ? 0.01 : isMobileDevice() ? 0.2 : 0.3,
        ease: 'easeOut',
    } as Transition,

    // Tween-based for consistent mobile performance
    mobileTween: {
        type: 'tween' as const,
        duration: prefersReducedMotion() ? 0.01 : 0.125,
        ease: 'easeOut',
    } as Transition,

    // No animation for reduced motion
    none: {
        duration: 0,
    } as Transition,
} as const;

// Mobile-optimized animation variants
export const MOBILE_VARIANTS = {
    // Sidebar slide animations
    sidebarSlide: {
        initial: { x: -300 },
        animate: { x: 0 },
        exit: { x: -300 },
    } as Variants,

    sidebarSlideRight: {
        initial: { x: 300 },
        animate: { x: 0 },
        exit: { x: 300 },
    } as Variants,

    // Backdrop fade
    backdropFade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    } as Variants,

    // Modal scale (mobile-optimized)
    modalScale: {
        initial: { opacity: 0, scale: 0.93 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.93 },
    } as Variants,

    // Simple fade for mobile
    simpleFade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    } as Variants,
} as const;

// CSS classes for hardware acceleration
export const MOBILE_ACCELERATION_CLASSES = {
    base: 'transform-gpu will-change-transform',
    backdrop: 'transform-gpu will-change-opacity',
    sidebar: 'transform-gpu will-change-transform',
    modal: 'transform-gpu will-change-transform will-change-opacity',
} as const;

// Mobile-specific AnimatePresence props
export const MOBILE_ANIMATE_PRESENCE_PROPS = {
    mode: 'wait' as const,
    initial: false,
};

// Optimized motion props for mobile sidebar
export const createMobileSidebarProps = (placement: 'left' | 'right' = 'left') => {
    if (prefersReducedMotion()) {
        return {
            initial: false,
            animate: {},
            exit: {},
            transition: MOBILE_TRANSITIONS.none,
            className: MOBILE_ACCELERATION_CLASSES.sidebar,
            style: HARDWARE_ACCELERATION,
        };
    }

    return {
        initial: placement === 'left' ? { x: -300 } : { x: 300 },
        animate: { x: 0 },
        exit: placement === 'left' ? { x: -300 } : { x: 300 },
        transition: MOBILE_TRANSITIONS.mobileTween,
        className: MOBILE_ACCELERATION_CLASSES.sidebar,
        style: HARDWARE_ACCELERATION,
    };
};

// Optimized motion props for mobile backdrop
export const createMobileBackdropProps = () => {
    if (prefersReducedMotion()) {
        return {
            initial: false,
            animate: {},
            exit: {},
            transition: MOBILE_TRANSITIONS.none,
            className: MOBILE_ACCELERATION_CLASSES.backdrop,
            style: HARDWARE_ACCELERATION,
        };
    }

    return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: MOBILE_TRANSITIONS.fast,
        className: MOBILE_ACCELERATION_CLASSES.backdrop,
        style: HARDWARE_ACCELERATION,
    };
};

// Optimized motion props for mobile modals
export const createMobileModalProps = () => {
    if (prefersReducedMotion()) {
        return {
            initial: false,
            animate: {},
            exit: {},
            transition: MOBILE_TRANSITIONS.none,
            className: MOBILE_ACCELERATION_CLASSES.modal,
            style: HARDWARE_ACCELERATION,
        };
    }

    return {
        initial: { opacity: 0, scale: 0.93 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.93 },
        transition: MOBILE_TRANSITIONS.fast,
        className: MOBILE_ACCELERATION_CLASSES.modal,
        style: HARDWARE_ACCELERATION,
    };
};

// Utility to apply mobile optimizations to any motion component
export const withMobileOptimization = (baseProps: any) => {
    const mobileOptimizations = {
        className: `${baseProps.className || ''} ${MOBILE_ACCELERATION_CLASSES.base}`.trim(),
        style: {
            ...baseProps.style,
            ...HARDWARE_ACCELERATION,
        },
    };

    if (prefersReducedMotion()) {
        return {
            ...baseProps,
            ...mobileOptimizations,
            initial: false,
            animate: {},
            exit: {},
            transition: MOBILE_TRANSITIONS.none,
        };
    }

    if (isMobileDevice()) {
        return {
            ...baseProps,
            ...mobileOptimizations,
            transition: {
                ...baseProps.transition,
                duration: Math.min(baseProps.transition?.duration || 0.3, 0.2),
                type: 'tween',
                ease: 'easeOut',
            },
        };
    }

    return {
        ...baseProps,
        ...mobileOptimizations,
    };
};

// Hook to get mobile-optimized animation settings
export const useMobileAnimationSettings = () => {
    const isMobile = isMobileDevice();
    const reducedMotion = prefersReducedMotion();

    return {
        isMobile,
        reducedMotion,
        shouldAnimate: !reducedMotion,
        fastDuration: reducedMotion ? 0.01 : isMobile ? 0.15 : 0.2,
        standardDuration: reducedMotion ? 0.01 : isMobile ? 0.2 : 0.3,
        getTransition: (type: keyof typeof MOBILE_TRANSITIONS) => MOBILE_TRANSITIONS[type],
        getVariants: (type: keyof typeof MOBILE_VARIANTS) => MOBILE_VARIANTS[type],
        hardwareAcceleration: HARDWARE_ACCELERATION,
        accelerationClasses: MOBILE_ACCELERATION_CLASSES,
    };
};

// CSS-in-JS styles for mobile optimization
export const MOBILE_OPTIMIZATION_STYLES = {
    container: {
        contain: 'layout style paint',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden' as const,
    },

    sidebar: {
        contain: 'layout style paint',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden' as const,
        willChange: 'transform' as const,
    },

    backdrop: {
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden' as const,
        willChange: 'opacity' as const,
    },

    modal: {
        contain: 'layout style paint',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden' as const,
        willChange: 'transform, opacity' as const,
    },
} as const;

// Utility to prevent layout shifts during animations
export const preventLayoutShift = (element: HTMLElement | null) => {
    if (!element || !isMobileDevice()) return;

    element.style.contain = 'layout style paint';
    element.style.transform = 'translate3d(0, 0, 0)';
    element.style.backfaceVisibility = 'hidden';
};

// Debug utility to log animation performance
export const debugMobileAnimation = (componentName: string, animationType: string) => {
    if (process.env.NODE_ENV === 'development' && isMobileDevice()) {
        log.debug(
            {
                component: componentName,
                animationType,
                reducedMotion: prefersReducedMotion(),
                userAgent: navigator.userAgent,
                viewport: { width: window.innerWidth, height: window.innerHeight },
            },
            'Mobile animation debug info'
        );
    }
};
