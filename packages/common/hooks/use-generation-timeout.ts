"use client";

import { useChatStore } from "@repo/common/store";
import { GENERATION_TIMEOUTS } from "@repo/shared/constants";
import { useEffect, useRef } from "react";

interface UseGenerationTimeoutOptions {
    timeoutThreshold?: number;
    slowResponseThreshold?: number;
    enabled?: boolean;
}

export const useGenerationTimeout = ({
    timeoutThreshold = GENERATION_TIMEOUTS.TIMEOUT_THRESHOLD,
    slowResponseThreshold = GENERATION_TIMEOUTS.SLOW_RESPONSE_THRESHOLD,
    enabled = true,
}: UseGenerationTimeoutOptions = {}) => {
    const isGenerating = useChatStore((state) => state.isGenerating);
    const generationStartTime = useChatStore((state) => state.generationStartTime);
    const setShowTimeoutIndicator = useChatStore((state) => state.setShowTimeoutIndicator);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const slowResponseRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Clear any existing timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (slowResponseRef.current) {
            clearTimeout(slowResponseRef.current);
            slowResponseRef.current = null;
        }

        if (isGenerating && generationStartTime) {
            // Set timeout indicator after threshold
            timeoutRef.current = setTimeout(() => {
                setShowTimeoutIndicator(true);
            }, timeoutThreshold);

            // Additional logic for slow response handling could go here
            slowResponseRef.current = setTimeout(() => {
                // Could trigger additional analytics or monitoring here
                // For now, just used for timeout detection
            }, slowResponseThreshold);
        } else {
            // Reset timeout indicator when generation stops
            setShowTimeoutIndicator(false);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (slowResponseRef.current) {
                clearTimeout(slowResponseRef.current);
            }
        };
    }, [
        isGenerating,
        generationStartTime,
        timeoutThreshold,
        slowResponseThreshold,
        setShowTimeoutIndicator,
        enabled,
    ]);

    return {
        isGenerating,
        generationStartTime,
        timeoutThreshold,
        slowResponseThreshold,
    };
};
