"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

const delimiter = " ";
export function useAnimatedText(text: string, shouldAnimate = true) {
    const animatedCursor = useMotionValue(0);
    const [cursor, setCursor] = useState(0);
    const [prevText, setPrevText] = useState(text);
    const [isSameText, setIsSameText] = useState(true);
    const [_isAnimationComplete, setIsAnimationComplete] = useState(!shouldAnimate);

    if (prevText !== text) {
        setPrevText(text);
        setIsSameText(text.startsWith(prevText));

        if (!text.startsWith(prevText)) {
            setCursor(0);
            setIsAnimationComplete(false);
        }
    }

    useEffect(() => {
        if (!shouldAnimate) {
            setIsAnimationComplete(true);
            return;
        }

        if (!isSameText) {
            animatedCursor.jump(0);
            setIsAnimationComplete(false);
        }

        const wordCount = text.split(delimiter).length;

        const controls = animate(animatedCursor, wordCount, {
            duration: 3,
            ease: "easeOut",
            onUpdate(latest) {
                setCursor(Math.floor(latest));
            },
            onComplete() {
                setCursor(wordCount); // Ensure cursor is at max
                setIsAnimationComplete(true);
            },
        });

        return () => controls.stop();
    }, [animatedCursor, isSameText, text, shouldAnimate]);

    if (!shouldAnimate) {
        return { text, isAnimationComplete: true };
    }

    const wordArray = text.split(delimiter);
    const displayedWords = cursor >= wordArray.length ? wordArray : wordArray.slice(0, cursor);

    return {
        text: displayedWords.join(delimiter),
        isAnimationComplete: cursor >= wordArray.length,
    };
}
