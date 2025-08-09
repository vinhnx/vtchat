"use client";

import { MarkdownContent, markdownStyles } from "@repo/common/components";
import { getModelDisplayName } from "@repo/shared/config";
import type { ThreadItem } from "@repo/shared/types";
import { cn } from "@repo/ui";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { memo, useRef } from "react";
import "./message-animations.css";

interface AIMessageProps {
    content: string;
    threadItem: ThreadItem;
    isGenerating?: boolean;
    isLast?: boolean;
    isCompleted?: boolean;
}

/**
 * Enhanced AI message component with avatar and visual differentiation
 * Provides clear distinction from user messages with left-aligned layout
 */
export const AIMessage = memo(
    ({
        content,
        threadItem,
        isGenerating = false,
        isLast = false,
        isCompleted = false,
    }: AIMessageProps) => {
        const contentRef = useRef<HTMLDivElement>(null);

        return (
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex w-full max-w-none", "message-container ai-message")}
                initial={{ opacity: 0, y: 5 }}
                transition={{
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                    type: "tween",
                }}
            >
                {/* Message container */}
                <div className="min-w-0 flex-1 space-y-2">
                    {/* AI badge and timestamp */}
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "border-border/30 bg-muted/50 flex items-center gap-2 rounded-full border px-3 py-1",
                                "ai-message-badge",
                            )}
                        >
                            <Sparkles className="text-muted-foreground h-3 w-3" />
                            <span className="text-muted-foreground text-xs font-medium">
                                {getModelDisplayName(threadItem.mode)}
                            </span>
                            {isGenerating && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "linear",
                                    }}
                                >
                                    <div className="bg-muted-foreground h-2 w-2 rounded-full" />
                                </motion.div>
                            )}
                        </div>

                        {!isGenerating && (
                            <span className="text-muted-foreground text-xs">
                                {new Date(threadItem.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </div>

                    {/* Content container */}
                    <div
                        className={cn(
                            "group relative",
                            "message-bubble",
                            "min-h-0 flex-1",
                            isGenerating ? "overflow-visible" : "overflow-hidden",
                        )}
                        style={{
                            // Remove containment during streaming to allow dynamic expansion
                            contain: isGenerating ? "none" : "layout",
                        }}
                    >
                        {/* Message content */}
                        <div
                            className={cn(
                                "relative px-4 py-3 pt-4", // Increased top padding
                                "min-h-[2rem] w-full",
                                "transition-all duration-200 ease-out",
                                // Add streaming class for enhanced expansion
                                isGenerating && "streaming-content",
                            )}
                            ref={contentRef}
                            role="article"
                            aria-label="AI response"
                            style={{
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                minHeight: isGenerating ? "2rem" : "auto",
                            }}
                        >
                            <MarkdownContent
                                content={content}
                                isCompleted={isCompleted}
                                isLast={isLast}
                                className={cn(
                                    "prose-sm max-w-none",
                                    "prose-headings:text-foreground prose-p:text-foreground",
                                    "prose-strong:text-foreground prose-code:text-foreground",
                                    "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
                                    "min-h-[1.5em] w-full",
                                    markdownStyles,
                                )}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    },
);

AIMessage.displayName = "AIMessage";
