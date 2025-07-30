"use client";

import { animate, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAnimatedText(text: string, shouldAnimate = true) {
    const animatedCursor = useMotionValue(0);
    const [cursor, setCursor] = useState(0);
    const [prevText, setPrevText] = useState(text);
    const [isSameText, setIsSameText] = useState(true);
    const [_isAnimationComplete, setIsAnimationComplete] = useState(!shouldAnimate);
    const animationRef = useRef<ReturnType<typeof animate> | null>(null);
    const rafRef = useRef<number | null>(null);

    if (prevText !== text) {
        setPrevText(text);
        setIsSameText(text.startsWith(prevText));

        if (!text.startsWith(prevText)) {
            setCursor(0);
            setIsAnimationComplete(false);
        }
    }

    // Optimized cursor update using requestAnimationFrame for smoother animation
    const updateCursor = useCallback((latest: number) => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            const newCursor = Math.floor(latest);
            setCursor((prev) => {
                if (newCursor !== prev) {
                    return newCursor;
                }
                return prev;
            });
        });
    }, []);

    useEffect(() => {
        if (!shouldAnimate) {
            setIsAnimationComplete(true);
            setCursor(text.length);
            return;
        }

        // Stop any existing animation
        if (animationRef.current) {
            animationRef.current.stop();
        }

        if (!isSameText) {
            animatedCursor.jump(0);
            setIsAnimationComplete(false);
        }

        const textLength = text.length;
        const startCursor = isSameText ? cursor : 0;

        // Improved timing calculation for smoother streaming
        // Faster for shorter additions, slower for longer content
        const remainingChars = textLength - startCursor;
        const baseDuration = Math.max(0.2, Math.min(1.5, remainingChars * 0.012));

        animationRef.current = animate(animatedCursor, textLength, {
            duration: baseDuration,
            ease: "easeOut", // Smoother easing for more natural appearance
            onUpdate: updateCursor,
            onComplete() {
                setCursor(textLength);
                setIsAnimationComplete(true);
            },
        });

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [animatedCursor, isSameText, text, shouldAnimate, prevText.length, cursor, updateCursor]);

    if (!shouldAnimate) {
        return { text, isAnimationComplete: true };
    }

    // Character-by-character animation with smooth transitions
    const displayedText = cursor >= text.length ? text : text.slice(0, cursor);

    return {
        text: displayedText,
        isAnimationComplete: cursor >= text.length,
    };
}
