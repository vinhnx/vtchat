"use client";

import { type MotionProps, motion } from "framer-motion";
import { useReducedMotion } from "../contexts/accessibility-context";

// Type for motion component props
export type AccessibleMotionProps = MotionProps & {
    children: React.ReactNode;
    as?: keyof typeof motion;
};

// Create a motion component that respects reduced motion preferences
export function createAccessibleMotion<T extends keyof typeof motion>(
    component: T,
    defaultProps: MotionProps = {},
) {
    return function AccessibleMotionComponent(props: AccessibleMotionProps) {
        const shouldReduceMotion = useReducedMotion();
        const MotionComponent = motion[component];

        if (shouldReduceMotion) {
            // Remove all animation props when motion is reduced
            const {
                initial,
                animate,
                exit,
                transition,
                variants,
                whileHover,
                whileTap,
                whileFocus,
                whileInView,
                ...staticProps
            } = { ...defaultProps, ...props };

            return <MotionComponent {...staticProps} />;
        }

        return <MotionComponent {...defaultProps} {...props} />;
    };
}

// Pre-created accessible motion components
export const AccessibleMotion = {
    div: createAccessibleMotion("div"),
    span: createAccessibleMotion("span"),
    button: createAccessibleMotion("button"),
    section: createAccessibleMotion("section"),
    article: createAccessibleMotion("article"),
    header: createAccessibleMotion("header"),
    footer: createAccessibleMotion("footer"),
    nav: createAccessibleMotion("nav"),
    main: createAccessibleMotion("main"),
    aside: createAccessibleMotion("aside"),
    p: createAccessibleMotion("p"),
    h1: createAccessibleMotion("h1"),
    h2: createAccessibleMotion("h2"),
    h3: createAccessibleMotion("h3"),
    h4: createAccessibleMotion("h4"),
    h5: createAccessibleMotion("h5"),
    h6: createAccessibleMotion("h6"),
    ul: createAccessibleMotion("ul"),
    ol: createAccessibleMotion("ol"),
    li: createAccessibleMotion("li"),
    form: createAccessibleMotion("form"),
    input: createAccessibleMotion("input"),
    textarea: createAccessibleMotion("textarea"),
    select: createAccessibleMotion("select"),
    label: createAccessibleMotion("label"),
    img: createAccessibleMotion("img"),
    svg: createAccessibleMotion("svg"),
    path: createAccessibleMotion("path"),
};

// Utility function to get motion props based on reduced motion preference
export function getMotionProps(
    motionProps: MotionProps,
    shouldReduceMotion?: boolean,
): MotionProps {
    if (shouldReduceMotion) {
        return {};
    }
    return motionProps;
}

// Common animation variants that respect reduced motion
export const accessibleVariants = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    slideLeft: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    slideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    stagger: {
        animate: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    },
};

// Hook to get accessible variants
export function useAccessibleVariants() {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        // Return static variants when motion is reduced
        return Object.keys(accessibleVariants).reduce(
            (acc, key) => {
                acc[key] = {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                };
                return acc;
            },
            {} as typeof accessibleVariants,
        );
    }

    return accessibleVariants;
}
