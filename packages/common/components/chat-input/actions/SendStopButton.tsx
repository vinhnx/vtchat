"use client";

import { useChatStore } from "@repo/common/store";
import { Button } from "@repo/ui";
import { cn } from "@repo/ui/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CircleStop, Clock, Square } from "lucide-react";
import { ICON_SIZES } from "../config/constants";

interface SendStopButtonProps {
    isGenerating: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}

export function SendStopButton({
    isGenerating,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: SendStopButtonProps) {
    const showTimeoutIndicator = useChatStore((state) => state.showTimeoutIndicator);
    const generationStartTime = useChatStore((state) => state.generationStartTime);

    // Calculate dynamic tooltip based on generation state
    const getStopTooltip = () => {
        if (!isGenerating) return "Stop Generation";

        if (showTimeoutIndicator) {
            return "Generation taking longer than usual - Click to stop";
        }

        const elapsedSeconds = generationStartTime
            ? Math.floor((Date.now() - generationStartTime) / 1000)
            : 0;

        if (elapsedSeconds > 3) {
            return `Stop Generation (${elapsedSeconds}s)`;
        }

        return "Stop Generation";
    };

    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence initial={false} mode="wait">
                {isGenerating ? (
                    <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        key="stop-button"
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            aria-label="Stop Generation"
                            onClick={stopGeneration}
                            size="icon-sm"
                            tooltip={getStopTooltip()}
                            variant={showTimeoutIndicator ? "destructive" : "default"}
                            className={cn(
                                "transition-all duration-200",
                                showTimeoutIndicator
                                    ? "hover:bg-destructive/90"
                                    : "hover:bg-muted-foreground/10",
                            )}
                            disabled={isGenerating && showTimeoutIndicator}
                        >
                            {showTimeoutIndicator ? (
                                <Clock size={ICON_SIZES.small} strokeWidth={2} />
                            ) : isGenerating ? (
                                <CircleStop
                                    size={ICON_SIZES.small}
                                    strokeWidth={2}
                                    className="animate-spin"
                                />
                            ) : (
                                <Square size={ICON_SIZES.small} strokeWidth={2} />
                            )}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        key="send-button"
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            aria-label="Send Message"
                            disabled={!hasTextInput}
                            onClick={(e) => {
                                e.preventDefault(); // Prevent any default behavior
                                sendMessage();
                            }}
                            size="icon-sm"
                            tooltip="Send Message"
                            variant="default"
                            className="hover:bg-muted-foreground/10 transition-all duration-200"
                        >
                            <ArrowUp size={ICON_SIZES.small} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
