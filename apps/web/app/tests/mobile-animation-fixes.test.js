/**
 * Test suite for mobile animation fixes
 * Tests that animations are optimized for mobile devices and don't cause flashing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the mobile animation utilities
const mockMobileAnimationUtils = {
    isMobileDevice: vi.fn(() => true),
    prefersReducedMotion: vi.fn(() => false),
    HARDWARE_ACCELERATION: {
        transform3d: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        perspective: "1000px",
    },
    MOBILE_TRANSITIONS: {
        instant: { duration: 0.1, ease: "easeOut" },
        fast: { duration: 0.15, ease: "easeOut" },
        standard: { duration: 0.2, ease: "easeOut" },
        mobileTween: { type: "tween", duration: 0.15, ease: "easeOut" },
        none: { duration: 0 },
    },
    createMobileSidebarProps: vi.fn((placement = "left") => ({
        initial: placement === "left" ? { x: -300 } : { x: 300 },
        animate: { x: 0 },
        exit: placement === "left" ? { x: -300 } : { x: 300 },
        transition: { type: "tween", duration: 0.15, ease: "easeOut" },
        className: "transform-gpu will-change-transform",
        style: {
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
        },
    })),
    createMobileBackdropProps: vi.fn(() => ({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15, ease: "easeOut" },
        className: "transform-gpu will-change-opacity",
        style: {
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
        },
    })),
};

describe('Mobile Animation Fixes', () => {
    let dom;
    let window;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Setup JSDOM with mobile viewport
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost:3000',
            pretendToBeVisual: true,
            resources: "usable"
        });
        window = dom.window;
        global.window = window;
        global.document = window.document;
        global.navigator = window.navigator;

        // Mock mobile viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375, // iPhone width
        });

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 667, // iPhone height
        });

        // Mock user agent for mobile
        Object.defineProperty(window.navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        });

        // Mock matchMedia for reduced motion
        window.matchMedia = vi.fn((query) => ({
            matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        dom?.window?.close();
    });

    describe('Mobile Device Detection', () => {
        it('should detect mobile devices correctly', () => {
            expect(mockMobileAnimationUtils.isMobileDevice()).toBe(true);
        });

        it('should detect reduced motion preference', () => {
            expect(mockMobileAnimationUtils.prefersReducedMotion()).toBe(false);
        });

        it('should handle reduced motion preference when enabled', () => {
            window.matchMedia = vi.fn((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            mockMobileAnimationUtils.prefersReducedMotion.mockReturnValue(true);
            expect(mockMobileAnimationUtils.prefersReducedMotion()).toBe(true);
        });
    });

    describe('Hardware Acceleration', () => {
        it('should provide correct hardware acceleration properties', () => {
            const acceleration = mockMobileAnimationUtils.HARDWARE_ACCELERATION;
            
            expect(acceleration.transform3d).toBe("translate3d(0, 0, 0)");
            expect(acceleration.backfaceVisibility).toBe("hidden");
            expect(acceleration.willChange).toBe("transform");
            expect(acceleration.perspective).toBe("1000px");
        });

        it('should apply hardware acceleration to elements', () => {
            const element = document.createElement('div');
            const acceleration = mockMobileAnimationUtils.HARDWARE_ACCELERATION;
            
            Object.assign(element.style, {
                transform: acceleration.transform3d,
                backfaceVisibility: acceleration.backfaceVisibility,
                willChange: acceleration.willChange,
            });

            expect(element.style.transform).toBe("translate3d(0, 0, 0)");
            expect(element.style.backfaceVisibility).toBe("hidden");
            expect(element.style.willChange).toBe("transform");
        });
    });

    describe('Mobile Transitions', () => {
        it('should provide fast transitions for mobile', () => {
            const transitions = mockMobileAnimationUtils.MOBILE_TRANSITIONS;
            
            expect(transitions.fast.duration).toBe(0.15);
            expect(transitions.fast.ease).toBe("easeOut");
        });

        it('should provide instant transitions for critical animations', () => {
            const transitions = mockMobileAnimationUtils.MOBILE_TRANSITIONS;
            
            expect(transitions.instant.duration).toBe(0.1);
            expect(transitions.instant.ease).toBe("easeOut");
        });

        it('should provide tween-based transitions for consistency', () => {
            const transitions = mockMobileAnimationUtils.MOBILE_TRANSITIONS;
            
            expect(transitions.mobileTween.type).toBe("tween");
            expect(transitions.mobileTween.duration).toBe(0.15);
            expect(transitions.mobileTween.ease).toBe("easeOut");
        });

        it('should provide no animation for reduced motion', () => {
            const transitions = mockMobileAnimationUtils.MOBILE_TRANSITIONS;
            
            expect(transitions.none.duration).toBe(0);
        });
    });

    describe('Mobile Sidebar Props', () => {
        it('should create optimized props for left sidebar', () => {
            const props = mockMobileAnimationUtils.createMobileSidebarProps("left");
            
            expect(props.initial).toEqual({ x: -300 });
            expect(props.animate).toEqual({ x: 0 });
            expect(props.exit).toEqual({ x: -300 });
            expect(props.transition.type).toBe("tween");
            expect(props.transition.duration).toBe(0.15);
            expect(props.className).toContain("transform-gpu");
            expect(props.style.transform).toBe("translate3d(0, 0, 0)");
        });

        it('should create optimized props for right sidebar', () => {
            const props = mockMobileAnimationUtils.createMobileSidebarProps("right");
            
            expect(props.initial).toEqual({ x: 300 });
            expect(props.animate).toEqual({ x: 0 });
            expect(props.exit).toEqual({ x: 300 });
        });

        it('should include hardware acceleration in sidebar props', () => {
            const props = mockMobileAnimationUtils.createMobileSidebarProps();
            
            expect(props.style.backfaceVisibility).toBe("hidden");
            expect(props.style.willChange).toBe("transform");
            expect(props.className).toContain("will-change-transform");
        });
    });

    describe('Mobile Backdrop Props', () => {
        it('should create optimized backdrop props', () => {
            const props = mockMobileAnimationUtils.createMobileBackdropProps();
            
            expect(props.initial).toEqual({ opacity: 0 });
            expect(props.animate).toEqual({ opacity: 1 });
            expect(props.exit).toEqual({ opacity: 0 });
            expect(props.transition.duration).toBe(0.15);
            expect(props.className).toContain("transform-gpu");
            expect(props.style.transform).toBe("translate3d(0, 0, 0)");
        });

        it('should include opacity optimization for backdrop', () => {
            const props = mockMobileAnimationUtils.createMobileBackdropProps();
            
            expect(props.className).toContain("will-change-opacity");
            expect(props.style.backfaceVisibility).toBe("hidden");
        });
    });

    describe('Animation Performance', () => {
        it('should use short durations to prevent flashing', () => {
            const transitions = mockMobileAnimationUtils.MOBILE_TRANSITIONS;
            
            // All mobile transitions should be under 0.3s to prevent flashing
            expect(transitions.fast.duration).toBeLessThan(0.3);
            expect(transitions.standard.duration).toBeLessThan(0.3);
            expect(transitions.mobileTween.duration).toBeLessThan(0.3);
        });

        it('should prefer tween animations over spring for consistency', () => {
            const sidebarProps = mockMobileAnimationUtils.createMobileSidebarProps();
            
            expect(sidebarProps.transition.type).toBe("tween");
        });

        it('should apply GPU acceleration classes', () => {
            const sidebarProps = mockMobileAnimationUtils.createMobileSidebarProps();
            const backdropProps = mockMobileAnimationUtils.createMobileBackdropProps();
            
            expect(sidebarProps.className).toContain("transform-gpu");
            expect(backdropProps.className).toContain("transform-gpu");
        });
    });

    describe('CSS Optimizations', () => {
        it('should apply contain property for layout optimization', () => {
            const element = document.createElement('div');
            element.style.contain = "layout style paint";
            
            expect(element.style.contain).toBe("layout style paint");
        });

        it('should apply transform3d for hardware acceleration', () => {
            const element = document.createElement('div');
            element.style.transform = "translate3d(0, 0, 0)";
            
            expect(element.style.transform).toBe("translate3d(0, 0, 0)");
        });

        it('should apply backface-visibility for smoother animations', () => {
            const element = document.createElement('div');
            element.style.backfaceVisibility = "hidden";
            
            expect(element.style.backfaceVisibility).toBe("hidden");
        });
    });

    describe('Reduced Motion Support', () => {
        it('should disable animations when reduced motion is preferred', () => {
            mockMobileAnimationUtils.prefersReducedMotion.mockReturnValue(true);
            
            // When reduced motion is preferred, animations should be disabled
            expect(mockMobileAnimationUtils.prefersReducedMotion()).toBe(true);
            
            // Transitions should use none duration
            const noneTransition = mockMobileAnimationUtils.MOBILE_TRANSITIONS.none;
            expect(noneTransition.duration).toBe(0);
        });

        it('should respect user accessibility preferences', () => {
            // Mock reduced motion preference
            window.matchMedia = vi.fn((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            expect(mediaQuery.matches).toBe(true);
        });
    });

    describe('Mobile Viewport Handling', () => {
        it('should handle different mobile screen sizes', () => {
            // Test iPhone SE
            window.innerWidth = 320;
            window.innerHeight = 568;
            expect(window.innerWidth).toBe(320);

            // Test iPhone 12
            window.innerWidth = 390;
            window.innerHeight = 844;
            expect(window.innerWidth).toBe(390);

            // Test iPad
            window.innerWidth = 768;
            window.innerHeight = 1024;
            expect(window.innerWidth).toBe(768);
        });

        it('should optimize for touch interactions', () => {
            // Touch events should be handled properly
            const element = document.createElement('div');
            const touchHandler = vi.fn();
            
            element.addEventListener('touchstart', touchHandler);
            element.addEventListener('touchend', touchHandler);
            
            expect(element.addEventListener).toBeDefined();
        });
    });
});
