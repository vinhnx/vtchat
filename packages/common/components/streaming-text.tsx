"use client";

import { cn } from "@repo/ui";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";

interface StreamingTextProps {
    text: string;
    shouldAnimate?: boolean;
    className?: string;
    onAnimationComplete?: () => void;
    speed?: number; // Characters per second
}

/**
 * Optimized streaming text component that prevents layout shifts and visual lag
 * Uses hardware acceleration and smooth animations for ChatGPT-like streaming
 */
export const StreamingText = memo(
    ({
        text,
        shouldAnimate = true,
        className,
        onAnimationComplete,
        speed = 120, // Increased speed for smoother experience
    }: StreamingTextProps) => {
        const [displayedText, setDisplayedText] = useState("");
        const [isComplete, setIsComplete] = useState(false);
        const animationRef = useRef<number | null>(null);
        const startTimeRef = useRef<number>(0);
        const lastTextRef = useRef<string>("");

        const animate = useCallback(() => {
            if (!shouldAnimate) {
                setDisplayedText(text);
                setIsComplete(true);
                onAnimationComplete?.();
                return;
            }

            const now = performance.now();
            if (startTimeRef.current === 0) {
                startTimeRef.current = now;
            }

            const elapsed = now - startTimeRef.current;
            const targetLength = Math.min(text.length, Math.floor((elapsed / 1000) * speed));

            if (targetLength >= text.length) {
                setDisplayedText(text);
                setIsComplete(true);
                onAnimationComplete?.();
                return;
            }

            setDisplayedText(text.slice(0, targetLength));
            animationRef.current = requestAnimationFrame(animate);
        }, [text, shouldAnimate, speed, onAnimationComplete]);

        useEffect(() => {
            // Reset animation if text changes significantly
            if (!text.startsWith(lastTextRef.current)) {
                startTimeRef.current = 0;
                setIsComplete(false);
            }
            lastTextRef.current = text;

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            if (text) {
                animate();
            }

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }, [text, animate]);

        if (!shouldAnimate) {
            return <span className={cn("streaming-text", className)}>{text}</span>;
        }

        return (
            <motion.span
                className={cn(
                    "streaming-text transform-gpu",
                    "block min-h-[1.5em] w-full",
                    className,
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                style={{
                    backfaceVisibility: "hidden",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    // Enable dynamic height changes
                    willChange: "contents, height",
                    // Remove containment for streaming expansion
                    contain: "none",
                }}
            >
                {displayedText}
                {!isComplete && (
                    <motion.span
                        className="inline-block w-0.5 h-5 bg-current ml-0.5"
                        animate={{ opacity: [1, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </motion.span>
        );
    },
);

StreamingText.displayName = "StreamingText";

/**
 * Hook for managing streaming text state
 */
export function useStreamingText(
    text: string,
    options: {
        shouldAnimate?: boolean;
        speed?: number;
        onComplete?: () => void;
    } = {},
) {
    const { shouldAnimate = true, speed = 80, onComplete } = options;

    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const startAnimation = useCallback(() => {
        if (!shouldAnimate) {
            setDisplayedText(text);
            setIsComplete(true);
            onComplete?.();
            return;
        }

        const animate = () => {
            const now = performance.now();
            if (startTimeRef.current === 0) {
                startTimeRef.current = now;
            }

            const elapsed = now - startTimeRef.current;
            const targetLength = Math.min(text.length, Math.floor((elapsed / 1000) * speed));

            if (targetLength >= text.length) {
                setDisplayedText(text);
                setIsComplete(true);
                onComplete?.();
                return;
            }

            setDisplayedText(text.slice(0, targetLength));
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
    }, [text, shouldAnimate, speed, onComplete]);

    useEffect(() => {
        startTimeRef.current = 0;
        setIsComplete(false);

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        if (text) {
            startAnimation();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [text, startAnimation]);

    return {
        displayedText,
        isComplete,
        reset: () => {
            startTimeRef.current = 0;
            setIsComplete(false);
            setDisplayedText("");
        },
    };
}
