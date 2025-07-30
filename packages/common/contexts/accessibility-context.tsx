"use client";

import { log } from "@repo/shared/lib/logger";
import { createContext, useContext, useEffect, useState } from "react";

interface AccessibilitySettings {
    reduceMotion: boolean;
    highContrast: boolean;
    fontSize: "small" | "medium" | "large" | "extra-large";
    focusIndicators: boolean;
    screenReaderOptimizations: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (settings: Partial<AccessibilitySettings>) => void;
    prefersReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = "vt-accessibility-settings";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>({
        reduceMotion: false, // Default to false - animations enabled by default
        highContrast: false,
        fontSize: "medium",
        focusIndicators: true,
        screenReaderOptimizations: false,
    });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Set client flag after hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check system preference for reduced motion
    useEffect(() => {
        if (!isClient) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [isClient]);

    // Load settings from localStorage on mount
    useEffect(() => {
        if (!isClient) return;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                setSettings(parsedSettings);
            }
        } catch (error) {
            log.warn({ error }, "Failed to load accessibility settings");
        }
    }, [isClient]);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (!isClient) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            log.warn({ error }, "Failed to save accessibility settings");
        }
    }, [settings, isClient]);

    const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    const value = {
        settings,
        updateSettings,
        prefersReducedMotion: prefersReducedMotion || settings.reduceMotion,
    };

    return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}

// Hook to check if motion should be reduced
export function useReducedMotion() {
    const { prefersReducedMotion } = useAccessibility();
    return prefersReducedMotion;
}

// Hook to check if high contrast is enabled
export function useHighContrast() {
    const { settings } = useAccessibility();
    return settings.highContrast;
}

// Hook to get current font size setting
export function useFontSize() {
    const { settings } = useAccessibility();
    return settings.fontSize;
}

// Hook to check if focus indicators are enhanced
export function useFocusIndicators() {
    const { settings } = useAccessibility();
    return settings.focusIndicators;
}

// Hook to check if screen reader optimizations are enabled
export function useScreenReaderOptimizations() {
    const { settings } = useAccessibility();
    return settings.screenReaderOptimizations;
}
