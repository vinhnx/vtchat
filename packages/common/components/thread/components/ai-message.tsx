"use client";

import { MarkdownContent, markdownStyles } from "@repo/common/components";
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
 * Get display name for AI model
 */
function getModelDisplayName(mode: string): string {
    const modelMap: Record<string, string> = {
        "gpt-4o": "GPT-4o",
        "gpt-4o-mini": "GPT-4o Mini",
        "gpt-4-turbo": "GPT-4 Turbo",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
        "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
        "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
        "claude-3-opus-20240229": "Claude 3 Opus",
        "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
        "gemini-1.5-pro": "Gemini 1.5 Pro",
        "gemini-1.5-flash": "Gemini 1.5 Flash",
        "gemini-2.5-flash-lite-preview-06-17": "Gemini 2.5 Flash Lite",
        "o1-preview": "OpenAI o1 Preview",
        "o1-mini": "OpenAI o1 Mini",
        "deepseek-chat": "DeepSeek Chat",
        "llama-3.3-70b-versatile": "Llama 3.3 70B",
        "llama-3.1-8b-instant": "Llama 3.1 8B",
        "mixtral-8x7b-32768": "Mixtral 8x7B",
    };

    return modelMap[mode] || "VT Assistant";
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
                                "flex items-center gap-2 rounded-full border border-border/30 bg-muted/50 px-3 py-1",
                                "ai-message-badge",
                            )}
                        >
                            <Sparkles className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
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
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                </motion.div>
                            )}
                        </div>

                        {!isGenerating && (
                            <span className="text-xs text-muted-foreground">
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
                                "relative px-4 py-3",
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
