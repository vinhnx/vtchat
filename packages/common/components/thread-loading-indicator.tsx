"use client";

import { useChatStore } from "@repo/common/store";
import { GENERATION_TIMEOUTS, TIMEOUT_MESSAGES } from "@repo/shared/constants";
import { cn } from "@repo/ui";
import Image from "next/image";
import { memo, useEffect, useState } from "react";

// VT icon component using the actual PNG icon
const VTIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
    <Image
        src="/icon-192x192.png"
        alt="VT"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: "contain" }}
    />
);

interface ThreadLoadingIndicatorProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

const TIMEOUT_THRESHOLD = GENERATION_TIMEOUTS.TIMEOUT_THRESHOLD;
const SLOW_RESPONSE_THRESHOLD = GENERATION_TIMEOUTS.SLOW_RESPONSE_THRESHOLD;

export const ThreadLoadingIndicator = memo(
    ({ className, size = "md" }: ThreadLoadingIndicatorProps) => {
        const isGenerating = useChatStore((state) => state.isGenerating);
        const generationStartTime = useChatStore((state) => state.generationStartTime);
        const showTimeoutIndicator = useChatStore((state) => state.showTimeoutIndicator);
        const setShowTimeoutIndicator = useChatStore((state) => state.setShowTimeoutIndicator);

        const [isSlowResponse, setIsSlowResponse] = useState(false);

        useEffect(() => {
            let timeoutTimer: NodeJS.Timeout | null = null;
            let slowResponseTimer: NodeJS.Timeout | null = null;

            if (isGenerating && generationStartTime) {
                // Show timeout indicator after 5 seconds
                timeoutTimer = setTimeout(() => {
                    setShowTimeoutIndicator(true);
                }, TIMEOUT_THRESHOLD);

                // Mark as slow response after 10 seconds
                slowResponseTimer = setTimeout(() => {
                    setIsSlowResponse(true);
                }, SLOW_RESPONSE_THRESHOLD);
            } else {
                setIsSlowResponse(false);
                setShowTimeoutIndicator(false);
            }

            return () => {
                if (timeoutTimer) clearTimeout(timeoutTimer);
                if (slowResponseTimer) clearTimeout(slowResponseTimer);
            };
        }, [isGenerating, generationStartTime, setShowTimeoutIndicator]);

        const sizeClasses = {
            sm: "h-6 w-6 md:h-8 md:w-8",
            md: "h-8 w-8 md:h-10 md:w-10",
            lg: "h-10 w-10 md:h-12 md:w-12",
        };

        const iconSizes = {
            sm: 14,
            md: 16,
            lg: 20,
        };

        const getLoadingState = () => {
            if (isSlowResponse) {
                return {
                    variant: "slow",
                    icon: null,
                    message: TIMEOUT_MESSAGES.SLOW_RESPONSE,
                    color: "text-muted-foreground",
                    bgColor: "bg-muted/50",
                    borderColor: "border-muted-foreground/20",
                    dots: "bg-muted-foreground/60",
                };
            }

            if (showTimeoutIndicator) {
                return {
                    variant: "timeout",
                    icon: null,
                    message: TIMEOUT_MESSAGES.TIMEOUT_WARNING,
                    color: "text-muted-foreground",
                    bgColor: "bg-muted/50",
                    borderColor: "border-muted-foreground/20",
                    dots: "bg-muted-foreground/60",
                };
            }
            return {
                variant: "generating",
                icon: null,
                message: TIMEOUT_MESSAGES.GENERATING,
                color: "text-muted-foreground",
                bgColor: "bg-muted/50",
                borderColor: "border-muted-foreground/20",
                dots: "bg-muted-foreground/60",
            };
        };

        const config = getLoadingState();

        return (
            <>
                {isGenerating && (
                    <div className={cn("flex w-full items-start gap-2 md:gap-3", className)}>
                        {/* Avatar with VT icon */}
                        <div
                            className={cn(
                                "relative flex flex-shrink-0 items-center justify-center rounded-xl overflow-hidden",
                                "bg-muted border-muted-foreground/20 border",
                                "shadow-sm",
                                sizeClasses[size],
                            )}
                        >
                            {/* Subtle shimmer for avatar */}
                            <div
                                className={cn(
                                    "absolute inset-0 -translate-x-full",
                                    "bg-gradient-to-r from-transparent via-white/5 to-transparent",
                                    "dark:via-white/3",
                                )}
                                style={{
                                    animation: "shimmer 3s infinite linear",
                                }}
                            />
                            <VTIcon size={iconSizes[size]} className="relative z-10" />

                            {/* Status indicator */}
                            <div
                                className={cn(
                                    "absolute -right-1 -top-1 rounded-full",
                                    "bg-muted-foreground/40",
                                    size === "sm"
                                        ? "h-3 w-3"
                                        : size === "md"
                                          ? "h-4 w-4"
                                          : "h-5 w-5",
                                )}
                            >
                                <div className="bg-background/60 h-full w-full rounded-full" />
                            </div>
                        </div>

                        {/* Loading Content */}
                        <div
                            className={cn(
                                "relative flex-1 rounded-2xl border shadow-sm overflow-hidden",
                                config.bgColor,
                                config.borderColor,
                                size === "sm"
                                    ? "gap-1.5 px-2 py-1.5 md:gap-2 md:px-3 md:py-2"
                                    : size === "md"
                                      ? "gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-3"
                                      : "gap-3 px-4 py-3 md:gap-4 md:px-5 md:py-4",
                            )}
                        >
                            {/* Shimmer effect background */}
                            <div
                                className={cn(
                                    "absolute inset-0 -translate-x-full",
                                    "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                                    "dark:via-white/5",
                                    "animate-shimmer",
                                )}
                                style={{
                                    animation: "shimmer 2s infinite linear",
                                }}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    {/* Status icon and message */}
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <span
                                            className={cn(
                                                "font-medium",
                                                config.color,
                                                size === "sm"
                                                    ? "text-xs"
                                                    : size === "md"
                                                      ? "text-xs md:text-sm"
                                                      : "text-sm md:text-base",
                                            )}
                                        >
                                            {config.message}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress indicator for slow responses */}
                            {(showTimeoutIndicator || isSlowResponse) && (
                                <div className="mt-1.5 md:mt-2">
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs md:gap-2">
                                        <span>
                                            {isSlowResponse
                                                ? "Large or complex request - please wait..."
                                                : "Request is taking longer than usual..."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    },
);

ThreadLoadingIndicator.displayName = "ThreadLoadingIndicator";
